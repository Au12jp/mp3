import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

// FFmpegのインスタンスを作成
const ffmpeg = createFFmpeg({ log: true });

// HTML要素の参照を取得
const fileInput = document.getElementById("fileInput") as HTMLInputElement;
const convertButton = document.getElementById(
  "convertButton"
) as HTMLButtonElement;
const output = document.getElementById("output") as HTMLElement;

// 変換ボタンがクリックされたときの処理
convertButton.addEventListener("click", async () => {
  if (!fileInput.files?.length) {
    alert("Please select an MP3 file.");
    return;
  }

  const file = fileInput.files[0];
  output.textContent = "Processing...";

  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }

  // MP3ファイルをFFmpegのファイルシステムに書き込み
  ffmpeg.FS("writeFile", "input.mp3", await fetchFile(file));

  // FFmpegのログを取得
  let ffmpegLog = "";
  ffmpeg.setLogger(({ type, message }) => {
    if (type === "fferr" || type === "ffout") {
      ffmpegLog += message + "\n";
    }
  });

  try {
    // MP3全体を解析し、周波数スペクトルの画像を生成
    await ffmpeg.run(
      "-i",
      "input.mp3",
      "-filter_complex",
      "showfreqs=s=320x180:mode=line", // 解像度320x180で周波数スペクトルを描画
      "output_%d.png" // フレームごとにPNG画像を生成
    );

    let dataOutput: string[] = [];
    let frameIndex = 1;

    // フレーム画像を順次処理
    while (true) {
      try {
        // 画像ファイル名の生成
        const fileName = `output_${frameIndex}.png`;
        const data = ffmpeg.FS("readFile", fileName); // FFmpegのファイルシステムから画像を読み込み
        const blob = new Blob([data.buffer], { type: "image/png" });
        const imgURL = URL.createObjectURL(blob);

        // 画像をHTMLのimg要素に表示して処理
        const img = document.createElement("img");
        img.src = imgURL;
        await new Promise((resolve) => (img.onload = resolve)); // 画像の読み込みを待機

        // Canvasで画像を描画してピクセルデータを取得
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx!.drawImage(img, 0, 0);

        // 画像データの解析
        const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // ピクセルの輝度（明るさ）を計算して音量と周波数情報を抽出
        let sumLuminance = 0;
        for (let j = 0; j < pixels.length; j += 4) {
          const r = pixels[j];
          const g = pixels[j + 1];
          const b = pixels[j + 2];
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          sumLuminance += luminance;
        }

        // フレームごとの時間(ms)、周波数、音量を仮計算
        const timeMs = frameIndex * (1000 / 30); // 30fps基準での時間
        const frequency = (canvas.height / 2) * (sumLuminance / pixels.length); // 仮の周波数計算
        const volume = sumLuminance / (canvas.width * canvas.height); // 仮の音量計算

        // 結果を保存
        dataOutput.push(
          `Time: ${timeMs}ms, Frequency: ${frequency}Hz, Volume: ${volume}\n`
        );
        frameIndex++;
      } catch (error) {
        // フレームがなくなったら終了
        break;
      }
    }

    // 解析結果をテキストファイルとして保存
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
