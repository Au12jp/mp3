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
  output.textContent = "Converting...";

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
    // 音声統計情報（周波数含む）をテキスト出力
    await ffmpeg.run(
      "-i",
      "input.mp3",
      "-filter_complex",
      "astats=metadata=1:reset=1",
      "-f",
      "null",
      "-"
    );

    // FFmpegのログ情報をテキストとして表示
    const textBlob = new Blob([ffmpegLog], { type: "text/plain" });
    const textURL = URL.createObjectURL(textBlob);

    // 結果をテキストとして表示
    const textElement = document.createElement("a");
    textElement.href = textURL;
    textElement.download = "frequency_analysis.txt";
    textElement.textContent = "Download Frequency Analysis";
    output.textContent = "";
    output.appendChild(textElement);

    output.textContent += "\nConversion complete!";
  } catch (error) {
    output.textContent = "Error occurred during conversion.";
    console.error("FFmpeg error:", error);
    console.error("FFmpeg log:", ffmpegLog);
  }
});
