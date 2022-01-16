import { Readable } from "stream";

interface ProcessedPacket {
  versionSum: number;
  value: number;
}

class BitStream {
  private buffer: string = null;
  private _cursor = 0;

  constructor(private readonly readable: Readable) {}

  get cursor(): number {
    return this._cursor;
  }

  async init(): Promise<void> {
    if (this.buffer !== null) {
      return;
    }
    this.buffer = "";
    for await (const chunk of this.readable) {
      for (const char of chunk.toString().trim()) {
        this.buffer += Number.parseInt(char, 16).toString(2).padStart(4, "0");
      }
    }
  }

  read(length: number): string {
    if (this._cursor >= this.buffer.length) {
      return null;
    }
    const result = this.buffer.substring(this._cursor, this._cursor + length);
    this._cursor += length;
    return result;
  }

  readInt(length: number): number {
    return Number.parseInt(this.read(length), 2);
  }
}

function processLiteral(input: BitStream): number {
  let literal = "";
  let finished = false;
  while (!finished) {
    const segment = input.read(5);
    literal += segment.substring(1);
    finished = segment[0] === "0";
  }
  return Number.parseInt(literal, 2);
}

function processOperator(values: number[], type: number): number {
  let result: number;
  switch (type) {
    case 0:
      result = values.reduce((acc, value) => acc + value, 0);
      break;
    case 1:
      result = values.reduce((acc, value) => acc * value, 1);
      break;
    case 2:
      result = Math.min(...values);
      break;
    case 3:
      result = Math.max(...values);
      break;
    case 5:
      result = values[0] > values[1] ? 1 : 0;
      break;
    case 6:
      result = values[0] < values[1] ? 1 : 0;
      break;
    case 7:
      result = values[0] === values[1] ? 1 : 0;
      break;
  }
  return result;
}

function processPacket(input: BitStream): ProcessedPacket {
  const version = input.readInt(3);
  const typeId = input.readInt(3);
  let versionSum = version;
  let value: number;

  if (typeId === 4) {
    value = processLiteral(input);
  } else {
    const lengthType = input.readInt(1);
    const subPackets: ProcessedPacket[] = [];
    if (lengthType === 0) {
      const length = input.readInt(15);
      const originalCursor = input.cursor;
      while (input.cursor < originalCursor + length) {
        subPackets.push(processPacket(input));
      }
    } else {
      const length = input.readInt(11);
      for (let i = 0; i < length; i++) {
        subPackets.push(processPacket(input));
      }
    }
    versionSum += subPackets.reduce((acc, value) => acc + value.versionSum, 0);
    value = processOperator(
      subPackets.map((subPacket) => subPacket.value),
      typeId
    );
  }

  return { versionSum: versionSum, value };
}

export async function main(): Promise<void> {
  const input = new BitStream(process.stdin);
  await input.init();
  const { value, versionSum } = processPacket(input);
  process.stdout.write(`Part 1: ${versionSum}\nPart 2: ${value}\n`);
}
