const day = process.argv[2];

if (process.argv.length !== 3 || !/^\d{1,2}$/.test(day)) {
  process.stdout.write("The only command line argument is the day number!\n");
  process.exit(1);
}

type DayModule = { main: () => Promise<void> };
import(`./lib/day${day.padStart(2, "0")}`).then((m: DayModule) => m.main());

export {};
