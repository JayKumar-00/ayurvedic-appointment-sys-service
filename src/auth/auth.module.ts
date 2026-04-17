import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshToken, RefreshTokenSchema } from './schemas/refresh-token.schema';
import { ConfigModule } from '../config/config.module';
import { AdminUser, AdminUserSchema } from '../user/admin-user/schemas/admin-user.schema';
import { Staff, StaffSchema } from '../user/entity/user.entity';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: AdminUser.name, schema: AdminUserSchema },
      { name: Staff.name, schema: StaffSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
