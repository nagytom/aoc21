import * as readline from "readline";

type State = { x: number; y: number; aim: number };
type Transformations = { [transformation: string]: (state: State, c: number) => State };

const pt1Transformations: Transformations = {
  down: (state, c) => ({ ...state, y: state.y - c }),
  forward: (state, c) => ({ ...state, x: state.x + c }),
  up: (state, c) => ({ ...state, y: state.y + c })
};

const pt2Transformations: Transformations = {
  down: (state, c) => ({ ...state, aim: state.aim - c }),
  forward: (state, c) => ({ ...state, x: state.x + c, y: state.y + state.aim * c }),
  up: (state, c) => ({ ...state, aim: state.aim + c })
};

async function readInput(): Promise<[string, number][]> {
  const stream = readline.createInterface({ input: process.stdin });
  const input: [string, number][] = [];
  for await (const line of stream) {
    const [command, amount] = line.split(" ");
    input.push([command, Number(amount)]);
  }
  return input;
}

function calcSolution(input: [string, number][], transformations: Transformations): number {
  let state: State = { x: 0, y: 0, aim: 0 };
  for (const [command, amount] of input) {
    state = transformations[command](state, amount);
  }
  return state.x * -state.y;
}

export async function main(): Promise<void> {
  const input = await readInput();
  const pt1 = calcSolution(input, pt1Transformations);
  const pt2 = calcSolution(input, pt2Transformations);

  process.stdout.write(`Part 1: ${pt1}\nPart 2: ${pt2}\n`);
}
