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

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 FlexSpace API running on port ${port}`);
  console.log(`📚 Health check: http://localhost:${port}/api/health`);

  // Attendre la DB
  const prisma = app.get(PrismaService);
  const maxRetries = 30;
  let retries = maxRetries;

  while (retries > 0) {
    try {
      await prisma.$connect();
      console.log('✅ Database connected');
      break;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      retries--;
      console.log(`⏳ Waiting for database... (${maxRetries - retries}/${maxRetries})`);
      await new Promise((res) => setTimeout(res, 5000)); // délai plus long
    }
  }

  if (retries === 0) {
    console.error('❌ Could not connect to the database. Continuing without DB...');
  }
}
bootstrap();
