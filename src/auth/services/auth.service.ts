import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createHash, randomBytes } from 'crypto';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '../schemas/refresh-token.schema';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { LoginDto } from '../dto/login.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { RefreshDto } from '../dto/refresh.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { JwtPayload } from '../strategies/jwt.strategy';
import { ConfigService } from '../../config/config.service';
import * as bcrypt from 'bcrypt';
import {
  AdminUser,
  AdminUserDocument,
} from '../../user/admin-user/schemas/admin-user.schema';
import { Staff, StaffDocument } from '../../user/entity/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
    @InjectModel(AdminUser.name)
    private readonly adminUserModel: Model<AdminUserDocument>,
    @InjectModel(Staff.name)
    private readonly staffModel: Model<StaffDocument>,
  ) {}

  async login(loginDto: LoginDto) {
    const email = loginDto.email.toLowerCase();

    const adminUser = await this.adminUserModel.findOne({
      email: loginDto.email.toLowerCase(),
      isActive: true,
    });

    if (adminUser) {
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        adminUser.passwordHash,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      if (!adminUser.isSystemAdmin && !adminUser.isAdmin && !adminUser.roleId) {
        throw new UnauthorizedException('Role is not assigned to this account');
      }

      const roleId = this.resolveRoleId(adminUser);

      const payload: JwtPayload = {
        sub: adminUser.id,
        email: adminUser.email,
        roleId,
        hospitalId: adminUser.hospitalId ?? '',
        isSystemAdmin: adminUser.isSystemAdmin,
        isAdmin: adminUser.isAdmin,
      };

      return this.issueTokens(payload);
    }

    const staffUser = await this.staffModel
      .findOne({
        email,
        isActive: true,
      })
      .populate('roleId', 'name permissions')
      .exec();

    if (!staffUser) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isStaffPasswordValid = await this.verifyStaffPassword(
      loginDto.password,
      staffUser.password,
    );

    if (!isStaffPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const staffRole = this.extractRoleDetails(staffUser.roleId);

    const payload: JwtPayload = {
      sub: staffUser.id,
      email: staffUser.email,
      roleId: this.resolveObjectIdString(staffUser.roleId),
      hospitalId: staffUser.hospitalId?.toString() ?? '',
      isSystemAdmin: false,
      isAdmin: false,
    };

    return this.issueTokens(payload, {
      roleId: staffRole ?? payload.roleId,
    });
  }

  async refresh(refreshDto: RefreshDto) {
    if (!refreshDto.refreshToken) {
      throw new BadRequestException('refreshToken is required');
    }

    let decoded: JwtPayload & {
      iat?: number;
      exp?: number;
      nbf?: number;
      aud?: string | string[];
      iss?: string;
      jti?: string;
    };
    try {
      decoded = await this.jwtService.verifyAsync<JwtPayload>(
        refreshDto.refreshToken,
        {
          secret: this.configService.jwtRefreshSecret,
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const storedToken = await this.refreshTokenModel.findOne({
      userId: decoded.sub,
      token: refreshDto.refreshToken,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token is revoked or expired');
    }

    storedToken.isRevoked = true;
    await storedToken.save();

    const payload: JwtPayload = {
      sub: decoded.sub,
      email: decoded.email,
      roleId: decoded.roleId,
      hospitalId: decoded.hospitalId,
      isSystemAdmin: decoded.isSystemAdmin,
      isAdmin: decoded.isAdmin,
    };

    return this.issueTokens(payload);
  }

  async logout(refreshDto: RefreshDto) {
    if (!refreshDto.refreshToken) {
      throw new BadRequestException('refreshToken is required');
    }

    await this.refreshTokenModel.updateOne(
      { token: refreshDto.refreshToken, isRevoked: false },
      { $set: { isRevoked: true } },
    );

    return { message: 'Logged out successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const email = forgotPasswordDto.email.toLowerCase();
    const adminUser = await this.adminUserModel.findOne({
      email,
      isActive: true,
    });
    const staffUser = adminUser
      ? null
      : await this.staffModel.findOne({ email, isActive: true });

    // Return a generic response even if the account is not found.
    if (!adminUser && !staffUser) {
      return {
        message:
          'If an account exists for this email, a reset link has been generated.',
      };
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetTokenHash = this.hashResetToken(resetToken);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 7);

    if (adminUser) {
      adminUser.resetTokenHash = resetTokenHash;
      adminUser.resetTokenExpiresAt = expiresAt;
      await adminUser.save();
    } else if (staffUser) {
      staffUser.set({
        resetTokenHash,
        resetTokenExpiresAt: expiresAt,
      });
      await staffUser.save();
    }

    return {
      message:
        'If an account exists for this email, a reset link has been generated.',
      resetToken,
      expiresAt,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const tokenHash = this.hashResetToken(resetPasswordDto.resetToken);
    const adminUser = await this.adminUserModel.findOne({
      resetTokenHash: tokenHash,
      resetTokenExpiresAt: { $gt: new Date() },
      isActive: true,
    });

    if (adminUser) {
      adminUser.passwordHash = await bcrypt.hash(
        resetPasswordDto.newPassword,
        10,
      );
      adminUser.resetTokenHash = undefined;
      adminUser.resetTokenExpiresAt = undefined;
      await adminUser.save();

      return { message: 'Password reset successful' };
    }

    const staffUser = await this.staffModel.findOne({
      resetTokenHash: tokenHash,
      resetTokenExpiresAt: { $gt: new Date() },
      isActive: true,
    });

    if (!staffUser) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    staffUser.password = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    staffUser.set({
      resetTokenHash: undefined,
      resetTokenExpiresAt: undefined,
    });
    await staffUser.save();

    return { message: 'Password reset successful' };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const adminUser = await this.adminUserModel.findById(userId);

    if (adminUser) {
      const isCurrentPasswordValid = await bcrypt.compare(
        changePasswordDto.currentPassword,
        adminUser.passwordHash,
      );

      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      adminUser.passwordHash = await bcrypt.hash(
        changePasswordDto.newPassword,
        10,
      );
      adminUser.resetTokenHash = undefined;
      adminUser.resetTokenExpiresAt = undefined;
      await adminUser.save();

      return { message: 'Password changed successfully' };
    }

    const staffUser = await this.staffModel.findById(userId);

    if (!staffUser) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await this.verifyStaffPassword(
      changePasswordDto.currentPassword,
      staffUser.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    staffUser.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    staffUser.set({
      resetTokenHash: undefined,
      resetTokenExpiresAt: undefined,
    });
    await staffUser.save();

    return { message: 'Password changed successfully' };
  }

  async getProfile(userId: string) {
    const adminUser = await this.adminUserModel.findById(userId);

    if (adminUser) {
      return {
        id: adminUser.id,
        email: adminUser.email,
        roleId: adminUser.roleId,
        hospitalId: adminUser.hospitalId ?? '',
        isSystemAdmin: adminUser.isSystemAdmin,
        isAdmin: adminUser.isAdmin,
      };
    }

    const staffUser = await this.staffModel
      .findById(userId)
      .populate('roleId', 'name permissions')
      .populate('hospitalId', 'name code')
      .exec();

    if (staffUser) {
      const staffRole = this.extractRoleDetails(staffUser.roleId);

      return {
        id: staffUser.id,
        email: staffUser.email,
        roleId: staffRole ?? this.resolveObjectIdString(staffUser.roleId),
        hospitalId: this.resolveObjectIdString(staffUser.hospitalId),
        isSystemAdmin: false,
        isAdmin: false,
      };
    }

    throw new NotFoundException('User not found');
  }

  private async issueTokens(
    payload: JwtPayload,
    userOverrides?: { roleId?: unknown },
  ) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.jwtAccessSecret,
        expiresIn: '7d',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.jwtRefreshSecret,
        expiresIn: '7d',
      }),
    ]);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 15);

    await this.refreshTokenModel.create({
      userId: payload.sub,
      token: refreshToken,
      expiresAt,
      isRevoked: false,
    });

    const user = {
      id: payload.sub,
      email: payload.email ?? '',
      roleId: userOverrides?.roleId ?? payload.roleId,
      hospitalId: payload.hospitalId,
      isSystemAdmin: payload.isSystemAdmin,
      isAdmin: payload.isAdmin,
    };

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60,
      tokenType: 'Bearer',
      user,
    };
  }

  private resolveRoleId(user: {
    roleId?: string;
    isSystemAdmin: boolean;
    isAdmin: boolean;
  }): string | undefined {
    if (user.roleId) {
      return user.roleId;
    }

    if (user.isSystemAdmin) {
      return 'role-sys-admin';
    }

    if (user.isAdmin) {
      return undefined;
    }

    throw new UnauthorizedException('Role is not assigned to this account');
  }

  private hashResetToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async verifyStaffPassword(
    plainPassword: string,
    storedPassword: string,
  ): Promise<boolean> {
    // Backward compatible: support old plain-text staff passwords and newer bcrypt hashes.
    if (
      storedPassword.startsWith('$2a$') ||
      storedPassword.startsWith('$2b$')
    ) {
      return bcrypt.compare(plainPassword, storedPassword);
    }

    return plainPassword === storedPassword;
  }

  private extractRoleDetails(roleValue: unknown):
    | {
        id: string;
        name: string;
        permissions: unknown[];
      }
    | undefined {
    if (!roleValue || typeof roleValue !== 'object') {
      return undefined;
    }

    const role = roleValue as {
      id?: string;
      _id?: unknown;
      name?: string;
      permissions?: unknown[];
    };

    const roleId = role.id ?? this.resolveObjectIdString(role._id);
    if (!roleId) {
      return undefined;
    }

    return {
      id: roleId,
      name: role.name ?? '',
      permissions: Array.isArray(role.permissions) ? role.permissions : [],
    };
  }

  private resolveObjectIdString(value: unknown): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object' && 'toString' in value) {
      const stringified = (value as { toString: () => string }).toString();
      return stringified === '[object Object]' ? '' : stringified;
    }

    return '';
  }
}
