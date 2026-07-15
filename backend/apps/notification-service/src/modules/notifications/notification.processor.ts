import { Inject, Logger } from '@nestjs/common';
import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JobName, QueueName } from '@minetech/common';
import { OPERATIONS_CLIENT } from '../../grpc-client/operations-grpc-client.module';
import { OperationsServiceGrpc } from '../../grpc-client/operations.interface';

interface IncidentCreatedJobData {
  incidentId: string;
  tenantId: string;
}

/**
 * The actual background job: run through Bull/Redis, enrich the bare event
 * with a real gRPC call into core-service, then "send" the notification.
 * There is no external email/SMS provider wired up for this warm-up task,
 * so sending means a structured pino log line - but every other hop
 * (queue, gRPC, retry policy) is real.
 */
@Processor(QueueName.NOTIFICATIONS)
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);
  private readonly operationsService: OperationsServiceGrpc;

  constructor(@Inject(OPERATIONS_CLIENT) private readonly client: ClientGrpc) {
    this.operationsService = this.client.getService<OperationsServiceGrpc>('OperationsService');
  }

  @Process(JobName.SEND_INCIDENT_NOTIFICATION)
  async sendIncidentNotification(job: Job<IncidentCreatedJobData>) {
    const { incidentId, tenantId } = job.data;

    const detail = await firstValueFrom(
      this.operationsService.getIncidentDetail({ incidentId, tenantId }),
    );

    this.logger.log({
      msg: 'Incident notification dispatched',
      incidentId: detail.id,
      tenantId: detail.tenantId,
      title: `New safety incident at ${detail.location}`,
      status: detail.status,
      worker: detail.workerName,
      reportedBy: detail.reportedByEmail,
      createdAt: detail.createdAt,
    });

    return { delivered: true, incidentId: detail.id };
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    this.logger.error(`Notification job ${job.id} failed: ${err.message}`);
  }
}
