import * as readline from "readline";

type Point = [number, number, number];
type PointsWithSignature = { points: Point[]; signature: number[] };

const confidence = 12;

// pairConfidence: choose 2 out of `confidence`
const pairConfidence = 66;

const rotations = {
  x: [
    [1, 0, 0],
    [0, 0, -1],
    [0, 1, 0]
  ],
  y: [
    [0, 0, 1],
    [0, 1, 0],
    [-1, 0, 0]
  ],
  z: [
    [0, -1, 0],
    [1, 0, 0],
    [0, 0, 1]
  ]
};

async function readBeacons(iterator: AsyncIterator<string, string, string>): Promise<Point[]> {
  await iterator.next();
  const beacons: Point[] = [];
  let result: IteratorResult<string, string>;
  while (!(result = await iterator.next()).done && result.value !== "") {
    beacons.push(result.value.split(",").map(Number) as Point);
  }
  return beacons.length > 0 ? beacons : null;
}

async function readInput(): Promise<Point[][]> {
  const stream = readline.createInterface({ input: process.stdin });
  const iterator: AsyncIterator<string, string, string> = stream[Symbol.asyncIterator]();
  const allBeacons: Point[][] = [];
  let beacons: Point[];
  while ((beacons = await readBeacons(iterator)) !== null) {
    allBeacons.push(beacons);
  }
  return allBeacons;
}

function rotateVector(matrix: number[][], vector: Point): Point {
  const transformed: Point = [0, 0, 0];
  for (let i = 0; i < vector.length; i++) {
    for (let j = 0; j < vector.length; j++) {
      transformed[i] += matrix[i][j] * vector[j];
    }
  }
  return transformed;
}

function isSameRotation(pointsA: Point[], pointsB: Point[]): boolean {
  for (let i = 0; i < pointsA.length; i++) {
    for (let j = 0; j < pointsA[0].length; j++) {
      if (pointsA[i][j] !== pointsB[i][j]) {
        return false;
      }
    }
  }
  return true;
}

function expand(originalPoints: Point[]): Point[][] {
  const expanded: Point[][] = [originalPoints];
  let added = true;
  while (added) {
    added = false;
    const newPoints: Point[][] = [];
    for (const rotation of Object.values(rotations)) {
      for (const points of expanded) {
        const transformed = points.map((point) => rotateVector(rotation, point));
        const notInExpanded = expanded.every((value) => !isSameRotation(value, transformed));
        const notInNewPoints = newPoints.every((value) => !isSameRotation(value, transformed));
        if (notInExpanded && notInNewPoints) {
          newPoints.push(transformed);
        }
      }
    }
    if (newPoints.length > 0) {
      expanded.push(...newPoints);
      added = true;
    }
  }
  return expanded;
}

function getDistance(pointA: Point, pointB: Point): number {
  let sum = 0;
  for (let i = 0; i < pointA.length; i++) {
    sum += Math.abs(pointA[i] - pointB[i]);
  }
  return sum;
}

function getSpan(points: Point[]): number {
  let max = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const distance = getDistance(points[i], points[j]);
      if (distance > max) {
        max = distance;
      }
    }
  }
  return max;
}

function generateSignature(points: Point[]): number[] {
  const signature: number[] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      signature.push(getDistance(points[i], points[j]));
    }
  }
  return signature;
}

function isMatchingSignature(signatureA: number[], signatureB: number[]): boolean {
  const set = new Set(signatureA);
  let intersection = 0;
  for (const signature of signatureB) {
    if (set.has(signature)) {
      intersection++;
    }
  }
  return intersection >= pairConfidence;
}

function matchBeacons(fixBeacons: Point[], beaconsToMatch: Point[]): Point {
  for (const referenceA of fixBeacons) {
    for (const referenceB of beaconsToMatch) {
      const offset = referenceB.map((_, i) => referenceA[i] - referenceB[i]) as Point;
      let matching = 0;
      for (const point of beaconsToMatch) {
        const transformed = point.map((_, i) => point[i] + offset[i]) as Point;
        if (fixBeacons.find((fixed) => fixed.every((_, i) => fixed[i] === transformed[i]))) {
          matching++;
        }
        if (matching >= confidence) {
          return offset;
        }
      }
    }
  }
  return null;
}

function matchExpandedBeacons(
  beacons: PointsWithSignature[],
  expandedBeacons: Point[][],
  toMatchSignature: number[]
): { offset: Point; beacons: Point[] } {
  for (const fixed of beacons) {
    if (!isMatchingSignature(fixed.signature, toMatchSignature)) {
      continue;
    }
    for (const toMatch of expandedBeacons) {
      const offset = matchBeacons(fixed.points, toMatch);
      if (offset) {
        const matched = toMatch.map((point) => point.map((_, i) => point[i] + offset[i]) as Point);
        return { offset, beacons: matched };
      }
    }
  }
  return null;
}

function buildMap(allBeacons: Point[][]): { scanners: Point[]; beacons: Point[] } {
  const expandedBeacons = allBeacons.map((beacons) => ({
    rotations: expand(beacons),
    signature: generateSignature(beacons)
  }));
  const matchedBeacons: PointsWithSignature[] = [
    { points: expandedBeacons[0].rotations[0], signature: expandedBeacons[0].signature }
  ];
  const scanners: Point[] = [[0, 0, 0]];
  expandedBeacons.splice(0, 1);

  while (expandedBeacons.length > 0) {
    for (let i = 0; i < expandedBeacons.length; i++) {
      const result = matchExpandedBeacons(matchedBeacons, expandedBeacons[i].rotations, expandedBeacons[i].signature);
      if (result) {
        matchedBeacons.push({ points: result.beacons, signature: expandedBeacons[i].signature });
        scanners.push(result.offset);
        expandedBeacons.splice(i, 1);
        break;
      }
    }
  }

  const uniqueBeacons: Point[] = [];
  for (const { points: beacons } of matchedBeacons) {
    for (const beacon of beacons) {
      const newUnique = uniqueBeacons.every((unique) => unique.some((_, i) => unique[i] !== beacon[i]));
      if (newUnique) {
        uniqueBeacons.push(beacon);
      }
    }
  }

  return { beacons: uniqueBeacons, scanners };
}

export async function main(): Promise<void> {
  const allBeacons = await readInput();
  const map = buildMap(allBeacons);
  const scannersSpan = getSpan(map.scanners);
  process.stdout.write(`Part 1: ${map.beacons.length}\nPart 2: ${scannersSpan}\n`);
}
