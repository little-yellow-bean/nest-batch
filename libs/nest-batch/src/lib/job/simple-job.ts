import { Job } from './job';
import { ExecutionStatus, JobExecution } from '../execution';

export class SimpleJob extends Job {
  override async processSteps(jobId: string) {
    let jobExecution: JobExecution;
    for (const step of this.steps) {
      jobExecution = await this.jobRepository.findJobExecutionById(jobId);
      if (jobExecution.isStopping()) {
        return ExecutionStatus.STOPPED;
      }
      await step.execute(jobExecution);
    }
    return ExecutionStatus.COMPLETED;
  }
}
