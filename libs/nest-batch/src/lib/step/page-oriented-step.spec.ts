import { ExecutionStatus, JobExecution } from '../execution';
import { ItemProcessor } from '../processor';
import { ItemReader } from '../reader';
import { JobRepository, InMemoryJobRepository } from '../repository';
import { ItemWriter } from '../writer';
import { PageOrientedStep } from './page-oriented-step';

describe('PageOrientedStep Testing', () => {
  let mockReader: jest.Mocked<ItemReader<number>>;
  let mockProcessor: jest.Mocked<ItemProcessor<number, number>>;
  let mockWriter: jest.Mocked<ItemWriter<number>>;
  let jobRepository: JobRepository;
  let mockJobExecution: JobExecution;
  let step: PageOrientedStep<number, number>;

  beforeEach(() => {
    mockReader = { read: jest.fn() };
    mockProcessor = { process: jest.fn() };
    mockWriter = { write: jest.fn() };
    jobRepository = new InMemoryJobRepository();
    mockJobExecution = new JobExecution({
      name: 'Test Job',
      status: ExecutionStatus.STARTED,
    });
    step = new PageOrientedStep<number, number>('Test Step')
      .setReader(mockReader)
      .setProcessor(mockProcessor)
      .setWriter(mockWriter)
      .setJobRepository(jobRepository)
      .setChunkSize(2);
  });

  it('should process items in pages correctly', async () => {
    const mockPageItems = [
      [1, 2],
      [3, 4, 5],
      [6, 7, 8],
    ];
    const mockFlatItems = mockPageItems.flat();
    mockReader.read
      .mockResolvedValueOnce(mockPageItems[0])
      .mockResolvedValueOnce(mockPageItems[1])
      .mockResolvedValueOnce(mockPageItems[2])
      .mockResolvedValueOnce(null);

    mockProcessor.process.mockImplementation((item) =>
      Promise.resolve(item + 1)
    );

    await step.execute(mockJobExecution);
    expect(mockReader.read).toHaveBeenCalledTimes(4);
    expect(mockProcessor.process).toHaveBeenCalledTimes(mockFlatItems.length);
    mockFlatItems.forEach((item) => {
      expect(mockProcessor.process).toHaveBeenCalledWith(
        item,
        expect.anything()
      );
    });

    expect(mockWriter.write).toHaveBeenCalledTimes(4);
    expect(mockWriter.write).toHaveBeenCalledWith([2, 3], expect.anything());
    expect(mockWriter.write).toHaveBeenCalledWith([4, 5], expect.anything());
    expect(mockWriter.write).toHaveBeenCalledWith([6, 7], expect.anything());
    expect(mockWriter.write).toHaveBeenCalledWith([8, 9], expect.anything());
  });

  it('should parallel process items in pages correctly', async () => {
    const mockPageItems = [
      [1, 2],
      [3, 4, 5],
      [6, 7, 8],
    ];
    const mockFlatItems = mockPageItems.flat();
    mockReader.read
      .mockResolvedValueOnce(mockPageItems[0])
      .mockResolvedValueOnce(mockPageItems[1])
      .mockResolvedValueOnce(mockPageItems[2])
      .mockResolvedValueOnce(null);

    mockProcessor.process.mockImplementation((item) =>
      Promise.resolve(item + 1)
    );
    step.setParallelProcessing(true);
    await step.execute(mockJobExecution);
    expect(mockReader.read).toHaveBeenCalledTimes(4);
    expect(mockProcessor.process).toHaveBeenCalledTimes(mockFlatItems.length);
    mockFlatItems.forEach((item) => {
      expect(mockProcessor.process).toHaveBeenCalledWith(
        item,
        expect.anything()
      );
    });

    expect(mockWriter.write).toHaveBeenCalledTimes(4);
    expect(mockWriter.write).toHaveBeenCalledWith([2, 3], expect.anything());
    expect(mockWriter.write).toHaveBeenCalledWith([4, 5], expect.anything());
    expect(mockWriter.write).toHaveBeenCalledWith([6, 7], expect.anything());
    expect(mockWriter.write).toHaveBeenCalledWith([8, 9], expect.anything());
  });

  it('should handle remaining items less than chunkSize correctly', async () => {
    const mockPageItems = [
      [1, 2, 3],
      [4, 5],
      [6, 7],
    ];
    const mockFlatItems = mockPageItems.flat();
    mockReader.read
      .mockResolvedValueOnce(mockPageItems[0])
      .mockResolvedValueOnce(mockPageItems[1])
      .mockResolvedValueOnce(mockPageItems[2])
      .mockResolvedValueOnce(null);

    mockProcessor.process.mockImplementation((item) =>
      Promise.resolve(item + 1)
    );

    await step.execute(mockJobExecution);

    expect(mockReader.read).toHaveBeenCalledTimes(4);
    expect(mockProcessor.process).toHaveBeenCalledTimes(mockFlatItems.length);
    mockFlatItems.forEach((item) => {
      expect(mockProcessor.process).toHaveBeenCalledWith(
        item,
        expect.anything()
      );
    });

    expect(mockWriter.write).toHaveBeenCalledTimes(4);
    expect(mockWriter.write).toHaveBeenCalledWith([2, 3], expect.anything());
    expect(mockWriter.write).toHaveBeenCalledWith([4, 5], expect.anything());
    expect(mockWriter.write).toHaveBeenCalledWith([6, 7], expect.anything());
    expect(mockWriter.write).toHaveBeenCalledWith([8], expect.anything());
  });

  it('should handle remaining items less than chunkSize correctly (in parallel)', async () => {
    const mockPageItems = [
      [1, 2, 3],
      [4, 5],
      [6, 7],
    ];
    const mockFlatItems = mockPageItems.flat();
    mockReader.read
      .mockResolvedValueOnce(mockPageItems[0])
      .mockResolvedValueOnce(mockPageItems[1])
      .mockResolvedValueOnce(mockPageItems[2])
      .mockResolvedValueOnce(null);

    mockProcessor.process.mockImplementation((item) =>
      Promise.resolve(item + 1)
    );

    step.setParallelProcessing(true);
    await step.execute(mockJobExecution);

    expect(mockReader.read).toHaveBeenCalledTimes(4);
    expect(mockProcessor.process).toHaveBeenCalledTimes(mockFlatItems.length);
    mockFlatItems.forEach((item) => {
      expect(mockProcessor.process).toHaveBeenCalledWith(
        item,
        expect.anything()
      );
    });

    expect(mockWriter.write).toHaveBeenCalledTimes(4);
    expect(mockWriter.write).toHaveBeenCalledWith([2, 3], expect.anything());
    expect(mockWriter.write).toHaveBeenCalledWith([4, 5], expect.anything());
    expect(mockWriter.write).toHaveBeenCalledWith([6, 7], expect.anything());
    expect(mockWriter.write).toHaveBeenCalledWith([8], expect.anything());
  });
});
