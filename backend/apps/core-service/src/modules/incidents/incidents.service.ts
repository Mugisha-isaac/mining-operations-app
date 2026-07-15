import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  ALLOWED_STATUS_TRANSITIONS,
  EventName,
  IncidentStatus,
  RABBITMQ_EXCHANGE,
} from '@minetech/common';
import { Incident } from './incident.entity';
import { CreateIncidentDto } from './create-incident.dto';
import { StorageService } from '../storage/storage.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

export interface AuthorContext {
  userId: string;
  tenantId: string;
  email: string;
}

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident) private readonly incidentRepo: Repository<Incident>,
    private readonly storageService: StorageService,
    private readonly amqpConnection: AmqpConnection,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async create(
    author: AuthorContext,
    dto: CreateIncidentDto,
    photo: Express.Multer.File,
  ): Promise<Incident & { photoUrl: string }> {
    if (!photo) throw new BadRequestException('An incident photo is required');

    const objectKey = await this.storageService.uploadIncidentPhoto(
      author.tenantId,
      photo.buffer,
      photo.mimetype,
      photo.originalname,
    );

    const incident = await this.incidentRepo.save(
      this.incidentRepo.create({
        tenantId: author.tenantId,
        title: dto.title,
        description: dto.description,
        location: dto.location,
        workerId: dto.workerId ?? null,
        status: IncidentStatus.REPORTED,
        photoObjectKey: objectKey,
        reportedByUserId: author.userId,
        reportedByEmail: author.email,
      }),
    );

    // 1) Live update: every other open dashboard session for this tenant
    //    sees the new incident without refreshing.
    const withPhotoUrl = await this.withPhotoUrl(incident);
    this.realtimeGateway.emitIncidentCreated(author.tenantId, withPhotoUrl);

    // 2) Fire-and-forget event onto RabbitMQ. notification-service consumes
    //    this and enriches it via a gRPC call back into this service - the
    //    event itself only carries identifiers, not the full record.
    await this.amqpConnection.publish(RABBITMQ_EXCHANGE, EventName.INCIDENT_CREATED, {
      incidentId: incident.id,
      tenantId: incident.tenantId,
    });

    return withPhotoUrl;
  }

  async findAll(tenantId: string): Promise<Array<Incident & { photoUrl: string }>> {
    const incidents = await this.incidentRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    return Promise.all(incidents.map((incident) => this.withPhotoUrl(incident)));
  }

  async findOneOrThrow(tenantId: string, id: string): Promise<Incident> {
    const incident = await this.incidentRepo.findOne({ where: { id, tenantId } });
    if (!incident) throw new NotFoundException('Incident not found');
    return incident;
  }

  async updateStatus(tenantId: string, id: string, nextStatus: IncidentStatus): Promise<Incident> {
    const incident = await this.findOneOrThrow(tenantId, id);
    const allowed = ALLOWED_STATUS_TRANSITIONS[incident.status];
    if (!allowed.includes(nextStatus)) {
      throw new BadRequestException(
        `Cannot move incident from ${incident.status} to ${nextStatus}`,
      );
    }
    incident.status = nextStatus;
    return this.incidentRepo.save(incident);
  }

  async countOpen(tenantId: string): Promise<number> {
    return this.incidentRepo
      .createQueryBuilder('incident')
      .where('incident.tenantId = :tenantId', { tenantId })
      .andWhere('incident.status != :resolved', { resolved: IncidentStatus.RESOLVED })
      .getCount();
  }

  async countResolvedToday(tenantId: string): Promise<number> {
    return this.incidentRepo
      .createQueryBuilder('incident')
      .where('incident.tenantId = :tenantId', { tenantId })
      .andWhere('incident.status = :resolved', { resolved: IncidentStatus.RESOLVED })
      .andWhere(`incident."updatedAt" >= date_trunc('day', now())`)
      .getCount();
  }

  private async withPhotoUrl(incident: Incident): Promise<Incident & { photoUrl: string }> {
    const photoUrl = await this.storageService.getPresignedPhotoUrl(incident.photoObjectKey);
    return { ...incident, photoUrl };
  }
}
