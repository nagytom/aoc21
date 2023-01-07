import * as readline from "readline";

const initMin = -50;
const initMax = 50;

interface Cube {
  x: [number, number];
  y: [number, number];
  z: [number, number];
}

type Sign = 1 | -1;

interface Command {
  sign: Sign;
  cube: Cube;
}

async function readInput(): Promise<Command[]> {
  const stream = readline.createInterface({ input: process.stdin });
  const commands: Command[] = [];
  for await (const line of stream) {
    const match = /^(on|off) x=(-?\d+)\.\.(-?\d+),y=(-?\d+)\.\.(-?\d+),z=(-?\d+)\.\.(-?\d+)$/.exec(line);
    let i = 1;
    commands.push({
      sign: match[i++] === "on" ? 1 : -1,
      cube: {
        x: [Number(match[i++]), Number(match[i++])],
        y: [Number(match[i++]), Number(match[i++])],
        z: [Number(match[i++]), Number(match[i++])]
      }
    });
  }
  return commands;
}

function isInitializerCommand(command: Command): boolean {
  return Object.values(command.cube).every(([min, max]: [number, number]) => min >= initMin && max <= initMax);
}

function size(cube: Cube): number {
  return (cube.x[1] - cube.x[0] + 1) * (cube.y[1] - cube.y[0] + 1) * (cube.z[1] - cube.z[0] + 1);
}

function intersect(a: Cube, b: Cube): Cube {
  const intersection: Cube = {
    x: [Math.max(a.x[0], b.x[0]), Math.min(a.x[1], b.x[1])],
    y: [Math.max(a.y[0], b.y[0]), Math.min(a.y[1], b.y[1])],
    z: [Math.max(a.z[0], b.z[0]), Math.min(a.z[1], b.z[1])]
  };
  if (
    intersection.x[0] > intersection.x[1] ||
    intersection.y[0] > intersection.y[1] ||
    intersection.z[0] > intersection.z[1]
  ) {
    return null;
  }
  return intersection;
}

function getAccumulatedSize(commands: Command[]): number {
  const normalized: Command[] = [];
  for (const current of commands) {
    for (let i = normalized.length - 1; i >= 0; i--) {
      const prev = normalized[i];
      const intersection = intersect(prev.cube, current.cube);
      if (intersection) {
        normalized.push({ cube: intersection, sign: -prev.sign as Sign });
      }
    }
    if (current.sign === 1) {
      normalized.push(current);
    }
  }
  return normalized.reduce((acc, value) => acc + value.sign * size(value.cube), 0);
}

export async function main(): Promise<void> {
  const commands = await readInput();

  const pt1 = getAccumulatedSize(commands.filter(isInitializerCommand));
  const pt2 = getAccumulatedSize(commands);

  process.stdout.write(`Part 1: ${pt1}\nPart 2: ${pt2}\n`);
}
