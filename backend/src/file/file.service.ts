import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { stat } from 'fs/promises';
import { isMatch } from 'date-fns';
import { createReadStream } from 'node:fs';

@Injectable()
export class FileService {
  async getFile(date: string, filename: string): Promise<StreamableFile> {
    if (!isMatch(date,'yyMMdd')) {
      throw new NotFoundException('Invalid date format');
    }

    const path = `/mnt/samba/${date}/${filename}`;

    try {
      await stat(path);
    } catch {
      throw new NotFoundException('File not found');
    }

    return new StreamableFile(createReadStream(path));
  }
}
