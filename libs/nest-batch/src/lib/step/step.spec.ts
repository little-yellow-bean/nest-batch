import { ExecutionStatus, JobExecution } from '../execution';
import { JobRepository, InMemoryJobRepository } from '../repository';
import { Step } from './step';

const STEP_NAME = 'Test Step';
const MAX_RETRY = 3;

class TestStep<I, O> extends Step<I, O> {
  produceError = false;
  backToNormalAfter = 0;
  private retryCount = 0;
  constructor(name: string) {
    super(name);
  }
  async processItems(): Promise<void> {
    if (this.produceError && this.backToNormalAfter > this.retryCount) {
      this.retryCount++;
      throw new Error('Test Error');
    }
    return;
  }
}

describe('Step testing', () => {
  let step: TestStep<number, number>;
  let jobRepository: JobRepository;
  let mockJobExecution: JobExecution;
  let processItemsSpy: jest.SpyInstance;

  beforeEach(() => {
    jobRepository = new InMemoryJobRepository();
    step = new TestStep<number, number>(STEP_NAME)
      .setJobRepository(jobRepository)
      .setMaxretries(MAX_RETRY)
      .setRetryDelay(500)
      .setShouldRetry(() => true);
    mockJobExecution = new JobExecution({
      name: 'Test Job',
      status: ExecutionStatus.STARTED,
    });
    processItemsSpy = jest.spyOn(step, 'processItems');
  });

  it('should execute successfully and update step execution states', async () => {
    const stepExecution = await step.execute(mockJobExecution);
    const savedStepExecution = await jobRepository.findStepExecutionById(
      stepExecution.id
    );
    expect(processItemsSpy).toHaveBeenCalledTimes(1);
    expect(savedStepExecution).toBeDefined();
    expect(savedStepExecution?.status).toBe(ExecutionStatus.COMPLETED);
  });

  it('should retry and throw error if error happens and all retries failed', async () => {
    step.produceError = true;
    step.backToNormalAfter = MAX_RETRY + 1;
    await expect(step.execute(mockJobExecution)).rejects.toThrow(Error);
    const savedStepExecution = await jobRepository.findStepExecutionBy({
      name: STEP_NAME,
    });
    expect(processItemsSpy).toHaveBeenCalledTimes(MAX_RETRY + 1);
    expect(savedStepExecution[0]).toBeDefined();
    expect(savedStepExecution[0]?.status).toBe(ExecutionStatus.FAILED);
  });

  it('should retry and complete if error happens and retry succeed', async () => {
    step.produceError = true;
    step.backToNormalAfter = MAX_RETRY - 1;
    const stepExecution = await step.execute(mockJobExecution);
    const savedStepExecution = await jobRepository.findStepExecutionById(
      stepExecution.id
    );
    expect(processItemsSpy).toHaveBeenCalledTimes(MAX_RETRY);
    expect(savedStepExecution).toBeDefined();
    expect(savedStepExecution?.status).toBe(ExecutionStatus.COMPLETED);
  });
});
