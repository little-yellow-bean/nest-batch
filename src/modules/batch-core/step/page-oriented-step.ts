import { chunkArray } from '../utils';
import { Step } from './step';

export class PageOrientedStep<I, O> extends Step<I, O> {
  override async processItems() {
    let items = await this.reader.read();
    let processedItems: O[] = [];
    while (items != null) {
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

      if (processedItems.length >= this.chunkSize) {
        const chunks = chunkArray(processedItems, this.chunkSize);
        processedItems = [];
        for (const chunk of chunks) {
          if (chunk.length >= this.chunkSize) {
            await this.writer.write(chunk);
          } else {
            processedItems = chunk;
          }
        }
      }

      items = await this.reader.read();
    }

    if (processedItems.length) {
      await this.writer.write(processedItems);
    }
  }
}
