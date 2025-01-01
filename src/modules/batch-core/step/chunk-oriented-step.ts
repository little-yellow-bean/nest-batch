import { Step } from './step';
import { chunkArray } from '../utils';

export class ChunkOrientedStep<I, O> extends Step<I, O> {
  override async processItems() {
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
