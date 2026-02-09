import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  // Attendre la DB
  const prisma = app.get(PrismaService);

  let retries = 10;
  while (retries) {
    try {
      await prisma.$connect();
      console.log('✅ Database connected');
      break;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      retries--;
      console.log('⏳ Waiting for database...');
      await new Promise((res) => setTimeout(res, 3000));
    }
  }

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 FlexSpace API running on port ${port}`);
  console.log(`📚 Health check: http://localhost:${port}/api/health`);
}
bootstrap();
