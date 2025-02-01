import { StepExecution } from '../execution';
import { ItemProcessor } from './item-processor.model';

export class CompositeItemProcessor<I, O> implements ItemProcessor<I, O> {
  private readonly processors: ItemProcessor<unknown, unknown>[];

  constructor(processors: ItemProcessor<unknown, unknown>[]) {
    this.processors = [...processors];
  }

  async process(item: I, stepExecution: StepExecution): Promise<O> {
    let result: unknown = item;
    for (const processor of this.processors) {
      result = await processor.process(result, stepExecution);
    }
    return result as O;
  }
}
