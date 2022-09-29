import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as Path from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
        rootPath: Path.join(__dirname, '..', '..', 'front', 'dist'),
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
