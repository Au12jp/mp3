const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// 入力ファイル
const inputFile = "./nodejs/input.mp3";

// 出力ディレクトリ
const outputDir = "./nodejs/output";

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// FFmpegコマンドを実行する関数
const runFFmpegCommand = (command, outputFile) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`エラーが発生しました: ${stderr}`);
      } else {
        // FFmpegの解析結果をファイルに保存
        fs.writeFile(outputFile, stderr, (err) => {
          if (err) {
            reject(`ファイル書き込みエラー: ${err}`);
          } else {
            resolve(`結果をファイルに保存しました: ${outputFile}`);
          }
        });
      }
    });
  });
};

// 各フィルターモードに対応するコマンドリスト
const filters = [
  {
    name: "astats",
    command: `ffmpeg -i ${inputFile} -filter:a astats=metadata=1:reset=1 -f null -`,
  },
  {
    name: "volumedetect",
    command: `ffmpeg -i ${inputFile} -filter:a volumedetect -f null -`,
  },
  {
    name: "showwaves",
    command: `ffmpeg -i ${inputFile} -filter_complex "showwavespic=s=640x120" ${outputDir}/showwaves.png`,
  },
  {
    name: "showcqt",
    command: `ffmpeg -i ${inputFile} -filter_complex "showcqt" ${outputDir}/showcqt.png`,
  },
  {
    name: "showspectrum",
    command: `ffmpeg -i ${inputFile} -filter_complex "showspectrum=s=640x480" ${outputDir}/showspectrum.png`,
  },
  {
    name: "compand",
    command: `ffmpeg -i ${inputFile} -filter:a compand -f null -`,
  },
  {
    name: "afftdn",
    command: `ffmpeg -i ${inputFile} -filter:a afftdn -f null -`,
  },
  {
    name: "highpass",
    command: `ffmpeg -i ${inputFile} -filter:a "highpass=f=300" -f null -`,
  },
  {
    name: "lowpass",
    command: `ffmpeg -i ${inputFile} -filter:a "lowpass=f=300" -f null -`,
  },
  {
    name: "bandpass",
    command: `ffmpeg -i ${inputFile} -filter:a "bandpass=f=1000:w=200" -f null -`,
  },
  {
    name: "pan",
    command: `ffmpeg -i ${inputFile} -filter:a "pan=stereo|c0=0.5*c0+0.5*c1|c1=0.5*c0+0.5*c1" -f null -`,
  },
  {
    name: "anull",
    command: `ffmpeg -i ${inputFile} -filter:a anull -f null -`,
  },
];

// 各フィルターの解析を実行
const runAllFilters = async () => {
  for (let filter of filters) {
    const outputFile = path.join(outputDir, `${filter.name}.txt`);
    try {
      const result = await runFFmpegCommand(filter.command, outputFile);
      console.log(result);
    } catch (error) {
      console.error(
        `フィルタ "${filter.name}" の処理中にエラーが発生しました: ${error}`
      );
    }
  }
};

// 実行
runAllFilters();
