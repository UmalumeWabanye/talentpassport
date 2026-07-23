import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configureDocs(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Talent Passport API')
    .setDescription('Backend REST API documentation for Talent Passport.')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
    yamlDocumentUrl: 'api/docs-yaml'
  });
}