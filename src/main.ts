import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = await app.resolve(ConfigService);
  const port = configService.get<number>('PORT');

  fs.writeFile(
    'GOOGLE_SHEETS_DATA.json',
    process.env.GOOGLE_SHEETS_DATA,
    (e) => {
      if (e) {
        console.log(e);
      } else {
        console.log('GOOGLE_SHEETS_DATA.json created!');
      }
    },
  );

  await app.listen(port, () => {
    console.log(`Server start on port ${port} 🚀`);
  });
}
bootstrap();
