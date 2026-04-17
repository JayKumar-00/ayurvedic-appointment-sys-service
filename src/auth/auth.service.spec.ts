import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';
import { ConfigService } from '../config/config.service';
import { RefreshToken } from './schemas/refresh-token.schema';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: {} },
        { provide: ConfigService, useValue: {
          jwtAccessSecret: 'test-access-secret',
          jwtRefreshSecret: 'test-refresh-secret',
        }},
        { provide: getModelToken(RefreshToken.name), useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
