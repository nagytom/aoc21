import * as readline from "readline";

const openingPairs = { ")": "(", "]": "[", "}": "{", ">": "<" };
const errorScores = { ")": 3, "]": 57, "}": 1197, ">": 25137 };
const completionScores = { "(": 1, "[": 2, "{": 3, "<": 4 };

function getCompletionScore(completionString: string[]): number {
  let score = 0;
  for (const symbol of completionString) {
    score = score * 5 + completionScores[symbol];
  }
  return score;
}

export async function main(): Promise<void> {
  const stream = readline.createInterface({ input: process.stdin });
  let errorScore = 0;
  const incompleteScores: number[] = [];

  for await (const line of stream) {
    const symbols: string[] = [];
    let incorrect = false;
    for (const symbol of line) {
      if (symbol === "(" || symbol === "[" || symbol === "{" || symbol === "<") {
        symbols.push(symbol);
      } else {
        const topSymbol = symbols.pop();
        if (topSymbol !== openingPairs[symbol]) {
          errorScore += errorScores[symbol];
          incorrect = true;
          break;
        }
      }
    }
    if (!incorrect && symbols.length > 0) {
      incompleteScores.push(getCompletionScore(symbols.reverse()));
    }
  }

  incompleteScores.sort((a, b) => a - b);
  const middleScore = incompleteScores[Math.floor(incompleteScores.length / 2)];

  process.stdout.write(`Part 1: ${errorScore}\nPart 2: ${middleScore}\n`);
}
