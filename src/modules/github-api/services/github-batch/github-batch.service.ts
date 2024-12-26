import { Injectable } from '@nestjs/common';
import { JobFactory, JobLauncher } from 'src/modules/batch-core/job';

@Injectable()
export class GithubBatchService {
  constructor(
    private readonly jobLauncher: JobLauncher,
    private readonly jobFactory: JobFactory,
  ) {}
}
