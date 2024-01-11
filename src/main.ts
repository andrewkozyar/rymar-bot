import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = await app.resolve(ConfigService);
  const port = configService.get<number>('PORT');

  await app.listen(port, () => {
    console.log(`Server start on port ${port} 🚀`);
  });
}
bootstrap();
