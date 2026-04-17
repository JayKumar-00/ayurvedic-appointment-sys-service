import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { Server, Socket, type DefaultEventsMap } from 'socket.io';
import { ConfigService } from '../config/config.service';
import { REDIS_CLIENT } from '../redis/redis.service';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

type SocketUser = JwtPayload & {
  email?: string;
};

type SocketWithUser = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  { user?: SocketUser }
>;

type HospitalEventPayload = {
  hospitalId: string;
  data: unknown;
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  path: '/ws',
})
@Injectable()
export class WebSocketGatewayHandler
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server;

  private readonly logger = new Logger(WebSocketGatewayHandler.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {}

  afterInit(server: Server) {
    const pubClient = this.redisClient.duplicate();
    const subClient = this.redisClient.duplicate();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
    server.adapter(createAdapter(pubClient, subClient));
    this.logger.log('Redis adapter configured for WebSocket scaling');
  }

  async handleConnection(socket: SocketWithUser) {
    try {
      const token = this.extractToken(socket);
      const payload = await this.jwtService.verifyAsync<SocketUser>(token, {
        secret: this.configService.jwtAccessSecret,
      });

      socket.data.user = payload;

      const hospitalRoom = this.getHospitalRoom(payload.hospitalId);
      await socket.join(hospitalRoom);

      this.logger.log(
        `Socket connected for user ${payload.sub} in room ${hospitalRoom}`,
      );
    } catch (error) {
      this.logger.warn(`Socket auth failed: ${(error as Error).message}`);
      socket.emit('error', { message: 'Unauthorized' });
      socket.disconnect(true);
    }
  }

  handleDisconnect(socket: SocketWithUser) {
    const user = socket.data.user;
    if (!user) return;

    this.logger.log(`Socket disconnected for user ${user.sub}`);
  }

  emitAppointmentCreated(hospitalId: string, payload: unknown) {
    this.server
      .to(this.getHospitalRoom(hospitalId))
      .emit('appointmentCreated', payload);
  }

  emitAppointmentUpdated(hospitalId: string, payload: unknown) {
    this.server
      .to(this.getHospitalRoom(hospitalId))
      .emit('appointmentUpdated', payload);
  }

  emitPatientCreated(hospitalId: string, payload: unknown) {
    this.server
      .to(this.getHospitalRoom(hospitalId))
      .emit('patientCreated', payload);
  }

  @SubscribeMessage('appointmentCreated')
  onAppointmentCreated(
    @ConnectedSocket() socket: SocketWithUser,
    @MessageBody() payload: HospitalEventPayload,
  ) {
    this.assertSameHospital(socket, payload.hospitalId);
    this.emitAppointmentCreated(payload.hospitalId, payload.data);
  }

  @SubscribeMessage('appointmentUpdated')
  onAppointmentUpdated(
    @ConnectedSocket() socket: SocketWithUser,
    @MessageBody() payload: HospitalEventPayload,
  ) {
    this.assertSameHospital(socket, payload.hospitalId);
    this.emitAppointmentUpdated(payload.hospitalId, payload.data);
  }

  @SubscribeMessage('patientCreated')
  onPatientCreated(
    @ConnectedSocket() socket: SocketWithUser,
    @MessageBody() payload: HospitalEventPayload,
  ) {
    this.assertSameHospital(socket, payload.hospitalId);
    this.emitPatientCreated(payload.hospitalId, payload.data);
  }

  private getHospitalRoom(hospitalId: string): string {
    return `hospital:${hospitalId}`;
  }

  private extractToken(socket: SocketWithUser): string {
    const authPayload = socket.handshake.auth as
      | { token?: unknown }
      | undefined;
    const authToken = authPayload?.token;
    if (typeof authToken === 'string' && authToken.trim().length > 0) {
      return authToken;
    }

    const headerToken = socket.handshake.headers.authorization;
    if (typeof headerToken === 'string' && headerToken.startsWith('Bearer ')) {
      return headerToken.slice(7);
    }

    throw new UnauthorizedException('Missing access token');
  }

  private assertSameHospital(socket: SocketWithUser, hospitalId: string): void {
    const user = socket.data.user;
    if (!user || user.hospitalId !== hospitalId) {
      throw new UnauthorizedException('Hospital scope mismatch');
    }
  }
}
