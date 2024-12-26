import { Test, TestingModule } from '@nestjs/testing';
import { GithubBatchService } from './github-batch.service';

describe('GithubBatchService', () => {
  let service: GithubBatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GithubBatchService],
    }).compile();

    service = module.get<GithubBatchService>(GithubBatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
