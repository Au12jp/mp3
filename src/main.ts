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
    // astatsとshowspectrumフィルタを適用して、MP3ファイルを解析
    await ffmpeg.run(
      "-i",
      "input.mp3",
      "-filter_complex",
      "[0:a]astats=metadata=1:reset=1,showspectrum=s=320x720:mode=combined",
      "-f",
      "null",
      "-"
    );

    // ログデータを解析して必要な情報を抽出
    const logData = ffmpegLog.split("\n");
    let dataOutput: string[] = [];

    logData.forEach((line) => {
      // 音量情報の取得
      if (line.includes("Parsed_astats")) {
        console.log("Processing astats line:", line); // 確認用出力
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

      // 周波数情報の取得
      if (line.includes("showspectrum")) {
        const spectrumMatch = line.match(/freq=(\d+)/); // 仮の周波数情報
        if (spectrumMatch) {
          const frequency = parseFloat(spectrumMatch[1]);
          dataOutput.push(` Frequency: ${frequency}Hz\n`);
        }
      }
    });

    console.log("Data Output:", dataOutput); // 抽出されたデータの確認

    // データをテキストファイルとして出力
    const blob = new Blob([dataOutput.join("")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    // ダウンロードリンクを生成してテキストファイルを保存
    const link = document.createElement("a");
    link.href = url;
    link.download = "audio_analysis.txt";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 解析された情報に基づいて新しいMP3を作成
    await ffmpeg.run(
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=1000:duration=10",
      "output.mp3"
    );

    // MP3ファイルをダウンロードリンクとして提供
    const mp3Blob = ffmpeg.FS("readFile", "output.mp3");
    const mp3Url = URL.createObjectURL(
      new Blob([mp3Blob.buffer], { type: "audio/mpeg" })
    );

    const mp3Link = document.createElement("a");
    mp3Link.href = mp3Url;
    mp3Link.download = "output.mp3";
    mp3Link.style.display = "none";
    document.body.appendChild(mp3Link);
    mp3Link.click();
    document.body.removeChild(mp3Link);

    output.textContent = "Processing complete!";
  } catch (error) {
    output.textContent = "Error occurred during processing.";
    console.error("FFmpeg error:", error);
  }
});
