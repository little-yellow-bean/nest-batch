import { Injectable, Logger } from '@nestjs/common';
import { JobFactory, JobLauncher } from 'src/modules/batch-core/job';
import { GithubApiService } from '../github-api/github-api.service';
import { GithubJobListener } from '../../listeners/github-job-listener';
import { GithubStepListener } from '../../listeners/github-step-listener';
import { GithubApiReader } from '../../readers/github-api-reader';
import { GithubApiProcessor } from '../../processors/github-api-processor';
import { GithubApiWriter } from '../../writers/github-api-writer';

@Injectable()
export class GithubBatchService {
  private readonly logger = new Logger(GithubBatchService.name);
  constructor(
    private readonly jobLauncher: JobLauncher,
    private readonly jobFactory: JobFactory,
    private githubApiService: GithubApiService,
  ) {
    // this.runBatch();
  }

  async runBatch() {
    const job = this.jobFactory
      .jobBuilder('Github-api-bacth-job')
      .listeners([new GithubJobListener()])
      .step({
        reader: new GithubApiReader(this.githubApiService),
        processor: new GithubApiProcessor(),
        writer: new GithubApiWriter(),
        listeners: [new GithubStepListener()],
        name: 'Github-repo-processing',
      })
      .build();
    const jobExecution = await this.jobLauncher.run(job);
    this.logger.log(`Job Execution Id: ${jobExecution.getId()}`);
  }
}