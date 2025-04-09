import { NestFactory, Reflector } from '@nestjs/core';
import {
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });

  const app = await NestFactory.create(AppModule, { abortOnError: true });

  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Knowledge Base API')
    .setDescription('A RESTful API for a Dynamic Knowledge Base System')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addServer('http://localhost:3000', 'Localhost')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
