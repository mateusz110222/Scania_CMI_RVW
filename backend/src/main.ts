import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { existsSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const publicPath = join(__dirname, '..', 'public');
  if (existsSync(publicPath)) {
    console.log(`Serving frontend from: ${publicPath}`);
  }

  await app.listen(process.env.NEST_PORT ?? 3001);
}
bootstrap();
