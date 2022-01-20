import * as readline from "readline";

type Node = [Node, Node] | number;

async function readInput(): Promise<Node[]> {
  const stream = readline.createInterface({ input: process.stdin });
  const nodes: Node[] = [];
  for await (const line of stream) {
    nodes.push(JSON.parse(line));
  }
  return nodes;
}

function explode(root: Node): boolean {
  const stack: { current: Node; parent: Node; depth: number }[] = [{ current: root, parent: null, depth: 0 }];
  let left: Node = null;
  let toExplode: Node = null;
  let toExplodeParent: Node = null;
  let right: Node = null;

  while (stack.length > 0) {
    const { current, depth, parent } = stack.pop();
    if (Number.isInteger(current)) {
      if (!toExplode) {
        left = parent;
        continue;
      } else {
        right = parent;
        break;
      }
    }
    if (!toExplode && depth >= 4 && Number.isInteger(current[0]) && Number.isInteger(current[1])) {
      toExplode = current;
      toExplodeParent = parent;
      continue;
    }
    stack.push({ current: current[1], parent: current, depth: depth + 1 });
    stack.push({ current: current[0], parent: current, depth: depth + 1 });
  }

  if (toExplode) {
    if (left && Number.isInteger(left[1])) {
      left[1] += toExplode[0];
    } else if (left) {
      left[0] += toExplode[0];
    }

    if (right && Number.isInteger(right[0])) {
      right[0] += toExplode[1];
    } else if (right) {
      right[1] += toExplode[1];
    }

    if (toExplodeParent[0] === toExplode) {
      toExplodeParent[0] = 0;
    } else {
      toExplodeParent[1] = 0;
    }
  }

  return !!toExplode;
}

function splitNumber(num: number): [number, number] {
  return [Math.floor(num / 2), Math.ceil(num / 2)];
}

function split(root: Node): boolean {
  const stack: { current: Node; parent: Node }[] = [{ current: root, parent: null }];
  let toSplitParent: Node = null;

  while (stack.length > 0) {
    const { current, parent } = stack.pop();
    if (Number.isInteger(current)) {
      if (current > 9) {
        toSplitParent = parent;
        break;
      } else {
        continue;
      }
    }
    stack.push({ current: current[1], parent: current });
    stack.push({ current: current[0], parent: current });
  }

  if (toSplitParent) {
    if (Number.isInteger(toSplitParent[0]) && toSplitParent[0] > 9) {
      toSplitParent[0] = splitNumber(toSplitParent[0]);
    } else {
      toSplitParent[1] = splitNumber(toSplitParent[1]);
    }
  }

  return !!toSplitParent;
}

function cloneNode(root: Node): Node {
  if (Array.isArray(root)) {
    return [cloneNode(root[0]), cloneNode(root[1])];
  }
  return root;
}

function reduce(root: Node): Node {
  const clonedRoot = cloneNode(root);
  let finished = false;
  while (!finished) {
    finished = true;
    if (explode(clonedRoot)) {
      finished = false;
      continue;
    }
    if (split(clonedRoot)) {
      finished = false;
      continue;
    }
  }
  return clonedRoot;
}

function getMagnitude(root: Node): number {
  if (Array.isArray(root)) {
    return 3 * getMagnitude(root[0]) + 2 * getMagnitude(root[1]);
  }
  return root;
}

function calcPart1(nodes: Node[]): number {
  let root: Node = null;
  for (const node of nodes) {
    if (root === null) {
      root = node;
    } else {
      root = [root, node];
    }
    root = reduce(root);
  }
  return getMagnitude(root);
}

function calcPart2(nodes: Node[]): number {
  let max = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < nodes.length; j++) {
      const magnitude = getMagnitude(reduce([nodes[i], nodes[j]]));
      max = magnitude > max ? magnitude : max;
    }
  }
  return max;
}

export async function main(): Promise<void> {
  const nodes = await readInput();
  const pt1 = calcPart1(nodes);
  const pt2 = calcPart2(nodes);
  process.stdout.write(`Part 1: ${pt1}\nPart 2: ${pt2}\n`);
}
