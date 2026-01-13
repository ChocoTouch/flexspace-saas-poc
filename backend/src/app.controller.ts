import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): object {
    return {
      message: 'FlexSpace API is running! 🚀',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        docs: '/api/docs',
      },
    };
  }

  @Get('health')
  healthCheck(): object {
    return {
      status: 'ok',
      database: 'connected',
      uptime: process.uptime(),
    };
  }
}
