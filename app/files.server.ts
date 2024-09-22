// see Load some data from a file once only and use it in root.jsx https://github.com/remix-run/remix/discussions/4504
// see Remix With Clean Architecture https://betterprogramming.pub/remix-with-clean-architecture-e561eb5fa3cd
// see How to set up Remix analytics, feature flags, and more https://posthog.com/tutorials/remix-analytics

// importing json directly causes errors like:
// FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
// import chords from "../public/assets/chords/chords.json";

import { promises as fs } from "fs"; // or import fs from "fs/promises";
import path from "path";

export async function readDataFile(dataFilePath: string) {
  console.log(`Trying to read data file ${dataFilePath} ...`);

  try {
    const filePath = path.resolve(dataFilePath);
    console.log(`Found absolute file path: ${filePath}`);

    const rawFileContent = await fs.readFile(filePath, { encoding: "utf-8" });
    const data = JSON.parse(rawFileContent);

    return data;
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
      return { error: e.message };
    } else {
      throw e;
    }
  }
}
