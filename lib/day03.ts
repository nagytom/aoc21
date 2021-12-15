import * as readline from "readline";

async function readInput(): Promise<string[]> {
  const stream = readline.createInterface({ input: process.stdin });
  const input: string[] = [];
  for await (const line of stream) {
    input.push(line);
  }
  return input;
}

function countFrequencies(input: string[], position: number): [number, number] {
  const frequencies: [number, number] = [0, 0];
  for (const element of input) {
    frequencies[element[position]]++;
  }
  return frequencies;
}

function calcPt1(input: string[]): number {
  let gamma = "";
  let epsilon = "";
  for (let i = 0; i < input[0].length; i++) {
    const frequencies = countFrequencies(input, i);
    if (frequencies[0] < frequencies[1]) {
      gamma += "1";
      epsilon += "0";
    } else {
      gamma += "0";
      epsilon += "1";
    }
  }
  return Number.parseInt(gamma, 2) * Number.parseInt(epsilon, 2);
}

function findNumber(input: string[], criteria: (frequencies: [number, number]) => number): string {
  let array = [...input];
  let i = 0;
  while (array.length > 1) {
    const frequencies = countFrequencies(array, i);
    const determinant = criteria(frequencies);
    array = array.filter((element) => element[i] === `${determinant}`);
    i++;
  }
  return array[0];
}

function calcPt2(input: string[]): number {
  const generatorRating = findNumber(input, (frequencies) => (frequencies[0] > frequencies[1] ? 0 : 1));
  const scrubberRating = findNumber(input, (frequencies) => (frequencies[0] > frequencies[1] ? 1 : 0));
  return Number.parseInt(generatorRating, 2) * Number.parseInt(scrubberRating, 2);
}

export async function main(): Promise<void> {
  const input = await readInput();
  const pt1 = calcPt1(input);
  const pt2 = calcPt2(input);
  process.stdout.write(`Part 1: ${pt1}\nPart 2: ${pt2}\n`);
}
