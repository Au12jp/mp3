self.addEventListener("message", (event) => {
  console.log("Worker received a message:", event.data);

  // FFmpegの処理を実行するか、他の処理を行う場合に適宜対応する
  switch (event.data.type) {
    case "LOAD":
      console.log("FFmpegのロード要求を受信しました。");
      // 必要なら、ffmpeg.wasmを読み込む処理をここに追加
      break;
    case "EXEC":
      console.log("FFmpegコマンドを実行するための要求を受信しました。");
      // FFmpegコマンドの実行処理をここに追加
      break;
    default:
      console.warn("不明なメッセージタイプを受信:", event.data.type);
  }
});
