import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const ffmpeg = createFFmpeg({
  log: true, // ログを有効化
});

const fileInput = document.getElementById("fileInput") as HTMLInputElement;
const convertButton = document.getElementById(
  "convertButton"
) as HTMLButtonElement;
const output = document.getElementById("output") as HTMLElement;

convertButton.addEventListener("click", async () => {
  if (!fileInput.files?.length) {
    alert("Please select an mp3 file.");
    return;
  }

  const file = fileInput.files[0];
  output.textContent = "Processing...";

  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }

  // MP3ファイルを書き込み
  ffmpeg.FS("writeFile", "input.mp3", await fetchFile(file));

  // FFmpegのログを解析するために標準エラー出力をキャプチャする
  let ffmpegLog = "";
  ffmpeg.setLogger(({ type, message }) => {
    if (type === "fferr" || type === "ffout") {
      ffmpegLog += message + "\n";
    }
  });

  try {
    // astatsフィルタを使い、全フレームの情報を出力
    await ffmpeg.run(
      "-i",
      "input.mp3",
      "-af",
      "astats=metadata=1:reset=1", // 各フレームごとの音声情報を取得
      "-f",
      "null",
      "-"
    );

    // ログ解析して必要な情報を抽出
    const logData = ffmpegLog.split("\n");
    let dataOutput: string[] = [];

    logData.forEach((line) => {
      if (line.includes("Parsed_astats")) {
        const timestampMatch = line.match(/t:(\d+\.\d+)/); // タイムスタンプを取得
        const meanVolumeMatch = line.match(/mean_volume:([-]?\d+\.\d+)/); // 平均音量を取得
        const peakVolumeMatch = line.match(/peak_volume:([-]?\d+\.\d+)/); // ピーク音量を取得
        const frequencyMatch = line.match(/freq:[\d\s]+/); // 周波数情報を取得（必要に応じて）

        if (timestampMatch && meanVolumeMatch && peakVolumeMatch) {
          const timestamp = parseFloat(timestampMatch[1]);
          const meanVolume = parseFloat(meanVolumeMatch[1]);
          const peakVolume = parseFloat(peakVolumeMatch[1]);

          dataOutput.push(
            `Time: ${timestamp}s, Mean Volume: ${meanVolume}dB, Peak Volume: ${peakVolume}dB\n`
          );
        }
      }
    });

    // 解析結果をテキストファイルとして出力
    const blob = new Blob([dataOutput.join("")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    console.warn(url);
    link.download = "audio_analysis.txt";
    link.textContent = "Download Analysis Results";
    output.appendChild(link);

    output.textContent = "Conversion complete!";
  } catch (error) {
    output.textContent = "Error occurred during conversion.";
    console.error("FFmpeg error:", error);
  }
});
