import { Injectable } from '@nestjs/common';
import { JobRepository } from '../repository/job-repository.interface';
import { BatchConfig } from '../config/batch.config';
import { Job } from './job.interface';
import { JobExecution, BatchStatus } from '../models/job-execution.model';

@Injectable()
export class JobLauncher {
  constructor(
    private jobRepository: JobRepository,
    private config: BatchConfig,
  ) {}

  async run(job: Job, parameters: Record<string, any>): Promise<JobExecution> {
    if (!this.config.concurrency.allowConcurrentExecutions) {
      const runningJob = await this.jobRepository.findRunningJob(
        job.name,
        parameters,
      );
      if (runningJob) {
        throw new Error(
          `Job ${job.name} with parameters ${JSON.stringify(
            parameters,
          )} is already running`,
        );
      }
    }

    const jobExecution: JobExecution = {
      id: crypto.randomUUID(),
      jobName: job.name,
      parameters,
      status: BatchStatus.STARTING,
      createTime: new Date(),
      lastUpdated: new Date(),
      version: 0,
      retryCount: 0,
    };

    await this.jobRepository.saveJobExecution(jobExecution);

    try {
      await job.execute(jobExecution);
      jobExecution.status = BatchStatus.COMPLETED;
    } catch (error) {
      jobExecution.status = BatchStatus.FAILED;
      jobExecution.exitMessage = error.message;
      throw error;
    } finally {
      jobExecution.endTime = new Date();
      await this.jobRepository.updateJobExecution(jobExecution);
    }

    return jobExecution;
  }
}
