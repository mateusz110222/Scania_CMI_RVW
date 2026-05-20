import { Controller, Get, Header, Param } from '@nestjs/common';
import { FileService } from './file.service';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get(':date/:filename')
  @Header('Content-Type', 'image/jpeg')
  @Header('Content-Disposition', 'inline')
  getFile(@Param('date') date: string, @Param('filename') filename: string) {
    return this.fileService.getFile(date, filename);
  }
}
