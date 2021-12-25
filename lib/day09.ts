import * as readline from "readline";

async function readInput(): Promise<number[][]> {
  const stream = readline.createInterface({ input: process.stdin });
  const input: number[][] = [];
  for await (const line of stream) {
    input.push(line.split("").map(Number));
  }
  return input;
}

function getNeighbourIndices(map: number[][], row: number, col: number): [number, number][] {
  return [
    [row - 1, col],
    [row, col + 1],
    [row + 1, col],
    [row, col - 1]
  ].filter(([i, j]) => i >= 0 && i < map.length && j >= 0 && j < map[0].length) as [number, number][];
}

function isLowPoint(map: number[][], row: number, col: number): boolean {
  for (const [i, j] of getNeighbourIndices(map, row, col)) {
    if (map[i][j] <= map[row][col]) {
      return false;
    }
  }
  return true;
}

function getLowestLowerNeighbourIndex(map: number[][], row: number, col: number): [number, number] {
  const lowerNeighbourIndices = getNeighbourIndices(map, row, col).filter(([i, j]) => map[i][j] < map[row][col]);
  let minNeighbour = Number.POSITIVE_INFINITY;
  let minNeighbourIndex: [number, number] = null;
  for (const [i, j] of lowerNeighbourIndices) {
    if (map[i][j] < minNeighbour) {
      minNeighbourIndex = [i, j];
      minNeighbour = map[i][j];
    }
  }
  return minNeighbourIndex;
}

function drain(map: number[][], basinMap: number[][], row: number, col: number): void {
  const path: [number, number][] = [[row, col]];
  let cursor = path[0];
  while (cursor && basinMap[cursor[0]][cursor[1]] === 0) {
    cursor = getLowestLowerNeighbourIndex(map, cursor[0], cursor[1]);
    if (cursor) {
      path.push(cursor);
    }
  }
  const basin = basinMap[path[path.length - 1][0]][path[path.length - 1][1]];
  for (const [i, j] of path) {
    basinMap[i][j] = basin;
  }
}

function findLargestBasins(basinMap: number[][]): number {
  const frequency: { [key: number]: number } = {};
  for (let i = 0; i < basinMap.length; i++) {
    for (let j = 0; j < basinMap[0].length; j++) {
      if (basinMap[i][j] !== 0) {
        const value = frequency[basinMap[i][j]] ?? 0;
        frequency[basinMap[i][j]] = value + 1;
      }
    }
  }
  return Object.values(frequency)
    .sort((a, b) => b - a)
    .slice(0, 3)
    .reduce((acc, value) => acc * value, 1);
}

export async function main(): Promise<void> {
  const map = await readInput();
  const basinMap = new Array<number[]>(map.length);

  for (let i = 0; i < map.length; i++) {
    basinMap[i] = new Array(map[0].length);
    for (let j = 0; j < map[0].length; j++) {
      basinMap[i][j] = 0;
    }
  }

  let riskSum = 0;
  let lowPointIndex = 1;
  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[0].length; j++) {
      if (isLowPoint(map, i, j)) {
        riskSum += map[i][j] + 1;
        basinMap[i][j] = lowPointIndex++;
      }
    }
  }

  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[0].length; j++) {
      if (map[i][j] !== 9 && basinMap[i][j] === 0) {
        drain(map, basinMap, i, j);
      }
    }
  }

  const largestBasins = findLargestBasins(basinMap);

  process.stdout.write(`Part 1: ${riskSum}\nPart 2: ${largestBasins}\n`);
}
