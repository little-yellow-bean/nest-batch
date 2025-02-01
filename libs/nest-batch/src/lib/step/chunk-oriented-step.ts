import { StepExecution } from '../execution';
import { chunkArray } from '../utils';
import { Step } from './step';

export class ChunkOrientedStep<I, O> extends Step<I, O> {
  override async processItems(stepExecution: StepExecution) {
    const items = await this.reader.read(stepExecution);
    if (items) {
      let processedItems: O[] = [];
      if (this.parallelProcessing) {
        if (this.processor) {
          processedItems = (
            await Promise.all(
              items.map((item) => this.processor?.process(item, stepExecution))
            )
          ).filter((item) => item != null);
        } else {
          processedItems = items as unknown as O[];
        }
        const chunks = chunkArray(processedItems, this.chunkSize);

        await Promise.all(
          chunks.map((chunk) => this.writer.write(chunk, stepExecution))
        );
      } else {
        for (const item of items) {
          if (this.processor) {
            const processedItem = await this.processor.process(
              item,
              stepExecution
            );
            if (processedItem != null) {
              processedItems.push(processedItem);
            }
          } else {
            processedItems.push(item as unknown as O);
          }
          if (processedItems.length >= this.chunkSize) {
            await this.writer.write(processedItems, stepExecution);
            processedItems = [];
          }
        }

        if (processedItems.length > 0) {
          await this.writer.write(processedItems, stepExecution);
        }
      }
    }
  }
}
