import type { Manager } from "./types/manager.js";
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
    const manager: Manager = {
      state: "start",
      depth: 0,
      inString: false,
      escaped: false,
      objectText: "",
    };

    for await (const chunk of fileReadStream) {
      const bufferToString = chunk.toString("utf-8");

      for (const currentChar of bufferToString) {
        if (manager.depth === 0) {
          const isAInvalidChar = /[ \t\r\n]/.test(currentChar);

          if (isAInvalidChar) {
            continue;
          }

          if (currentChar === "[" && manager.state === "start") {
            manager.state = "first";
          } else if (currentChar === "{" && (manager.state === "first" || manager.state === "item")) {
            manager.depth = manager.depth + 1;
            manager.objectText = currentChar;
          } else if (manager.state === "separator" && currentChar === ",") {
            manager.state = "item";
          }

          continue;
        }

        manager.objectText += currentChar;

        if (manager.inString) {
          if (manager.escaped) {
            manager.escaped = false;
          } else if (currentChar === '"') {
            manager.inString = false;
          } else if (currentChar === "\\") {
            manager.escaped = true;
          }
        } else if (currentChar === '"') {
          manager.inString = true;
        } else if (currentChar === "{") {
          manager.depth = manager.depth + 1;
        } else if (currentChar === "}") {
          manager.depth = manager.depth - 1;

          if (manager.depth === 0) {
            const transition = JSON.parse(manager.objectText);
            manager.state === "separator";
            manager.objectText = "";
          }
        }
      }

      // {
      // const hasFirstBracket = bufferToString.includes("[");
      // const hasLastBracket = bufferToString.includes("]");

      // console.dir(bufferToString);
      // break;

      // if (manager.firstChunk && hasFirstBracket && !hasLastBracket) {
      //   const lastValidIndex = bufferToString.lastIndexOf("}");
      //   const dataJSON = JSON.parse(`[${bufferToString.slice(1, lastValidIndex + 1).trim()}]`);
      //   continue;
      // }

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
      // }
    }

    // {
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
    // }
  } catch (error) {
    console.error(error);
  } finally {
    await readFileHandle?.close();
    await writeFileHandle?.close();
  }
}
