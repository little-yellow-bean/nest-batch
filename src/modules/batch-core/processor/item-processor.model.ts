export interface ItemProcessor<I, O> {
  process(item: I): Promise<O | null>;
}
