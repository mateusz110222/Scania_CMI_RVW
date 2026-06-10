import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { FileController } from './file/file.controller';
import { FileService } from './file/file.service';
import { UnitService } from './unit/unit.service';
import { UnitController } from './unit/unit.controller';
import { HttpModule } from '@nestjs/axios';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { existsSync } from 'fs';

const publicPath = join(__dirname, '..', 'public');

@Module({
  imports: [
    HttpModule,
    ...(existsSync(publicPath)
      ? [ServeStaticModule.forRoot({ rootPath: publicPath })]
      : []),
  ],
  controllers: [FileController, UnitController],
  providers: [AppService, FileService, UnitService],
})
export class AppModule {}
