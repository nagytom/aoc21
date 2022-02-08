import * as readline from "readline";

const dieLimit = 100;
const oneRoundRolls = 3;
const positionLimit = 10;
const pt1WinLimit = 1000;
const pt2WinLimit = 21;
const minRoll = 3;
const maxRoll = 9;
const probabilities = { 3: 1, 4: 3, 5: 6, 6: 7, 7: 6, 8: 3, 9: 1 };

async function readInput(): Promise<number[]> {
  const stream = readline.createInterface({ input: process.stdin });
  const positions: number[] = [];
  for await (const line of stream) {
    const match = /^Player \d starting position: (\d+)$/.exec(line);
    positions.push(Number(match[1]));
  }
  return positions;
}

function simulatePart1(startingPositions: number[]): number {
  const positions = [...startingPositions];
  const scores = positions.map(() => 0);
  let die = 1;
  let player = 0;
  let rolls = 0;
  while (scores.every((score) => score < pt1WinLimit)) {
    for (let i = 0; i < oneRoundRolls; i++) {
      positions[player] = ((positions[player] + die - 1) % positionLimit) + 1;
      die = (die % dieLimit) + 1;
    }
    scores[player] += positions[player];
    player = (player + 1) % positions.length;
    rolls += oneRoundRolls;
  }
  return Math.min(...scores) * rolls;
}

class Memo {
  private readonly results = new Map<string, [number, number]>();

  set(
    position0: number,
    position1: number,
    score0: number,
    score1: number,
    player: number,
    result: [number, number]
  ): void {
    const key = `${position0};${position1};${score0};${score1};${player}`;
    this.results.set(key, result);
  }

  get(position0: number, position1: number, score0: number, score1: number, player: number): [number, number] {
    const key = `${position0};${position1};${score0};${score1};${player}`;
    return this.results.get(key);
  }
}

function simulatePart2(
  position0: number,
  position1: number,
  score0: number,
  score1: number,
  player: number,
  memo: Memo
): [number, number] {
  const savedResult = memo.get(position0, position1, score0, score1, player);
  if (savedResult) {
    return savedResult;
  }

  if (score0 >= pt2WinLimit || score1 >= pt2WinLimit) {
    const result: [number, number] = score0 >= pt2WinLimit ? [1, 0] : [0, 1];
    memo.set(position0, position1, score0, score1, player, result);
    return result;
  }

  let wins0 = 0;
  let wins1 = 0;
  for (let roll = minRoll; roll <= maxRoll; roll++) {
    let newPosition0 = position0;
    let newPosition1 = position1;
    let newScore0 = score0;
    let newScore1 = score1;
    let newPlayer = player;
    if (player === 0) {
      newPosition0 = ((position0 + roll - 1) % positionLimit) + 1;
      newScore0 += newPosition0;
      newPlayer = 1;
    } else {
      newPosition1 = ((position1 + roll - 1) % positionLimit) + 1;
      newScore1 += newPosition1;
      newPlayer = 0;
    }
    const [result0, result1] = simulatePart2(newPosition0, newPosition1, newScore0, newScore1, newPlayer, memo);
    wins0 += probabilities[roll] * result0;
    wins1 += probabilities[roll] * result1;
  }

  memo.set(position0, position1, score0, score1, player, [wins0, wins1]);
  return [wins0, wins1];
}

export async function main(): Promise<void> {
  const startingPositions = await readInput();
  const pt1 = simulatePart1(startingPositions);
  const pt2results = simulatePart2(startingPositions[0], startingPositions[1], 0, 0, 0, new Memo());
  const pt2 = Math.max(...pt2results);
  process.stdout.write(`Part 1: ${pt1}\nPart 2: ${pt2}\n`);
}
