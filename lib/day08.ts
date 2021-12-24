import * as readline from "readline";

type Entry = { digitPatterns: string[]; outputPatterns: string[] };

async function readInput(): Promise<Entry[]> {
  const stream = readline.createInterface({ input: process.stdin });
  const input: Entry[] = [];
  for await (const line of stream) {
    const [digitPatterns, outputPatterns] = line.split(" | ");
    input.push({ digitPatterns: digitPatterns.split(" "), outputPatterns: outputPatterns.split(" ") });
  }
  return input;
}

function isEqualFrequency(a: number[], b: number[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

function normalizePattern(pattern: string): string {
  return pattern.split("").sort().join("");
}

function decodeEntry(entry: Entry, identityFrequencies: number[][]): number[] {
  const frequencyPatterns = calcFrequencyPatterns(entry.digitPatterns);
  const patternDigitMap: { [key: string]: number } = {};
  for (let i = 0; i < entry.digitPatterns.length; i++) {
    let digit = identityFrequencies.findIndex((value) => isEqualFrequency(value, frequencyPatterns[i]));
    patternDigitMap[normalizePattern(entry.digitPatterns[i])] = digit;
  }
  return entry.outputPatterns.map((value) => patternDigitMap[normalizePattern(value)]);
}

function calcFrequencyPatterns(patterns: string[]): number[][] {
  const charFrequencies: { [key: string]: number } = {};
  const frequencyPatterns: number[][] = [];
  for (const pattern of patterns) {
    const frequency: number[] = [];
    for (const char of pattern) {
      if (!(char in charFrequencies)) {
        charFrequencies[char] = patterns.reduce((acc, value) => acc + (value.includes(char) ? 1 : 0), 0);
      }
      frequency.push(charFrequencies[char]);
    }
    frequencyPatterns.push(frequency.sort((a, b) => a - b));
  }
  return frequencyPatterns;
}

export async function main(): Promise<void> {
  const input = await readInput();

  const identityPatterns = ["abcefg", "cf", "acdeg", "acdfg", "bcdf", "abdfg", "abdefg", "acf", "abcdefg", "abcdfg"];
  const identityFrequencies = calcFrequencyPatterns(identityPatterns);

  let pt1 = 0;
  let pt2 = 0;
  for (const entry of input) {
    const decoded = decodeEntry(entry, identityFrequencies);
    for (const digit of decoded) {
      if (digit === 1 || digit === 4 || digit === 7 || digit === 8) {
        pt1++;
      }
    }
    pt2 += Number.parseInt(decoded.join(""));
  }

  process.stdout.write(`Part 1: ${pt1}\nPart 2: ${pt2}\n`);
}
