import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '../../config/config.service';

export type JwtPayload = {
  sub: string;
  email?: string;
  roleId?: string;
  hospitalId: string;
  isSystemAdmin: boolean;
  isAdmin: boolean;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwtAccessSecret,
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
