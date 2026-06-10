import { Controller, Get, Param, Res } from '@nestjs/common';
import express from 'express';
import { FileService } from './file.service';
import * as path from 'path';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get(':date/:filename')
  async getFile(
    @Param('date') date: string,
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const ext = path.extname(filename).toLowerCase();

    let contentType = 'application/octet-stream';
    if (ext === '.svg') {
      contentType = 'image/svg+xml';
    } else if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    }

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': 'inline',
    });

    return await this.fileService.getFile(date, filename);
  }
}
