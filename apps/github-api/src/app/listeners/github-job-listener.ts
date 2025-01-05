import { Logger } from '@nestjs/common';
import { JobExecution, JobListener } from 'nest-batch';

export class GithubJobListener implements JobListener {
  private readonly logger = new Logger(GithubJobListener.name);
  async beforeJob?(jobExecution: JobExecution): Promise<void> {
    this.logger.log(`Before job: ${jobExecution.getName()}`);
  }
  async afterJob?(jobExecution: JobExecution): Promise<void> {
    this.logger.log(`After job: ${jobExecution.getName()}`);
  }
  async onJobError?(jobExecution: JobExecution, error: Error): Promise<void> {
    this.logger.error(
      `Error in job: ${jobExecution.getName()}. Error: ${error.message}`
    );
  }
}
