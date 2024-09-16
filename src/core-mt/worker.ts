import { FFmpeg } from "@ffmpeg/ffmpeg";
import { FFMessageLoadConfig } from "@ffmpeg/ffmpeg/dist/esm/types";
import { toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;

self.addEventListener("message", async (event: MessageEvent) => {
  const { command, args } = event.data;

  switch (command) {
    case "load":
      await loadFFmpeg();
      break;
    case "run":
      if (ffmpeg && Array.isArray(args)) {
        const result = await ffmpeg.exec(args);
        self.postMessage({ result });
      }
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
    self.postMessage({ status: "error", message: error });
  }
}
