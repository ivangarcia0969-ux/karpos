import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt.guard.js';
import { PermissionsGuard } from './guards/permissions.guard.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [AuthService, JwtAuthGuard, PermissionsGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class IamModule {}
