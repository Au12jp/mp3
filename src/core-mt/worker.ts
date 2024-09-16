import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

self.addEventListener("message", async (event: MessageEvent) => {
  const { command, file, startTime, endTime } = event.data;

  if (command === "trim") {
    const trimmedVideoUrl = await trimVideo(file, startTime, endTime);
    self.postMessage({ trimmedVideoUrl });
  }
});

// Function to trim the video
async function trimVideo(
  file: File,
  startTime: string,
  endTime: string
): Promise<string | null> {
  const ffmpeg = new FFmpeg();
  const baseURL = "./core-mt"; // Point to your local FFmpeg files

  // FFmpeg loading and worker setup
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    workerURL: await toBlobURL(
      `${baseURL}/ffmpeg-core.worker.js`,
      "text/javascript"
    ),
  });

  // Write the input file to FFmpeg's filesystem
  await ffmpeg.writeFile("input.mp4", await fetchFile(file));

  const duration = (parseInt(endTime) - parseInt(startTime)).toString();

  // Execute the FFmpeg trim command
  await ffmpeg.exec([
    "-i",
    "input.mp4",
    "-ss",
    startTime,
    "-t",
    duration,
    "output.mp4",
  ]);

  // Read the output file and create a Blob URL for it
  const data = await ffmpeg.readFile("output.mp4");
  const videoBlob = new Blob([new Uint8Array(data as Uint8Array)], {
    type: "video/mp4",
  });

  // Return the Blob URL
  return URL.createObjectURL(videoBlob);
}
