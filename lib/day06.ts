const maxCycle = 8;
const resetCycle = 6;

async function readInput(): Promise<number[]> {
  const allChunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    allChunks.push(chunk);
  }
  return Buffer.concat(allChunks).toString().trim().split(",").map(Number);
}

function simulateGenerations(state: number[], rounds: number): void {
  for (let i = 0; i < rounds; i++) {
    const zeros = state[0];
    for (let j = 0; j < state.length - 1; j++) {
      state[j] = state[j + 1];
    }
    state[resetCycle] += zeros;
    state[maxCycle] = zeros;
  }
}

function sum(state: number[]): number {
  return state.reduce((acc, value) => acc + value, 0);
}

export async function main(): Promise<void> {
  const input = await readInput();
  const state = new Array<number>(maxCycle + 1);
  for (let i = 0; i < state.length; i++) {
    state[i] = 0;
  }
  for (const i of input) {
    state[i]++;
  }

  simulateGenerations(state, 80);
  const pt1 = sum(state);
  simulateGenerations(state, 176);
  const pt2 = sum(state);

  process.stdout.write(`Part 1: ${pt1}\nPart 2: ${pt2}\n`);
}
