async function readInput(): Promise<number[]> {
  const allChunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    allChunks.push(chunk);
  }
  return Buffer.concat(allChunks).toString().trim().split(",").map(Number);
}

function linearDistance(positionA: number, positionB: number): number {
  return Math.abs(positionA - positionB);
}

function triangularDistance(positionA: number, positionB: number): number {
  const diff = Math.abs(positionA - positionB);
  return (diff * diff + diff) / 2;
}

function findMinConsumption(positions: number[], distance: (positionA: number, positionB: number) => number): number {
  const minPosition = Math.min(...positions);
  const maxPosition = Math.max(...positions);
  let minConsumption: number = Number.POSITIVE_INFINITY;
  for (let i = minPosition; i <= maxPosition; i++) {
    const consumption = positions.reduce((acc, value) => acc + distance(value, i), 0);
    if (consumption < minConsumption) {
      minConsumption = consumption;
    }
  }
  return minConsumption;
}

export async function main(): Promise<void> {
  const position = await readInput();
  const pt1 = findMinConsumption(position, linearDistance);
  const pt2 = findMinConsumption(position, triangularDistance);
  process.stdout.write(`Part 1: ${pt1}\nPart 2: ${pt2}\n`);
}
