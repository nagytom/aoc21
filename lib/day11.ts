import * as readline from "readline";

async function readInput(): Promise<number[][]> {
  const stream = readline.createInterface({ input: process.stdin });
  const input: number[][] = [];
  for await (const line of stream) {
    input.push(line.split("").map(Number));
  }
  return input;
}

function flash(state: number[][], row: number, col: number): void {
  state[row][col] = 0;
  for (let i = row - 1; i <= row + 1; i++) {
    for (let j = col - 1; j <= col + 1; j++) {
      if (i >= 0 && j >= 0 && i < state.length && j < state[0].length && state[i][j] !== 0) {
        state[i][j]++;
      }
    }
  }
}

function simulateStep(state: number[][]): void {
  for (let i = 0; i < state.length; i++) {
    for (let j = 0; j < state[0].length; j++) {
      state[i][j]++;
    }
  }
  let flashed = true;
  while (flashed) {
    flashed = false;
    for (let i = 0; i < state.length; i++) {
      for (let j = 0; j < state[0].length; j++) {
        if (state[i][j] > 9) {
          flashed = true;
          flash(state, i, j);
        }
      }
    }
  }
}

function countFlashes(state: number[][]): number {
  let count = 0;
  for (let i = 0; i < state.length; i++) {
    for (let j = 0; j < state[0].length; j++) {
      if (state[i][j] === 0) {
        count++;
      }
    }
  }
  return count;
}

function isSynced(state: number[][]): boolean {
  for (let i = 0; i < state.length; i++) {
    for (let j = 0; j < state[0].length; j++) {
      if (state[i][j] !== 0) {
        return false;
      }
    }
  }
  return true;
}

function cloneState(state: number[][]): number[][] {
  return state.map((row) => [...row]);
}

function calcPt1(state: number[][]): number {
  let flashes = 0;
  for (let i = 0; i < 100; i++) {
    simulateStep(state);
    flashes += countFlashes(state);
  }
  return flashes;
}

function calcPt2(state: number[][]): number {
  let i = 0;
  while (!isSynced(state)) {
    simulateStep(state);
    i++;
  }
  return i;
}

export async function main(): Promise<void> {
  const state = await readInput();
  const pt1 = calcPt1(cloneState(state));
  const pt2 = calcPt2(cloneState(state));
  process.stdout.write(`Part 1: ${pt1}\nPart 2: ${pt2}\n`);
}
