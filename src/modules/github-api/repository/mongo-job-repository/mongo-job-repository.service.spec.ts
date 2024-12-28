import { Test, TestingModule } from '@nestjs/testing';
import { MongoJobRepositoryService } from './mongo-job-repository.service';

describe('MongoJobRepositoryService', () => {
  let service: MongoJobRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MongoJobRepositoryService],
    }).compile();

    service = module.get<MongoJobRepositoryService>(MongoJobRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
