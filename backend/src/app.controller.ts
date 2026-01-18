import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): object {
    return {
      message: 'FlexSpace API is running! 🚀',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/api/auth',
        health: '/api/health',
      },
    };
  }

  @Public()
  @Get('health')
  healthCheck(): object {
    return {
      status: 'ok',
      database: 'connected',
      uptime: process.uptime(),
    };
  }
}
