import { chunkArray } from './chunkArray';

describe('chunkArray function', () => {
  it('should split an array into chunks of the specified size', () => {
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const chunkSize = 3;

    const result = chunkArray(array, chunkSize);

    expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]);
  });

  it('should handle arrays smaller than the chunk size', () => {
    const array = [1, 2];
    const chunkSize = 5;

    const result = chunkArray(array, chunkSize);

    expect(result).toEqual([[1, 2]]);
  });

  it('should return an empty array if input array is empty', () => {
    const array: number[] = [];
    const chunkSize = 3;

    const result = chunkArray(array, chunkSize);

    expect(result).toEqual([]);
  });

  it('should throw an error if chunkSize is less than or equal to 0', () => {
    const array = [1, 2, 3, 4, 5];

    expect(() => chunkArray(array, 0)).toThrowError(
      'chunkSize must be greater than 0'
    );
    expect(() => chunkArray(array, -1)).toThrowError(
      'chunkSize must be greater than 0'
    );
  });

  it('should split an array into chunks with default chunkSize (10)', () => {
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    const result = chunkArray(array);

    expect(result).toEqual([[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [11]]);
  });
});
