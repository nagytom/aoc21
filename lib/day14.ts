import * as readline from "readline";

type Rules = { [key: string]: [string, string] };
type Pairs = { [key: string]: number };

async function readInput(): Promise<{ template: string; rules: Rules }> {
  const stream = readline.createInterface({ input: process.stdin });
  const iterator: AsyncIterator<string, string, string> = stream[Symbol.asyncIterator]();
  const template = (await iterator.next()).value;
  await iterator.next();

  const rules: Rules = {};
  let result: IteratorResult<string, string>;
  while (!(result = await iterator.next()).done) {
    const [left, right] = result.value.split(" -> ");
    rules[left] = [`${left[0]}${right}`, `${right}${left[1]}`];
  }

  return { template, rules };
}

function generateNextState(state: Pairs, rules: Rules): Pairs {
  const newState: Pairs = {};
  for (const pair of Object.keys(state)) {
    for (const newPair of rules[pair]) {
      newState[newPair] = (newState[newPair] ?? 0) + state[pair];
    }
  }
  return newState;
}

function getCharFrequency(template: string, state: Pairs): [string, number][] {
  const charFreq: { [key: string]: number } = {};
  charFreq[template[0]] = 1;
  charFreq[template[template.length - 1]] = 1;
  for (const pair of Object.keys(state)) {
    charFreq[pair[0]] = (charFreq[pair[0]] ?? 0) + state[pair];
    charFreq[pair[1]] = (charFreq[pair[1]] ?? 0) + state[pair];
  }
  for (const char of Object.keys(charFreq)) {
    charFreq[char] /= 2;
  }
  return Object.entries(charFreq).sort(([, a], [, b]) => b - a);
}

export async function main(): Promise<void> {
  const { rules, template } = await readInput();

  let state: Pairs = {};
  for (let i = 1; i < template.length; i++) {
    const pair = `${template[i - 1]}${template[i]}`;
    state[pair] = (state[pair] ?? 0) + 1;
  }

  for (let i = 0; i < 10; i++) {
    state = generateNextState(state, rules);
  }

  const charFrequency1 = getCharFrequency(template, state);
  const pt1 = charFrequency1[0][1] - charFrequency1[charFrequency1.length - 1][1];

  for (let i = 0; i < 30; i++) {
    state = generateNextState(state, rules);
  }

  const charFrequency2 = getCharFrequency(template, state);
  const pt2 = charFrequency2[0][1] - charFrequency2[charFrequency2.length - 1][1];

  process.stdout.write(`Part 1: ${pt1}\nPart 2: ${pt2}\n`);
}
