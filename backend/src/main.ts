import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS
  const corsOptions: CorsOptions = {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) {
        return callback(null, true);
      }

      const allowedOrigins = ['http://localhost:3001', process.env.FRONTEND_URL].filter(
        Boolean,
      ) as string[];

      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  };

  app.enableCors(corsOptions);

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
