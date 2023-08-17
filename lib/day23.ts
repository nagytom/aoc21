import * as readline from "readline";

const actors = ["A", "B", "C", "D"];
const actorCost = { A: 1, B: 10, C: 100, D: 1000 };

const roomFirstRow = 2;
const roomColOffset = 3;
const hallwayRow = 1;
const hallwayFirstCol = 1;

type Tile = " " | "#" | "A" | "B" | "C" | "D";
type State = Tile[][];
type Coordinate = [number, number];
type Move = { from: Coordinate; to: Coordinate };

const pt2Addition = "  #D#C#B#A#|  #D#B#A#C#".split("|").map((row) => row.split("")) as Tile[][];

async function readInput(): Promise<State> {
  const stream = readline.createInterface({ input: process.stdin });
  const input: State = [];
  for await (const line of stream) {
    input.push(line.replaceAll(".", " ").split("") as Tile[]);
  }
  return input;
}

function canMove(state: State, from: Coordinate, to: Coordinate): boolean {
  const verticalDir = from[0] - to[0] < 0 ? 1 : -1;
  const horizontalDir = from[1] - to[1] < 0 ? 1 : -1;

  let current = from;
  while (current[0] !== to[0] || current[1] !== to[1]) {
    let next: Coordinate;
    if (current[0] !== to[0]) {
      next = [current[0] + verticalDir, current[1]];
    } else {
      next = [current[0], current[1] + horizontalDir];
    }
    if (state[next[0]][next[1]] !== " ") {
      break;
    }
    current = next;
  }

  if (current[0] === to[0] && current[1] === to[1]) {
    return true;
  }

  current = from;
  while (current[0] !== to[0] || current[1] !== to[1]) {
    let next: Coordinate;
    if (current[1] !== to[1]) {
      next = [current[0], current[1] + horizontalDir];
    } else {
      next = [current[0] + verticalDir, current[1]];
    }
    if (state[next[0]][next[1]] !== " ") {
      break;
    }
    current = next;
  }

  return current[0] === to[0] && current[1] === to[1];
}

function* iterateRoomTiles(state: State) {
  for (let roomIndex = 0; roomIndex < actors.length; roomIndex++) {
    const col = roomIndex * 2 + roomColOffset;
    for (let row = roomFirstRow; state[row][col] !== "#"; row++) {
      yield { row, col, roomIndex, tile: state[row][col] };
    }
  }
}

function* iterateHallwayTiles(state: State) {
  for (let col = hallwayFirstCol; state[hallwayRow][col] !== "#"; col++) {
    yield { row: hallwayRow, col, tile: state[hallwayRow][col] };
  }
}

function generateFromHallwayToRoom(state: State): Move[] {
  const transitions: Move[] = [];

  for (const { tile: actor, col, row } of iterateHallwayTiles(state)) {
    if (actor === " ") {
      continue;
    }

    const roomCol = actors.indexOf(actor) * 2 + roomColOffset;
    let differentActorInRoom = false;
    for (let i = roomFirstRow; state[i][roomCol] !== "#"; i++) {
      if (state[i][roomCol] !== " " && state[i][roomCol] !== actor) {
        differentActorInRoom = true;
        break;
      }
    }
    if (differentActorInRoom) {
      continue;
    }

    let targetRow = roomFirstRow - 1;
    while (state[targetRow + 1][roomCol] === " ") {
      targetRow++;
    }
    if (targetRow < roomFirstRow) {
      continue;
    }

    const from: [number, number] = [row, col];
    const to: [number, number] = [targetRow, roomCol];

    if (!canMove(state, from, to)) {
      continue;
    }

    transitions.push({ from, to });
  }

  return transitions;
}

function getFreeHallwayColsForRoom(state: State, roomCol: number): number[] {
  const result: number[] = [];

  const aboveRoomCols = actors.map((_, i) => i * 2 + roomColOffset);

  for (let col = roomCol + 1; state[hallwayRow][col] === " "; col++) {
    if (!aboveRoomCols.includes(col)) {
      result.push(col);
    }
  }

  for (let col = roomCol - 1; state[hallwayRow][col] === " "; col--) {
    if (!aboveRoomCols.includes(col)) {
      result.push(col);
    }
  }

  return result;
}

function generateFromRoomToHallway(state: State): Move[] {
  let transitions: Move[] = [];

  for (let room = 0; room < actors.length; room++) {
    const roomCol = room * 2 + roomColOffset;
    const roomOwner = actors[room];

    let topActorRow = roomFirstRow;
    while (state[topActorRow][roomCol] === " ") {
      topActorRow++;
    }
    if (state[topActorRow][roomCol] === "#") {
      continue;
    }

    const isHomeRoom = state[topActorRow][roomCol] === roomOwner;

    let otherActorBelow = false;
    let row = topActorRow + 1;
    while (state[row][roomCol] !== "#") {
      if (state[row][roomCol] !== roomOwner) {
        otherActorBelow = true;
        break;
      }
      row++;
    }

    if (isHomeRoom && !otherActorBelow) {
      continue;
    }

    const newTransitions = getFreeHallwayColsForRoom(state, roomCol).map(
      (hallwayCol): Move => ({
        from: [topActorRow, roomCol],
        to: [hallwayRow, hallwayCol]
      })
    );

    transitions = [...transitions, ...newTransitions];
  }

  return transitions;
}

function moveActor(state: State, from: Coordinate, to: Coordinate): State {
  const newState = state.map((row) => [...row]);

  const swap = newState[from[0]][from[1]];
  newState[from[0]][from[1]] = newState[to[0]][to[1]];
  newState[to[0]][to[1]] = swap;

  return newState;
}

function dist(from: Coordinate, to: Coordinate): number {
  return Math.abs(from[0] - to[0]) + Math.abs(from[1] - to[1]);
}

function cost(state: State, from: Coordinate, to: Coordinate): number {
  return dist(from, to) * actorCost[state[from[0]][from[1]]];
}

function expand(state: State): [State, number][] {
  return [...generateFromHallwayToRoom(state), ...generateFromRoomToHallway(state)].map(({ from, to }) => [
    moveActor(state, from, to),
    cost(state, from, to)
  ]);
}

function isFinalState(state: State): boolean {
  for (const { roomIndex, tile } of iterateRoomTiles(state)) {
    if (tile !== actors[roomIndex]) {
      return false;
    }
  }
  return true;
}

function hash(state: State): string {
  let i = 0;
  const positions: string[] = [];

  for (const { tile } of iterateHallwayTiles(state)) {
    if (tile !== " ") {
      positions.push(`${tile}${i}`);
    }
    i++;
  }

  for (const { tile } of iterateRoomTiles(state)) {
    if (tile !== " ") {
      positions.push(`${tile}${i}`);
    }
    i++;
  }

  return positions.join("|");
}

function heuristic(state: State): number {
  let estimation = 0;

  let bottomRow = roomFirstRow;
  while (state[bottomRow + 1][roomColOffset] !== "#") {
    bottomRow++;
  }

  for (const { tile, col, row } of iterateHallwayTiles(state)) {
    if (tile !== " ") {
      const homeCol = actors.indexOf(tile) * 2 + roomColOffset;
      estimation += cost(state, [row, col], [bottomRow, homeCol]);
    }
  }

  for (const { tile, col, row } of iterateRoomTiles(state)) {
    if (tile === " ") {
      continue;
    }
    const homeCol = actors.indexOf(tile) * 2 + roomColOffset;
    if (col === homeCol) {
      estimation += (bottomRow - row) * actorCost[tile];
    } else {
      const toHallway = row - hallwayRow;
      const inHallway = Math.abs(col - homeCol);
      const toRoom = bottomRow - hallwayRow;
      estimation += (toHallway + inHallway + toRoom) * actorCost[tile];
    }
  }

  return estimation;
}

function popMin(open: Map<string, [State, number]>): [string, State] {
  let min: [string, State, number] = [null, null, Number.POSITIVE_INFINITY];
  for (const [key, [state, estimation]] of open) {
    if (estimation < min[2]) {
      min = [key, state, estimation];
    }
  }
  open.delete(min[0]);
  return [min[0], min[1]];
}

function solveAStar(startingState: State): number {
  const open = new Map<string, [State, number]>();
  const score = new Map<string, number>();

  const startingStateHash = hash(startingState);
  open.set(startingStateHash, [startingState, heuristic(startingState)]);
  score.set(startingStateHash, 0);

  while (open.size > 0) {
    const [currentKey, currentState] = popMin(open);
    const currentScore = score.get(currentKey);

    if (isFinalState(currentState)) {
      return currentScore;
    }

    for (const [next, stepCost] of expand(currentState)) {
      const nextKey = hash(next);
      const knownScore = score.get(nextKey) ?? Number.POSITIVE_INFINITY;
      const newScore = currentScore + stepCost;
      if (knownScore > newScore) {
        open.set(nextKey, [next, newScore + heuristic(next)]);
        score.set(nextKey, newScore);
      }
    }
  }

  return Number.POSITIVE_INFINITY;
}

export async function main(): Promise<void> {
  const startingState = await readInput();
  const pt1 = solveAStar(startingState);

  const pt2StartingState = [...startingState];
  pt2StartingState.splice(roomFirstRow + 1, 0, ...pt2Addition);
  const pt2 = solveAStar(pt2StartingState);

  process.stdout.write(`Part 1: ${pt1}\nPart 2: ${pt2}\n`);
}
