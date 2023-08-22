import * as readline from "readline";

async function readInput(): Promise<string[][]> {
  const stream = readline.createInterface({ input: process.stdin });
  const input: string[][] = [];
  for await (const line of stream) {
    input.push(line.split(""));
  }
  return input;
}

function simulateOneRound(state: string[][]): boolean {
  const rows = state.length;
  const cols = state[0].length;
  let moved = false;

  for (let i = 0; i < rows; i++) {
    const overflow = state[i][0] === "." && state[i][cols - 1] === ">";
    for (let j = 0; j < cols - 1; j++) {
      const nextJ = j + 1;
      if (state[i][j] === ">" && state[i][nextJ] === ".") {
        state[i][j] = ".";
        state[i][nextJ] = ">";
        j++;
        moved = true;
      }
    }
    if (overflow) {
      state[i][0] = ">";
      state[i][cols - 1] = ".";
      moved = true;
    }
  }

  for (let i = 0; i < cols; i++) {
    const overflow = state[0][i] === "." && state[rows - 1][i] === "v";
    for (let j = 0; j < rows - 1; j++) {
      const nextJ = j + 1;
      if (state[j][i] === "v" && state[nextJ][i] === ".") {
        state[j][i] = ".";
        state[nextJ][i] = "v";
        j++;
        moved = true;
      }
    }
    if (overflow) {
      state[0][i] = "v";
      state[rows - 1][i] = ".";
      moved = true;
    }
  }

  return moved;
}

export async function main(): Promise<void> {
  let state = await readInput();
  let counter = 1;

  while (simulateOneRound(state)) {
    counter++;
  }

  process.stdout.write(`Part 1: ${counter}\nPart 2: ${null}\n`);
}
