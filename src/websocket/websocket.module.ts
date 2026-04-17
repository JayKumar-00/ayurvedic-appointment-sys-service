import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WebsocketService } from './websocket.service';
import { WebSocketGatewayHandler } from './websocket.gateway';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [JwtModule.register({}), RedisModule],
  providers: [WebSocketGatewayHandler, WebsocketService],
  exports: [WebSocketGatewayHandler],
})
export class WebsocketModule {}
