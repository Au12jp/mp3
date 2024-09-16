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
    // MP3全体の周波数解析映像を出力
    await ffmpeg.run(
      "-i",
      "input.mp3",
      "-filter_complex",
      "showfreqs=s=1280x720:mode=line",
      "output_%d.png" // 動的にフレーム数を生成
    );

    let dataOutput: string[] = [];
    let frameIndex = 1;

    // フレームを順次処理し続ける
    while (true) {
      try {
        const fileName = `output_${String(frameIndex).padStart(3, "0")}.png`;
        const data = ffmpeg.FS("readFile", fileName);
        const blob = new Blob([data.buffer], { type: "image/png" });
        const imgURL = URL.createObjectURL(blob);

        // Canvasで画像を描画してピクセルデータを取得
        const img = document.createElement("img");
        img.src = imgURL;
        await new Promise((resolve) => (img.onload = resolve)); // 画像の読み込みを待機

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx!.drawImage(img, 0, 0);

        const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // ピクセルの輝度を計算
        let sumLuminance = 0;
        for (let j = 0; j < pixels.length; j += 4) {
          const r = pixels[j];
          const g = pixels[j + 1];
          const b = pixels[j + 2];
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          sumLuminance += luminance;
        }

        // 時間(ms), 周波数, 音量のデータを仮に出力
        const timeMs = frameIndex * (1000 / 30); // フレームごとの時間 (30fps基準)
        const frequency = (canvas.height / 2) * (sumLuminance / pixels.length); // 仮の周波数計算
        const volume = sumLuminance / (canvas.width * canvas.height); // 仮の音量

        dataOutput.push(
          `Time: ${timeMs}ms, Frequency: ${frequency}Hz, Volume: ${volume}\n`
        );
        frameIndex++;
      } catch (error) {
        // フレームが存在しなくなったら終了
        break;
      }
    }

    // 解析結果をテキストファイルとして出力
    const blob = new Blob([dataOutput.join("")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "audio_analysis.txt";
    link.textContent = "Download Analysis Results";
    output.appendChild(link);

    output.textContent = "Conversion complete!";
  } catch (error) {
    output.textContent = "Error occurred during conversion.";
    console.error("FFmpeg error:", error);
    console.error("FFmpeg log:", ffmpegLog);
  }
});
