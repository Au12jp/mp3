import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

console.log(2);

const ffmpeg = createFFmpeg({
  log: true, // ログを有効化
});

// DOM要素を取得し、nullチェックを追加
const fileInput = document.getElementById(
  "fileInput"
) as HTMLInputElement | null;
const convertButton = document.getElementById(
  "convertButton"
) as HTMLButtonElement | null;
const output = document.getElementById("output") as HTMLElement | null;

// nullチェック
if (!fileInput || !convertButton || !output) {
  console.error("必要なDOM要素が見つかりません。");
  throw new Error("必要なDOM要素が見つかりません。");
}

convertButton.addEventListener("click", async () => {
  // fileInput.filesがnullまたはファイルが選択されていない場合のチェック
  if (!fileInput.files || fileInput.files.length === 0) {
    alert("MP3ファイルを選択してください。");
    return;
  }

  const file = fileInput.files[0]; // 最初のファイルを取得
  output.textContent = "変換中...";

  // ffmpegのロード
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
    // FFTフィルタを使用して周波数解析を行い、結果を保存
    await ffmpeg.run(
      "-i",
      "input.mp3",
      "-filter_complex",
      "astats=metadata=1:reset=1",
      "-f",
      "null",
      "-"
    );

    output.textContent = "FFT解析完了！";

    // FFT結果をテキストファイルとして保存する
    const data = ffmpeg.FS("readFile", "output.txt");
    const blob = new Blob([data.buffer], { type: "text/plain" });
    const textURL = URL.createObjectURL(blob);

    // テキスト結果をダウンロードリンクとして表示
    const link = document.createElement("a");
    link.href = textURL;
    link.download = "frequency_analysis.txt";
    link.textContent = "FFT結果をダウンロード";
    output.appendChild(link);
  } catch (error) {
    output.textContent = "変換中にエラーが発生しました。";
    console.error("FFmpeg error:", error);
    console.error("FFmpeg log:", ffmpegLog);
  }
});
