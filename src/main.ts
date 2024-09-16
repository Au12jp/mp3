import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const ffmpeg = createFFmpeg({
  log: true,
});

const fileInput = document.getElementById("fileInput") as HTMLInputElement;
const convertButton = document.getElementById(
  "convertButton"
) as HTMLButtonElement;
const output = document.getElementById("output") as HTMLElement;

convertButton.addEventListener("click", async () => {
  if (!fileInput.files?.length) {
    alert("Please select an MP3 file.");
    return;
  }

  const file = fileInput.files[0];
  output.textContent = "Processing...";

  // FFmpegの準備ができているか確認
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }

  // MP3ファイルを書き込み
  ffmpeg.FS("writeFile", "input.mp3", await fetchFile(file));

  // FFmpegのログを解析するために標準エラー出力をキャプチャする
  let ffmpegLog = "";
  ffmpeg.setLogger(({ type, message }) => {
    if (type === "fferr" || type === "ffout") {
      console.log(`[${type}] ${message}`); // デバッグ用ログ出力
      ffmpegLog += message + "\n";
    }
  });

  try {
    // astatsフィルタを適用して、MP3ファイルを解析
    await ffmpeg.run(
      "-i",
      "input.mp3",
      "-filter_complex",
      "[0:a]astats=metadata=1:reset=1",
      "-f",
      "null",
      "-"
    );

    // ログデータ全体をデバッグ用に出力
    console.log("Full FFmpeg log:", ffmpegLog);

    // ログデータを解析して必要な情報を抽出
    const logData = ffmpegLog.split("\n");
    let dataOutput: string[] = [];

    logData.forEach((line) => {
      // 音量情報の取得
      if (line.includes("Parsed_astats")) {
        const timestampMatch = line.match(/t:(\d+\.\d+)/);
        const meanVolumeMatch = line.match(/mean_volume:([-]?\d+\.\d+)/);
        const peakVolumeMatch = line.match(/peak_volume:([-]?\d+\.\d+)/);

        if (timestampMatch && meanVolumeMatch && peakVolumeMatch) {
          const timestamp = parseFloat(timestampMatch[1]);
          const meanVolume = parseFloat(meanVolumeMatch[1]);
          const peakVolume = parseFloat(peakVolumeMatch[1]);

          dataOutput.push(
            `Time: ${timestamp}s, Mean Volume: ${meanVolume}dB, Peak Volume: ${peakVolume}dB`
          );
        }
      }
    });

    // dataOutputが空かどうかを確認
    if (dataOutput.length === 0) {
      console.error("No data extracted from the FFmpeg log.");
      output.textContent = "No volume data was extracted.";
      return;
    }

    console.log("Data Output:", dataOutput); // 抽出されたデータの確認

    // データをテキストファイルとして出力
    const blob = new Blob([dataOutput.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "audio_analysis.txt";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    output.textContent = "Processing complete!";
  } catch (error) {
    output.textContent = "Error occurred during processing.";
    console.error("FFmpeg error:", error);
  }
});
