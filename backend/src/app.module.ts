import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { FileController } from './file/file.controller';
import { FileService } from './file/file.service';
import { UnitService } from './unit/unit.service';
import { UnitController } from './unit/unit.controller';

@Module({
  imports: [],
  controllers: [FileController, UnitController],
  providers: [AppService, FileService, UnitService],
})
export class AppModule {}
