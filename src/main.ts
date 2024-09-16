import { fetchFile } from "@ffmpeg/util";
import { WorkerCommand, WorkerMessage } from "./core-mt/worker";

const worker = new Worker("./core-mt/worker.js");

const fileInput = document.getElementById("fileInput") as HTMLInputElement;
const trimButton = document.getElementById("trimButton") as HTMLButtonElement;
const videoOutput = document.getElementById("videoOutput") as HTMLVideoElement;
const progressBar = document.getElementById("progress") as HTMLDivElement;
const timeRemainingDisplay = document.getElementById(
  "timeRemaining"
) as HTMLDivElement;

function sendWorkerCommand<T = any>(
  command: WorkerCommand,
  args: any[] = []
): Promise<T> {
  return new Promise((resolve, reject) => {
    worker.postMessage({ command, args } as WorkerMessage);
    worker.onmessage = (event) => {
      if (event.data.status === "error") {
        reject(event.data.message);
      } else if (event.data.status === "progress") {
        const { percent, estimatedRemainingTime } = event.data;
        progressBar.style.width = `${percent}%`;
        timeRemainingDisplay.innerText = `Estimated Time Left: ${estimatedRemainingTime}s`;
      } else {
        resolve(event.data.result);
      }
    };
  });
}

async function loadFFmpeg() {
  try {
    console.log("Loading FFmpeg...");
    await sendWorkerCommand("load");
    console.log("FFmpeg loaded.");
  } catch (error) {
    console.error("Error loading FFmpeg:", error);
  }
}

async function trimVideo(file: File, startTime: string, endTime: string) {
  console.log("Sending video trimming command to worker...");

  const inputFileData = await fetchFile(file);
  const duration = (parseInt(endTime) - parseInt(startTime)).toString();
  const args = [
    "-i",
    "input.mp4",
    "-ss",
    startTime,
    "-t",
    duration,
    "output.mp4",
  ];

  await sendWorkerCommand<void>("writeFile", ["input.mp4", inputFileData]);
  await sendWorkerCommand<void>("run", args);

  const output = await sendWorkerCommand<Uint8Array>("readFile", [
    "output.mp4",
  ]);
  const videoBlob = new Blob([new Uint8Array(output)], { type: "video/mp4" });

  return URL.createObjectURL(videoBlob);
}

trimButton.addEventListener("click", async () => {
  if (!fileInput.files || fileInput.files.length === 0) {
    alert("Please select a video file.");
    return;
  }

  const start = (document.getElementById("start") as HTMLInputElement).value;
  const end = (document.getElementById("end") as HTMLInputElement).value;

  try {
    const trimmedVideoUrl = await trimVideo(fileInput.files[0], start, end);
    videoOutput.src = trimmedVideoUrl;
  } catch (error) {
    console.error("Error during video trimming:", error);
  }
});

loadFFmpeg().catch(console.error);
