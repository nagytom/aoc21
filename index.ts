import { performance } from "perf_hooks";

const day = process.argv[2];

if (process.argv.length !== 3 || !/^\d{1,2}$/.test(day)) {
  process.stdout.write("The only command line argument is the day number!\n");
  process.exit(1);
}

type DayModule = { main: () => Promise<void> };
(async () => {
  const m: DayModule = await import(`./lib/day${day.padStart(2, "0")}`);
  const start = performance.now();
  await m.main();
  const execTime = Math.round(performance.now() - start);
  process.stdout.write(`Execution time: ${execTime}ms\n`);
})();

export {};
