type Vars = [number, number, number][];

const digitLoopPattern =
  "inp w\nmul x 0\nadd x z\nmod x 26\ndiv z (\\d+)\nadd x (-?\\d+)\neql x w\neql x 0\nmul y 0\nadd y 25\nmul y x\n" +
  "add y 1\nmul z y\nmul y 0\nadd y w\nadd y (\\d+)\nmul y x\nadd z y\n";

async function readInput(): Promise<Vars> {
  const allChunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    allChunks.push(chunk);
  }
  const input = Buffer.concat(allChunks).toString();

  const vars: Vars = [];
  const digitLoopRegEx = new RegExp(digitLoopPattern, "g");
  let match: RegExpExecArray = null;
  while ((match = digitLoopRegEx.exec(input)) !== null) {
    vars.push([Number(match[1]), Number(match[2]), Number(match[3])]);
  }

  return vars;
}

function backtrack(solution: number[], z: number, vars: Vars, findMax: boolean): number[] {
  const level = solution.length;
  if (level === vars.length) {
    return z === 0 ? solution : null;
  }

  for (let i = 0; i < 9; i++) {
    const digit = findMax ? 9 - i : i + 1;
    const cond = (z % 26) + vars[level][1] !== digit;
    let newZ = Math.trunc(z / vars[level][0]);
    if (cond) {
      newZ = newZ * 26 + digit + vars[level][2];
    }
    if (vars[level][0] === 26 && cond) {
      continue;
    }
    const foundSolution = backtrack([...solution, digit], newZ, vars, findMax);
    if (foundSolution) {
      return foundSolution;
    }
  }
  return null;
}

function solve(vars: Vars, findMax: boolean): number {
  return Number(backtrack([], 0, vars, findMax).join(""));
}

export async function main(): Promise<void> {
  const vars = await readInput();

  if (vars.length !== 14) {
    process.stdout.write("Unexpected input!\n");
    return;
  }

  const pt1 = solve(vars, true);
  const pt2 = solve(vars, false);

  process.stdout.write(`Part 1: ${pt1}\nPart 2: ${pt2}\n`);
}
