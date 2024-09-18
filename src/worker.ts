// worker.ts: 必要なファイルだが、特に実装せずにログ出力を行うだけのWorker

// Web Workerが動作していることを確認するためのソル（ログ）を出力
self.addEventListener("message", (event) => {
  console.log("Worker received a message:", event.data);

  // 必要ならメインスレッドにメッセージを送り返すことも可能
  self.postMessage({ type: "log", message: "Worker is running." });
});
