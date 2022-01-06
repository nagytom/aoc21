import * as readline from "readline";

async function readInput(): Promise<number[][]> {
  const stream = readline.createInterface({ input: process.stdin });
  const map: number[][] = [];
  for await (const line of stream) {
    const row = line.split("").map(Number);
    map.push(row);
  }
  return map;
}

function deserializeIndex(index: number, length: number, sectionLength: number): { row: number; col: number } {
  const totalLength = length * sectionLength;
  const row = Math.floor(index / totalLength);
  const col = index % totalLength;
  return { row, col };
}

function getCost(map: number[][], index: number, length: number, sectionLength: number): number {
  const { col: totalCol, row: totalRow } = deserializeIndex(index, length, sectionLength);

  const row = totalRow % length;
  const sectionRow = Math.floor(totalRow / length);

  const col = totalCol % length;
  const sectionCol = Math.floor(totalCol / length);

  const cost = map[row][col] + sectionRow + sectionCol;

  return ((cost - 1) % 9) + 1;
}

function getMinDistIndex(indexSet: Set<number>, distMap: Map<number, number>): number {
  let minIndex: number;
  let minDist = Number.POSITIVE_INFINITY;
  for (const index of indexSet.values()) {
    const dist = distMap.get(index);
    if (dist < minDist) {
      minIndex = index;
      minDist = dist;
    }
  }
  return minIndex;
}

function getNeighbours(index: number, length: number, sectionLength: number): number[] {
  const neighbourIndices = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1]
  ];
  const { col, row } = deserializeIndex(index, length, sectionLength);
  const totalLength = length * sectionLength;
  const neighbours: number[] = [];
  for (const [rowDiff, colDiff] of neighbourIndices) {
    const neighbourRow = row + rowDiff;
    const neighbourCol = col + colDiff;
    if (neighbourRow >= 0 && neighbourCol >= 0 && neighbourRow < totalLength && neighbourCol < totalLength) {
      neighbours.push(neighbourRow * totalLength + neighbourCol);
    }
  }
  return neighbours;
}

function calcMinDist(map: number[][], start: number, end: number, length: number, sectionLength: number): number {
  const distMap = new Map<number, number>();
  distMap.set(start, 0);

  const indexSet = new Set<number>();
  indexSet.add(start);

  while (indexSet.size > 0) {
    const current = getMinDistIndex(indexSet, distMap);
    indexSet.delete(current);
    if (current === end) {
      break;
    }
    for (const neighbour of getNeighbours(current, length, sectionLength)) {
      const distFromCurrent = distMap.get(current) + getCost(map, neighbour, length, sectionLength);
      const neighbourDist = distMap.get(neighbour) ?? Number.POSITIVE_INFINITY;
      if (distFromCurrent < neighbourDist) {
        indexSet.add(neighbour);
        distMap.set(neighbour, distFromCurrent);
      }
    }
  }

  return distMap.get(end);
}

export async function main(): Promise<void> {
  const map = await readInput();
  const length = map.length;

  const pt1SectionLength = 1;
  const pt1End = Math.pow(length * pt1SectionLength, 2) - 1;
  const pt1 = calcMinDist(map, 0, pt1End, length, pt1SectionLength);

  const pt2SectionLength = 5;
  const pt2End = Math.pow(length * pt2SectionLength, 2) - 1;
  const pt2 = calcMinDist(map, 0, pt2End, length, pt2SectionLength);

  process.stdout.write(`Part 1: ${pt1}\nPart 2: ${pt2}\n`);
}
