import { StepExecution } from '../execution';
import { chunkArray } from '../utils';
import { Step } from './step';

export class PageOrientedStep<I, O> extends Step<I, O> {
  override async processItems(stepExecution: StepExecution) {
    let items = await this.reader.read(stepExecution);
    let processedItems: O[] = [];
    while (items != null) {
      if (this.parallelProcessing) {
        if (this.processor) {
          const newProcessedItems = (
            await Promise.all(
              items.map((item) => this.processor?.process(item, stepExecution))
            )
          ).filter((item) => item != null);
          processedItems = [...processedItems, ...newProcessedItems];
        } else {
          processedItems = [...processedItems, ...items] as unknown as O[];
        }
        if (processedItems.length >= this.chunkSize) {
          const chunks = chunkArray(processedItems, this.chunkSize);
          const lastChunk = chunks.at(-1);
          processedItems =
            lastChunk && lastChunk.length < this.chunkSize ? lastChunk : [];
          const chunksToWrite = chunks.filter(
            (chunk) => chunk.length >= this.chunkSize
          );
          await Promise.all(
            chunksToWrite.map((chunk) =>
              this.writer.write(chunk, stepExecution)
            )
          );
        }
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
      }

      items = await this.reader.read(stepExecution);
    }

    if (processedItems.length > 0) {
      await this.writer.write(processedItems, stepExecution);
    }
  }
}
