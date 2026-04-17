import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { WebsocketModule } from './websocket/websocket.module';
import { QueuesModule } from './queues/queues.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { RedisModule } from './redis/redis.module';
import { UserModule } from './user/user.module';
import { AppointmentsModule } from './appointments/appointments.module';

@Module({
  imports: [
    ConfigModule,
    RedisModule,
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.mongoUri,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    AppointmentsModule,
    WebsocketModule,
    QueuesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
