import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

console.log(2);

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
    // MP3の周波数解析映像を出力
    await ffmpeg.run(
      "-i",
      "input.mp3",
      "-filter_complex",
      "showfreqs=s=1280x720:mode=line",
      "-frames:v",
      "100", // 100フレーム生成
      "output_%03d.png"
    );

    // 100フレーム分の画像ファイルを読み込んで比較する
    let maxDiff = 0;
    let bestFrame = null;

    for (let i = 1; i <= 100; i++) {
      const fileName = `output_${String(i).padStart(3, "0")}.png`;
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

      // 輝度が一番大きいフレームを保存
      if (sumLuminance > maxDiff) {
        maxDiff = sumLuminance;
        bestFrame = imgURL;
      }
    }

    if (bestFrame) {
      // 最も変動の大きいフレームを表示
      const bestImg = document.createElement("img");
      console.log(bestFrame);
      bestImg.src = bestFrame;
      bestImg.style.width = "100%";
      bestImg.style.height = "auto";
      output.appendChild(bestImg);

      // ダウンロードリンクを生成
      const link = document.createElement("a");
      link.href = bestFrame;
      link.download = "best_frame.png";
      link.textContent = "Download Best Frame";
      output.appendChild(link);

      output.textContent = "Conversion complete!";
    } else {
      output.textContent = "No significant frame detected.";
    }
  } catch (error) {
    output.textContent = "Error occurred during conversion.";
    console.error("FFmpeg error:", error);
    console.error("FFmpeg log:", ffmpegLog);
  }
});
