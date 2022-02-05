import * as readline from "readline";

type Image = { backgrund: boolean; pixels: boolean[][] };

async function readInput(): Promise<{ map: boolean[]; image: Image }> {
  const stream = readline.createInterface({ input: process.stdin });
  const iterator: AsyncIterator<string, string, string> = stream[Symbol.asyncIterator]();

  const map = (await iterator.next()).value.split("").map((char) => char === "#");
  await iterator.next();

  const pixels: boolean[][] = [];
  let result: IteratorResult<string, string>;
  while (!(result = await iterator.next()).done) {
    pixels.push(result.value.split("").map((char) => char === "#"));
  }

  return { map, image: { pixels, backgrund: false } };
}

function getPixel(image: Image, x: number, y: number): boolean {
  if (x >= image.pixels[0].length || x < 0 || y >= image.pixels.length || y < 0) {
    return image.backgrund;
  }
  return image.pixels[y][x];
}

function iteratePixel(image: Image, map: boolean[], x: number, y: number): boolean {
  const binary = new Array<number>(9);
  let i = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      binary[i++] = getPixel(image, x + dx, y + dy) ? 1 : 0;
    }
  }
  return map[Number.parseInt(binary.join(""), 2)];
}

function iterateImage(image: Image, map: boolean[]): Image {
  const pixels = new Array<boolean[]>(image.pixels.length + 2);
  for (let y = 0; y < pixels.length; y++) {
    pixels[y] = new Array(image.pixels[0].length + 2);
  }

  for (let y = 0; y < pixels.length; y++) {
    for (let x = 0; x < pixels[0].length; x++) {
      pixels[y][x] = iteratePixel(image, map, x - 1, y - 1);
    }
  }

  return {
    backgrund: image.backgrund ? map[map.length - 1] : map[0],
    pixels
  };
}

function getLightPixelCount(image: Image): number {
  let count = 0;
  for (let y = 0; y < image.pixels.length; y++) {
    for (let x = 0; x < image.pixels[0].length; x++) {
      if (image.pixels[y][x]) {
        count++;
      }
    }
  }
  return count;
}

export async function main(): Promise<void> {
  let { map, image } = await readInput();

  for (let i = 0; i < 2; i++) {
    image = iterateImage(image, map);
  }
  const pt1 = getLightPixelCount(image);

  for (let i = 0; i < 48; i++) {
    image = iterateImage(image, map);
  }
  const pt2 = getLightPixelCount(image);

  process.stdout.write(`Part 1: ${pt1}\nPart 2: ${pt2}\n`);
}
