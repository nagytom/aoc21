import * as readline from "readline";

async function readInput(): Promise<number[]> {
  const stream = readline.createInterface({ input: process.stdin });
  const input: number[] = [];
  for await (const line of stream) {
    input.push(Number(line));
  }
  return input;
}

function countIncrease(array: number[], window: number): number {
  let numOfIncrease = 0;
  let prevSum = Number.NaN;
  for (let i = 0; i <= array.length - window; i++) {
    let currentSum = 0;
    for (let j = i; j < i + window; j++) {
      currentSum += array[j];
    }
    if (prevSum < currentSum) {
      numOfIncrease++;
    }
    prevSum = currentSum;
  }
  return numOfIncrease;
}

export async function main(): Promise<void> {
  const input = await readInput();
  const pt1 = countIncrease(input, 1);
  const pt2 = countIncrease(input, 3);
  process.stdout.write(`Part 1: ${pt1}\nPart 2: ${pt2}\n`);
}
