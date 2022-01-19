/*
 * This solution expects the target rectangle to entirely be in the 4th quadrant (without touching the axes).
 */

import * as readline from "readline";

type Point = { x: number; y: number };
type Rectangle = { topLeft: Point; width: number; height: number };

async function readInput(): Promise<Rectangle> {
  const stream = readline.createInterface({ input: process.stdin });
  const iterator: AsyncIterator<string, string, string> = stream[Symbol.asyncIterator]();
  const line = (await iterator.next()).value;
  const regex = /^target area: x=([-0-9]+)\.\.([-0-9]+), y=([-0-9]+)\.\.([-0-9]+)$/;
  const [x0, x1, y0, y1] = regex.exec(line).slice(1).map(Number);
  return {
    topLeft: { x: Math.min(x0, x1), y: Math.max(y0, y1) },
    width: Math.abs(x0 - x1) + 1,
    height: Math.abs(y0 - y1) + 1
  };
}

function isPointInRectangle(point: Point, rectangle: Rectangle): boolean {
  return (
    point.x >= rectangle.topLeft.x &&
    point.x <= rectangle.topLeft.x + rectangle.width - 1 &&
    point.y <= rectangle.topLeft.y &&
    point.y >= rectangle.topLeft.y - rectangle.height + 1
  );
}

function checkVelocity(velocity: Point, rectangle: Rectangle): { hit: false } | { hit: true; maxY: number } {
  let dx = velocity.x;
  let dy = velocity.y;
  let x = 0;
  let y = 0;
  let maxY = y;
  while (
    x < rectangle.topLeft.x + rectangle.width &&
    y > rectangle.topLeft.y - rectangle.height &&
    !isPointInRectangle({ x, y }, rectangle)
  ) {
    x += dx;
    y += dy;
    maxY = y > maxY ? y : maxY;
    dx = dx > 0 ? dx - 1 : 0;
    dy--;
  }
  return isPointInRectangle({ x, y }, rectangle) ? { hit: true, maxY } : { hit: false };
}

export async function main(): Promise<void> {
  const rectangle = await readInput();

  let solutions = 0;
  let maxY = Number.NEGATIVE_INFINITY;
  const minDx = 1;
  const maxDx = rectangle.topLeft.x + rectangle.width - 1;
  const minDy = rectangle.topLeft.y - rectangle.height + 1;
  const maxDy = rectangle.height - rectangle.topLeft.y - 2;

  for (let dx = minDx; dx <= maxDx; dx++) {
    for (let dy = minDy; dy <= maxDy; dy++) {
      const currentSolution = checkVelocity({ x: dx, y: dy }, rectangle);
      if (currentSolution.hit) {
        solutions++;
      }
      if (currentSolution.hit && currentSolution.maxY > maxY) {
        maxY = currentSolution.maxY;
      }
    }
  }

  process.stdout.write(`Part 1: ${maxY}\nPart 2: ${solutions}\n`);
}
