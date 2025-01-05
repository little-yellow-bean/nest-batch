import { ItemProcessor } from './item-processor.model';

export class CompositeItemProcessor<I, O> implements ItemProcessor<I, O> {
  private readonly processors: ItemProcessor<any, any>[];

  constructor(processors: ItemProcessor<any, any>[]) {
    this.processors = [...processors].filter((processor) => !!processor);
  }

  async process(item: I): Promise<O> {
    let result: any = item;
    for (const processor of this.processors) {
      result = await processor.process(result);
    }
    return result as O;
  }
}
