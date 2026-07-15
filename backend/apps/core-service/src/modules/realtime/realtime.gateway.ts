import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload, SocketEvent } from '@minetech/common';

/**
 * One socket.io room per tenant ("tenant:<id>"), so an incident reported by
 * one session shows up live for every other open session of the SAME
 * tenant, and only that tenant. Auth token is passed as a handshake query
 * param and verified with the same JWT secret used everywhere else.
 */
@WebSocketGateway({ cors: { origin: '*' }, namespace: '/realtime' })
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(@ConnectedSocket() client: Socket) {
    const token = client.handshake.query.token as string | undefined;
    if (!token) {
      client.disconnect();
      return;
    }
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      client.data.tenantId = payload.tenantId;
      client.join(`tenant:${payload.tenantId}`);
      this.logger.log(`Client ${client.id} joined tenant:${payload.tenantId}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  emitIncidentCreated(tenantId: string, incident: unknown) {
    this.server.to(`tenant:${tenantId}`).emit(SocketEvent.INCIDENT_CREATED, incident);
  }

  emitDashboardStatsUpdated(tenantId: string, stats: unknown) {
    this.server.to(`tenant:${tenantId}`).emit(SocketEvent.DASHBOARD_STATS_UPDATED, stats);
  }
}
