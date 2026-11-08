import fs, { type FileHandle } from "node:fs/promises";
import process from "node:process";
import { BuildOutput } from "./build-output.js";

const inputFilePath = process.argv[2];
const outputFilePath = process.argv[3];

let readFileHandle: FileHandle | undefined;
let writeFileHandle: FileHandle | undefined;

if (inputFilePath && outputFilePath && inputFilePath.includes(".json") && outputFilePath.includes(".json")) {
  try {
    readFileHandle = await fs.open(inputFilePath, "r");
    writeFileHandle = await fs.open(outputFilePath, "w");

    const fileReadStream = readFileHandle.createReadStream();
    const fileWriteStream = writeFileHandle.createWriteStream();
    const fileStat = await readFileHandle.stat();

    if (fileStat.size === 0) {
      throw new Error("The file is empty.");
    }

    const inputFileName = inputFilePath.slice(inputFilePath.lastIndexOf("/") + 1);
    const validChunks: Buffer[] = [];
    const manager = {
      firstChunk: true,
      lastChunk: false,
      openBracket: false,
      closeBracket: false,
      spare: "",
    };

    // const transactions = new Set();

    for await (const chunk of fileReadStream) {
      const bufferToString = chunk.toString("utf-8");
      const hasFirstBracket = bufferToString.includes("[");
      const hasLastBracket = bufferToString.includes("]");

      if (manager.firstChunk && hasFirstBracket && !hasLastBracket) {
        const lastValidIndex = bufferToString.lastIndexOf("}");
        const dataJSON = JSON.parse(`[${bufferToString.slice(1, lastValidIndex + 1).trim()}]`);
        manager.spare = bufferToString.slice(lastValidIndex);

        manager.openBracket = true;
        manager.firstChunk = false;

        console.dir(bufferToString);
        continue;
      }

      // console.log(bufferToString);
      // break;

      // if (bufferToString.includes("]")) {
      //   manager.lastChunk = true;
      //   manager.closeBracket = true;
      // }

      // const dataJSON = bufferToString
      //   .slice(1, lastValidIndex + 1)
      //   .replace(" ", "")
      //   .replace(",\r\n", "")
      //   .trim();
      // console.log(JSON.parse(dataJSON));
      // console.log(JSON.parse(dataJSON));
    }

    // fileReadStream.on("data", (chunk: any) => {
    //   buffers.push(chunk);
    //   console.log(buffers);
    //   fileReadStream.pause();
    // });

    // fileReadStream.on("end", () => {
    //   const bufferToString = Buffer.concat(buffers).toString("utf-8");
    //   const dataJSON = JSON.parse(bufferToString);

    //   // ===== FILE VALIDATIONS =====
    //   if (!Array.isArray(dataJSON)) {
    //     throw new Error("Invalid JSON format.");
    //   }

    //   const output = new BuildOutput();

    //   for (const transaction of dataJSON) {
    //     const isAValidObject = !Array.isArray(transaction) && typeof transaction === "object" && typeof transaction !== null;

    //     if (!isAValidObject) {
    //       throw new Error("The transcation must be a valid object.");
    //     }

    //     for (const item in transaction) {
    //       console.log(item);
    //     }

    //     // const formatted =
    //     // const hashMap = new Map();
    //     // const hashSet = new Set();
    //   }

    // });
  } catch (error) {
    console.error(error);
  } finally {
    await readFileHandle?.close();
    await writeFileHandle?.close();
  }
}
