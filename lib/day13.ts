import * as readline from "readline";

type Point = { x: number; y: number };
type Fold = { horizontal: boolean; position: number };

async function readInput(): Promise<{ points: Point[]; folds: Fold[] }> {
  const stream = readline.createInterface({ input: process.stdin });
  const points: Point[] = [];
  const folds: Fold[] = [];
  let separator = false;
  for await (const line of stream) {
    if (line === "") {
      separator = true;
      continue;
    }
    if (!separator) {
      const [x, y] = line.split(",").map(Number);
      points.push({ x, y });
    } else {
      const regex = /^fold along (\w)=(\d+)$/;
      const [, direction, position] = regex.exec(line);
      folds.push({ horizontal: direction === "x", position: Number(position) });
    }
  }
  return { points, folds };
}

function fold(points: Point[], fold: Fold): Point[] {
  const foldedPoints: Point[] = [];
  for (const point of points) {
    let transformed: Point;

    if (fold.horizontal && point.x < fold.position) {
      transformed = point;
    } else if (fold.horizontal && point.x > fold.position) {
      transformed = { x: 2 * fold.position - point.x, y: point.y };
    } else if (!fold.horizontal && point.y < fold.position) {
      transformed = point;
    } else if (!fold.horizontal && point.y > fold.position) {
      transformed = { x: point.x, y: 2 * fold.position - point.y };
    }

    if (foldedPoints.every((p) => p.x !== transformed.x || p.y !== transformed.y)) {
      foldedPoints.push(transformed);
    }
  }
  return foldedPoints;
}

function print(points: Point[]): void {
  const minX = Math.min(...points.map(({ x }) => x));
  const minY = Math.min(...points.map(({ y }) => y));
  const normalized: Point[] = points.map(({ x, y }) => ({ x: x - minX, y: y - minY }));

  const maxX = Math.max(...normalized.map(({ x }) => x));
  const maxY = Math.max(...normalized.map(({ y }) => y));
  const array = new Array<string[]>(maxY + 1);
  for (let i = 0; i < array.length; i++) {
    array[i] = new Array(maxX + 1);
    for (let j = 0; j < array[0].length; j++) {
      array[i][j] = " ";
    }
  }

  for (const point of normalized) {
    array[point.y][point.x] = "#";
  }

  process.stdout.write(array.map((row) => row.join("")).join("\n") + "\n");
}

export async function main(): Promise<void> {
  const { folds, points } = await readInput();

  const afterFirstFold = fold(points, folds[0]);

  let foldedPoints = afterFirstFold;
  for (let i = 1; i < folds.length; i++) {
    foldedPoints = fold(foldedPoints, folds[i]);
  }

  process.stdout.write(`Part 1: ${afterFirstFold.length}\nPart 2:\n`);
  print(foldedPoints);
}
