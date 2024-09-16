import { FFmpeg } from "@ffmpeg/ffmpeg";
import { FFMessageLoadConfig } from "@ffmpeg/ffmpeg/dist/esm/types";
import { toBlobURL } from "@ffmpeg/util";

type WorkerCommand = "load" | "writeFile" | "readFile" | "run";

interface WorkerMessage {
  command: WorkerCommand;
  args: any[];
}

interface WriteFileArgs {
  fileName: string;
  fileData: Uint8Array;
}

interface ReadFileArgs {
  fileName: string;
}

interface RunCommandArgs {
  commandArgs: string[];
}

let ffmpeg: FFmpeg | null = null;

self.addEventListener("message", async (event: MessageEvent<WorkerMessage>) => {
  const { command, args } = event.data;

  if (!ffmpeg && command !== "load") {
    self.postMessage({ status: "error", message: "FFmpeg is not loaded." });
    return;
  }

  switch (command) {
    case "load":
      await loadFFmpeg();
      break;
    case "writeFile":
      await handleWriteFile(args as unknown as WriteFileArgs);
      break;
    case "readFile":
      await handleReadFile(args as unknown as ReadFileArgs);
      break;
    case "run":
      await handleRun(args as unknown as RunCommandArgs);
      break;
    default:
      console.error(`Unknown command: ${command}`);
  }
});

async function loadFFmpeg() {
  try {
    if (ffmpeg === null) {
      ffmpeg = new FFmpeg();
      const baseURL = "./core-mt";

      const config: FFMessageLoadConfig = {
        classWorkerURL: await toBlobURL(
          `${baseURL}/worker.js`,
          "text/javascript"
        ),
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
        workerURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.worker.js`,
          "text/javascript"
        ),
      };

      await ffmpeg.load(config);
      self.postMessage({ status: "loaded" });
    } else {
      self.postMessage({ status: "already-loaded" });
    }
  } catch (error) {
    self.postMessage({
      status: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

async function handleWriteFile(args: WriteFileArgs) {
  try {
    if (ffmpeg) {
      await ffmpeg.writeFile(args.fileName, args.fileData);
      self.postMessage({ status: "file-written" });
    }
  } catch (error) {
    self.postMessage({
      status: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

async function handleReadFile(args: ReadFileArgs) {
  try {
    if (ffmpeg) {
      const data = await ffmpeg.readFile(args.fileName);
      self.postMessage({ result: data });
    }
  } catch (error) {
    self.postMessage({
      status: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

async function handleRun(args: RunCommandArgs) {
  try {
    if (ffmpeg) {
      let startTime = performance.now();
      ffmpeg.on("progress", ({ progress, time }) => {
        const elapsedTime = (performance.now() - startTime) / 1000;

        const percent = progress * 100;

        const estimatedTotalTime = elapsedTime / progress;
        const estimatedRemainingTime = estimatedTotalTime - elapsedTime;

        self.postMessage({
          status: "progress",
          percent: Math.round(percent),
          elapsedTime: Math.round(elapsedTime),
          estimatedRemainingTime: Math.round(estimatedRemainingTime),
        });
      });

      await ffmpeg.exec(args.commandArgs);
      self.postMessage({ status: "execution-completed" });
    }
  } catch (error) {
    self.postMessage({
      status: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
