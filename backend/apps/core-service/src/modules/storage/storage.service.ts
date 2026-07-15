import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { randomUUID } from 'crypto';

/**
 * Thin wrapper around the MinIO SDK: bucket bootstrap, upload, and
 * presigned read URLs for incident photos. Nothing here is mocked - it
 * talks to whatever MinIO endpoint is configured (see docker-compose.infra.yml).
 */
@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    const minioConfig = this.config.get('minio');
    this.bucket = minioConfig.bucket;
    this.client = new Client({
      endPoint: minioConfig.endpoint,
      port: minioConfig.port,
      useSSL: minioConfig.useSSL,
      accessKey: minioConfig.accessKey,
      secretKey: minioConfig.secretKey,
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket);
        this.logger.log(`Created MinIO bucket "${this.bucket}"`);
      }
    } catch (err) {
      this.logger.warn(`Could not verify/create MinIO bucket on startup: ${(err as Error).message}`);
    }
  }

  async uploadIncidentPhoto(
    tenantId: string,
    buffer: Buffer,
    mimeType: string,
    originalName: string,
  ): Promise<string> {
    const extension = originalName.split('.').pop() || 'jpg';
    const objectKey = `${tenantId}/incidents/${randomUUID()}.${extension}`;
    await this.client.putObject(this.bucket, objectKey, buffer, buffer.length, {
      'Content-Type': mimeType,
    });
    return objectKey;
  }

  async getPresignedPhotoUrl(objectKey: string, expirySeconds = 3600): Promise<string> {
    return this.client.presignedGetObject(this.bucket, objectKey, expirySeconds);
  }
}
