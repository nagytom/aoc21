import * as readline from "readline";

type Board = { value: number; found: boolean }[][];

async function readInput(): Promise<[boards: Board[], drawnNumbers: number[]]> {
  const stream = readline.createInterface({ input: process.stdin });
  const lines = stream[Symbol.asyncIterator]();
  const drawnNumbers = ((await lines.next()).value as string).split(",").map(Number);
  await lines.next();

  let iteratorResult: IteratorResult<string, string> = await lines.next();
  let currentBoard: Board = [];
  const boards: Board[] = [];
  while (!iteratorResult.done) {
    const line = iteratorResult.value;
    if (line === "") {
      boards.push(currentBoard);
      currentBoard = [];
    } else {
      const boardLine = line
        .split(" ")
        .filter((value) => value)
        .map((value) => ({ value: Number(value), found: false }));
      currentBoard.push(boardLine);
    }
    iteratorResult = await lines.next();
  }
  boards.push(currentBoard);

  return [boards, drawnNumbers];
}

function checkRow(board: Board, row: number): boolean {
  for (let i = 0; i < board[row].length; i++) {
    if (!board[row][i].found) {
      return false;
    }
  }
  return true;
}

function checkCol(board: Board, col: number): boolean {
  for (let i = 0; i < board.length; i++) {
    if (!board[i][col].found) {
      return false;
    }
  }
  return true;
}

function checkBoad(board: Board): boolean {
  for (let i = 0; i < board.length; i++) {
    if (checkRow(board, i)) {
      return true;
    }
  }
  for (let i = 0; i < board[0].length; i++) {
    if (checkCol(board, i)) {
      return true;
    }
  }
  return false;
}

function findWinningBoards(boards: Board[]): number[] {
  const winning = [];
  for (let i = 0; i < boards.length; i++) {
    if (checkBoad(boards[i])) {
      winning.push(i);
    }
  }
  return winning;
}

function applyDraw(boards: Board[], drawn: number): void {
  for (const board of boards) {
    for (const row of board) {
      for (const cell of row) {
        if (cell.value === drawn) {
          cell.found = true;
        }
      }
    }
  }
}

function calcScore(board: Board, lastDrawn: number): number {
  let sum = 0;
  for (const row of board) {
    for (const cell of row) {
      if (!cell.found) {
        sum += cell.value;
      }
    }
  }
  return sum * lastDrawn;
}

export async function main(): Promise<void> {
  const [boards, drawnNumbers] = await readInput();
  const scores: number[] = [];
  for (let i = 0; i < drawnNumbers.length && boards.length > 0; i++) {
    applyDraw(boards, drawnNumbers[i]);
    const winning = findWinningBoards(boards);
    for (let j = 0; j < winning.length; j++) {
      const score = calcScore(boards[winning[j]], drawnNumbers[i]);
      scores.push(score);
    }
    for (let j = winning.length - 1; j >= 0; j--) {
      boards.splice(winning[j], 1);
    }
  }

  process.stdout.write(`Part 1: ${scores[0]}\nPart 2: ${scores[scores.length - 1]}\n`);
}
