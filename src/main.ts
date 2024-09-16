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
    // astatsで音量情報を取得し、showspectrumで周波数を解析
    await ffmpeg.run(
      "-i",
      "input.mp3",
      "-filter_complex",
      "[0:a]astats=metadata=1:reset=1,showspectrum=s=320x720:mode=combined",
      "-f",
      "null",
      "-"
    );

    // ログ解析して必要な情報を抽出
    const logData = ffmpegLog.split("\n");
    let dataOutput: string[] = [];

    logData.forEach((line) => {
      // 音量情報の取得
      if (line.includes("Parsed_astats")) {
        const timestampMatch = line.match(/t:(\d+\.\d+)/); // タイムスタンプを取得
        const meanVolumeMatch = line.match(/mean_volume:([-]?\d+\.\d+)/); // 平均音量を取得
        const peakVolumeMatch = line.match(/peak_volume:([-]?\d+\.\d+)/); // ピーク音量を取得

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
        const spectrumMatch = line.match(/freq=(\d+)/); // 仮の周波数を取得
        if (spectrumMatch) {
          const frequency = parseFloat(spectrumMatch[1]);
          dataOutput.push(` Frequency: ${frequency}Hz\n`);
        }
      }
    });

    // 解析結果をテキストファイルとして出力
    const blob = new Blob([dataOutput.join("")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    // ダウンロードリンクを生成
    const link = document.createElement("a");
    link.href = url;
    link.download = "audio_analysis.txt"; // ダウンロードファイル名
    link.style.display = "none"; // リンクを非表示にする
    document.body.appendChild(link); // ダウンロードリンクをページに追加
    link.click(); // ダウンロードを自動的にトリガー
    document.body.removeChild(link); // ダウンロード後にリンクを削除

    output.textContent = "Conversion complete!";

    // Step 2: テキストファイルからMP3生成
    // 生成された音量・周波数データを使って新しいMP3を作成
    await generateMP3(dataOutput);
  } catch (error) {
    output.textContent = "Error occurred during conversion.";
    console.error("FFmpeg error:", error);
  }
});

// MP3生成のための関数
async function generateMP3(dataOutput: string[]) {
  // MP3生成用のFFmpegコマンドを実行
  let audioData = "";

  dataOutput.forEach((line) => {
    const matches = line.match(/Frequency: (\d+)Hz/);
    if (matches) {
      const frequency = matches[1];
      // ここで、周波数に応じたサウンドデータを生成（仮の処理）
      audioData += `sine=${frequency}\n`;
    }
  });

  try {
    // 仮のサウンドデータで新しいMP3を生成
    await ffmpeg.run(
      "-f",
      "lavfi",
      "-i",
      `sine=frequency=1000:duration=10`, // 例として、1000Hzの音を10秒間生成
      "output.mp3"
    );

    // 生成されたMP3を読み込み
    const mp3Data = ffmpeg.FS("readFile", "output.mp3");

    // MP3ファイルとしてダウンロード
    const mp3Blob = new Blob([mp3Data.buffer], { type: "audio/mp3" });
    const mp3Url = URL.createObjectURL(mp3Blob);
    const mp3Link = document.createElement("a");
    mp3Link.href = mp3Url;
    mp3Link.download = "generated_audio.mp3";
    mp3Link.textContent = "Download Generated MP3";
    document.body.appendChild(mp3Link);
    mp3Link.click();
    document.body.removeChild(mp3Link);
  } catch (error) {
    console.error("MP3 generation error:", error);
  }
}
