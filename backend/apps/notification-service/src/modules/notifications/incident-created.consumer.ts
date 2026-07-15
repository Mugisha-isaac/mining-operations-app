import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { EventName, INCIDENT_NOTIFICATIONS_QUEUE, JobName, QueueName, RABBITMQ_EXCHANGE } from '@minetech/common';

interface IncidentCreatedEvent {
  incidentId: string;
  tenantId: string;
}

/**
 * Listens for incident.created on the shared exchange (published by
 * core-service) and hands the work off to a Bull queue rather than doing
 * the gRPC call + "send" inline - so a slow downstream notification
 * provider never blocks message acknowledgement.
 */
@Injectable()
export class IncidentCreatedConsumer {
  private readonly logger = new Logger(IncidentCreatedConsumer.name);

  constructor(@InjectQueue(QueueName.NOTIFICATIONS) private readonly notificationsQueue: Queue) {}

  @RabbitSubscribe({
    exchange: RABBITMQ_EXCHANGE,
    routingKey: EventName.INCIDENT_CREATED,
    queue: INCIDENT_NOTIFICATIONS_QUEUE,
  })
  async handleIncidentCreated(event: IncidentCreatedEvent) {
    this.logger.log(`Received incident.created for ${event.incidentId}, queueing notification job`);
    await this.notificationsQueue.add(JobName.SEND_INCIDENT_NOTIFICATION, event, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }
}
