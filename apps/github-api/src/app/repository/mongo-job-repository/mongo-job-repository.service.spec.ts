import { Test, TestingModule } from '@nestjs/testing';
import { MongoJobRepository } from './mongo-job-repository.service';

describe('MongoJobRepositoryService', () => {
  let service: MongoJobRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MongoJobRepository],
    }).compile();

    service = module.get<MongoJobRepository>(MongoJobRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
