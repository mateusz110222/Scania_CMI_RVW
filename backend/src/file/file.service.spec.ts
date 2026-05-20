import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';
import { beforeEach, describe } from 'node:test';

describe('FileService', () => {
  let service: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileService],
    }).compile();

    service = module.get<FileService>(FileService);
  });
});
