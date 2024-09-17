// Workerへのコマンド送信を簡単に行うヘルパー関数
function sendWorkerCommand<T = any>(
  command: string,
  args: any[] = []
): Promise<T> {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./core-mt/worker.js");
    worker.postMessage({ command, args });
    worker.onmessage = (event) => {
      const { status, result, message, percent, estimatedRemainingTime } =
        event.data;

      if (status === "error") {
        reject(message);
      } else if (status === "progress") {
        updateProgress(percent, estimatedRemainingTime);
      } else {
        resolve(result);
      }
    };
  });
}

const fileInput = document.getElementById("fileInput") as HTMLInputElement;
const createPackButton = document.getElementById(
  "createPackButton"
) as HTMLButtonElement;
const progressBar = document.getElementById("progress") as HTMLDivElement;
const timeRemainingDisplay = document.getElementById(
  "timeRemaining"
) as HTMLDivElement;
const statusDisplay = document.getElementById("status") as HTMLDivElement;

// FFmpegのロード処理
async function loadFFmpeg() {
  try {
    statusDisplay.innerText = "Loading FFmpeg...";
    await sendWorkerCommand("load");
    statusDisplay.innerText = "FFmpeg loaded.";
  } catch (error) {
    statusDisplay.innerText = "Error loading FFmpeg.";
    console.error("Error loading FFmpeg:", error);
  }
}

// パック生成処理
async function createBPandRP(file: File, frameCount: number, fps: number) {
  statusDisplay.innerText = "Creating BP and RP...";

  const inputFileData = new Uint8Array(await file.arrayBuffer());

  await sendWorkerCommand("createPack", [inputFileData, frameCount, fps]);

  const result = await sendWorkerCommand<Blob>("getPack");
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(result);
  downloadLink.download = "generated_pack.mcaddon";
  downloadLink.click();

  statusDisplay.innerText = "Pack creation complete!";
}

// ボタンイベント
createPackButton.addEventListener("click", async () => {
  const file = fileInput.files?.[0];
  if (!file) {
    alert("Please select a video file.");
    return;
  }

  const frameCount = parseInt(
    (document.getElementById("frameCount") as HTMLInputElement).value
  );
  const fps = parseInt(
    (document.getElementById("fps") as HTMLInputElement).value
  );

  try {
    await createBPandRP(file, frameCount, fps);
  } catch (error) {
    statusDisplay.innerText = "Error during pack creation.";
    console.error("Error during pack creation:", error);
  }
});

// 進捗バーや残り時間の更新
function updateProgress(percent: number, estimatedRemainingTime: number) {
  progressBar.style.width = `${percent}%`;
  timeRemainingDisplay.innerText = `Estimated Time Left: ${estimatedRemainingTime}s`;
}

// FFmpegのロード開始
loadFFmpeg().catch(console.error);
