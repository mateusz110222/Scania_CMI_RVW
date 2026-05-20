import { Test, TestingModule } from '@nestjs/testing';
import { FileController } from './file.controller';
import { beforeEach, describe } from 'node:test';

describe('FileController', () => {
  let controller: FileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
    }).compile();

    controller = module.get<FileController>(FileController);
  });
});
