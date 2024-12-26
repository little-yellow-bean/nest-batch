import { Logger } from '@nestjs/common';
import { StepExecution } from 'src/modules/batch-core/execution';
import { StepListener } from 'src/modules/batch-core/listener';

export class GithubStepListener implements StepListener {
  private readonly logger = new Logger(GithubStepListener.name);
  async beforeStep(stepExecution: StepExecution): Promise<void> {
    this.logger.log(`Before step: ${stepExecution.getName()}`);
  }
  async afterStep(stepExecution: StepExecution): Promise<void> {
    this.logger.log(`After step: ${stepExecution.getName()}`);
  }
  async onStepError(stepExecution: StepExecution, error: Error): Promise<void> {
    this.logger.error(
      `Error in step: ${stepExecution.getName()}. Error: ${error.message}`,
    );
  }
}
