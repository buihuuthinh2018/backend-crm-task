import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  
  // Enable CORS
  app.enableCors();
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // Global prefix for all routes
  app.setGlobalPrefix('api');
  
  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('CRM Task Management API')
    .setDescription('API documentation for CRM Task Management System')
    .setVersion('1.0')
    .addTag('Auth', 'User authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Projects', 'Project management endpoints')
    .addTag('Tasks', 'Task management endpoints')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access_token',
    )
    .setContact(
      'Support',
      'https://example.com',
      'support@example.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      filter: true,
      showRequestHeaders: true,
      deepLinking: true,
    },
    customCss: `
      .topbar { display: none; }
      .info .title { color: #1976d2; font-size: 32px; }
      .scheme-container { background-color: #f5f5f5; }
    `,
    customJs: [
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.js',
    ],
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
  console.log(`Swagger documentation available at: http://localhost:${port}/docs`);
}
bootstrap();
