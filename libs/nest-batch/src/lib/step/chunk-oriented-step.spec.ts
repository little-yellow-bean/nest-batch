import { ExecutionStatus, JobExecution } from '../execution';
import { ItemProcessor } from '../processor';
import { ItemReader } from '../reader';
import { InMemoryJobRepository, JobRepository } from '../repository';
import { ItemWriter } from '../writer';
import { ChunkOrientedStep } from './chunk-oriented-step';

describe('ChunkOrientedStep Testing', () => {
  let mockReader: jest.Mocked<ItemReader<number>>;
  let mockProcessor: jest.Mocked<ItemProcessor<number, number>>;
  let mockWriter: jest.Mocked<ItemWriter<number>>;
  let jobRepository: JobRepository;
  let mockJobExecution: JobExecution;
  let step: ChunkOrientedStep<number, number>;

  beforeEach(() => {
    mockReader = { read: jest.fn() };
    mockProcessor = { process: jest.fn() };
    mockWriter = { write: jest.fn() };
    jobRepository = new InMemoryJobRepository();
    mockJobExecution = new JobExecution({
      name: 'Test Job',
      status: ExecutionStatus.STARTED,
    });
    step = new ChunkOrientedStep<number, number>('Test Step')
      .setReader(mockReader)
      .setProcessor(mockProcessor)
      .setWriter(mockWriter)
      .setJobRepository(jobRepository)
      .setChunkSize(3);
  });

  it('should process items correctly', async () => {
    const mockItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    mockReader.read.mockResolvedValue(mockItems);
    mockProcessor.process.mockImplementation((input) =>
      Promise.resolve(input + 1)
    );
    mockWriter.write.mockResolvedValue(undefined);

    await step.execute(mockJobExecution);

    expect(mockReader.read).toHaveBeenCalledTimes(1);
    expect(mockProcessor.process).toHaveBeenCalledTimes(mockItems.length);
    mockItems.forEach((item) => {
      expect(mockProcessor.process).toHaveBeenCalledWith(
        item,
        expect.anything()
      );
    });
    expect(mockWriter.write).toHaveBeenCalledTimes(4);
    expect(mockWriter.write).toHaveBeenCalledWith([2, 3, 4], expect.anything());
    expect(mockWriter.write).toHaveBeenCalledWith([5, 6, 7], expect.anything());
    expect(mockWriter.write).toHaveBeenCalledWith(
      [8, 9, 10],
      expect.anything()
    );
    expect(mockWriter.write).toHaveBeenCalledWith([11], expect.anything());
  });

  it('should parallel process items correctly', async () => {
    const mockItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    mockReader.read.mockResolvedValue(mockItems);
    mockProcessor.process.mockImplementation((input) =>
      Promise.resolve(input + 1)
    );
    mockWriter.write.mockResolvedValue(undefined);

    step.setParallelProcessing(true);

    await step.execute(mockJobExecution);

    expect(mockReader.read).toHaveBeenCalledTimes(1);
    expect(mockProcessor.process).toHaveBeenCalledTimes(mockItems.length);
    mockItems.forEach((item) => {
      expect(mockProcessor.process).toHaveBeenCalledWith(
        item,
        expect.anything()
      );
    });
    expect(mockWriter.write).toHaveBeenCalledTimes(4);
    expect(mockWriter.write).toHaveBeenCalledWith([2, 3, 4], expect.anything());
    expect(mockWriter.write).toHaveBeenCalledWith([5, 6, 7], expect.anything());
    expect(mockWriter.write).toHaveBeenCalledWith(
      [8, 9, 10],
      expect.anything()
    );
    expect(mockWriter.write).toHaveBeenCalledWith([11], expect.anything());
  });
});
