import * as readline from "readline";

type Point = { x: number; y: number };
type Line = { start: Point; end: Point };

async function readInput(): Promise<{ lines: Line[]; sizeX: number; sizeY: number }> {
  const stream = readline.createInterface({ input: process.stdin });
  let maxX = 0;
  let maxY = 0;
  const lines: Line[] = [];
  for await (const line of stream) {
    const [start, end] = line.split("->").map((point): Point => {
      const [x, y] = point.split(",").map(Number);
      return { x, y };
    });
    lines.push({ start, end });
    maxX = Math.max(maxX, start.x, end.x);
    maxY = Math.max(maxY, start.y, end.y);
  }
  return { lines, sizeX: maxX + 1, sizeY: maxY + 1 };
}

function countOverlaps(map: number[][]): number {
  let overlaps = 0;
  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
      if (map[i][j] > 1) {
        overlaps++;
      }
    }
  }
  return overlaps;
}

function getDirection(start: number, end: number): number {
  if (start < end) {
    return 1;
  } else if (start > end) {
    return -1;
  } else {
    return 0;
  }
}

function drawLine(map: number[][], line: Line): void {
  const cursor = { ...line.start };
  let steps = Math.max(Math.abs(line.start.x - line.end.x), Math.abs(line.start.y - line.end.y)) + 1;
  const xDir = getDirection(line.start.x, line.end.x);
  const yDir = getDirection(line.start.y, line.end.y);
  while (steps > 0) {
    map[cursor.y][cursor.x]++;
    cursor.x += xDir;
    cursor.y += yDir;
    steps--;
  }
}

export async function main(): Promise<void> {
  const { lines, sizeX, sizeY } = await readInput();
  const map: number[][] = new Array(sizeY);
  for (let i = 0; i < sizeY; i++) {
    map[i] = new Array(sizeX);
    for (let j = 0; j < sizeX; j++) {
      map[i][j] = 0;
    }
  }

  for (const line of lines) {
    if (line.start.x === line.end.x || line.start.y === line.end.y) {
      drawLine(map, line);
    }
  }

  const pt1Overlaps = countOverlaps(map);

  for (const line of lines) {
    if (line.start.x !== line.end.x && line.start.y !== line.end.y) {
      drawLine(map, line);
    }
  }

  const pt2Overlaps = countOverlaps(map);

  process.stdout.write(`Part 1: ${pt1Overlaps}\nPart 2: ${pt2Overlaps}\n`);
}
