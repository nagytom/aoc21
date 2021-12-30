import * as readline from "readline";

type Graph = { [key: string]: string[] };
const startVertex = "start";
const endVertex = "end";

async function buildGraph(): Promise<Graph> {
  const stream = readline.createInterface({ input: process.stdin });
  const graph: Graph = {};
  for await (const line of stream) {
    const edge = line.split("-");
    if (edge[0] === endVertex || edge[1] === startVertex) {
      edge.reverse();
    }
    graph[edge[0]] = graph[edge[0]] ?? [];
    graph[edge[1]] = graph[edge[1]] ?? [];
    graph[edge[0]].push(edge[1]);
    if (edge[0] !== startVertex && edge[1] !== endVertex) {
      graph[edge[1]].push(edge[0]);
    }
  }
  return graph;
}

function hasDuplication(path: string[]): boolean {
  const smallVertices = path.filter((vertex) => vertex.toLowerCase() === vertex);
  const set = new Set(smallVertices);
  return set.size !== smallVertices.length;
}

function generateNextPaths(graph: Graph, path: string[], allowSingleDuplication: boolean): string[][] {
  const nextPaths: string[][] = [];
  const lastVertex = path[path.length - 1];
  for (const vertex of graph[lastVertex]) {
    if (
      vertex.toUpperCase() === vertex ||
      !path.includes(vertex) ||
      (allowSingleDuplication && !hasDuplication(path))
    ) {
      nextPaths.push([...path, vertex]);
    }
  }
  return nextPaths;
}

function countAllPaths(graph: Graph, allowSingleDuplication: boolean): number {
  const queue: string[][] = [[startVertex]];
  let count = 0;
  while (queue.length > 0) {
    const current = queue.pop();
    if (current[current.length - 1] === endVertex) {
      count++;
      continue;
    }
    for (const path of generateNextPaths(graph, current, allowSingleDuplication)) {
      queue.push(path);
    }
  }
  return count;
}

export async function main(): Promise<void> {
  const graph = await buildGraph();
  const pt1 = countAllPaths(graph, false);
  const pt2 = countAllPaths(graph, true);
  process.stdout.write(`Part 1: ${pt1}\nPart 2: ${pt2}\n`);
}
