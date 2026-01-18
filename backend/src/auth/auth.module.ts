import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<StringValue>('JWT_EXPIRATION') ?? '24h',
        },
      }),
    }),
  ],
  controllers: [AuthController], // ✅ OBLIGATOIRE
  providers: [
    AuthService, // ✅
    JwtStrategy, // ✅
    RolesGuard, // (si utilisé)
  ],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
