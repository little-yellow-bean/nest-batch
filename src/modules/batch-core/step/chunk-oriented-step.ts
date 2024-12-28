import { v4 as uuid } from 'uuid';
import { Step } from './step';
import { StepExecution, ExecutionStatus, JobExecution } from '../execution';
import { chunkArray } from '../utils';

export class ChunkOrientedStep<I, O> extends Step<I, O> {
  override async execute(jobExecution: JobExecution): Promise<StepExecution> {
    if (!this.reader || !this.writer) {
      throw new Error('Reader and writer must be configured');
    }

    if (!this.jobRepository) {
      throw new Error('Job Repository is required');
    }

    if (!this.name?.trim()?.length) {
      throw new Error('Step name is required');
    }

    const stepExecution = new StepExecution()
      .setId(uuid())
      .setCreateTime(new Date())
      .setJobExecution(jobExecution)
      .setName(this.name)
      .transitionStatus(ExecutionStatus.CREATED)
      .setLastUpdatedTime(new Date());
    try {
      await this.jobRepository.saveStepExecution(stepExecution);
      await this.notifyListenersBeforeStep(stepExecution);
      await this.jobRepository.updateStepExecutionById(stepExecution.getId(), {
        status: ExecutionStatus.STARTING,
        startTime: new Date(),
        lastUpdatedTime: new Date(),
      });

      // TODO: Add pre-started works in the future
      await this.jobRepository.updateStepExecutionById(stepExecution.getId(), {
        status: ExecutionStatus.STARTED,
        lastUpdatedTime: new Date(),
      });

      await this.processItems();

      await this.jobRepository.updateStepExecutionById(stepExecution.getId(), {
        status: ExecutionStatus.COMPLETED,
        endTime: new Date(),
        lastUpdatedTime: new Date(),
      });

      await this.notifyListenersAfterStep(stepExecution);
      this.logger.log(`Step ${this.name} completed successfully`);
      return stepExecution;
    } catch (error) {
      await this.jobRepository.updateStepExecutionById(stepExecution.getId(), {
        status: ExecutionStatus.FAILED,
        endTime: new Date(),
        lastUpdatedTime: new Date(),
        failureExceptions: [error.message],
      });
      await this.notifyListenersOnError(stepExecution, error);
      this.logger.error(`Step ${this.name} failed: ${error}`);
      throw error;
    }
  }

  protected async processItems() {
    const items = await this.reader.read();
    const processedItems: O[] = [];

    for (const item of items) {
      if (this.processor) {
        const processedItem = await this.processor.process(item);
        if (processedItem != null) {
          processedItems.push(processedItem);
        }
      } else {
        processedItems.push(item as unknown as O);
      }
    }

    const chunks = chunkArray(processedItems, this.chunkSize);
    for (const chunk of chunks) {
      await this.writer.write(chunk);
    }
  }
}
