import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import https from "node:https";
import "dotenv/config"; // .env ファイルを読み込む

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontUrl = process.env.OG_FONT_URL;
const fontFileName = "FOT-TsukuARdGothicStd-B.otf";
// プロジェクトルートからの相対パスで assets ディレクトリを指定
const assetsDir = path.resolve(__dirname, "../assets");
const fontPath = path.join(assetsDir, fontFileName);

if (!fontUrl) {
  console.error("Error: OG_FONT_URL environment variable is not set.");
  console.log("Skipping font download.");
  // フォントが存在しない場合でもビルドは続行させるため、エラーコードは返さない
  process.exit(0);
}

// assets ディレクトリが存在しない場合は作成
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
  console.log(`Created directory: ${assetsDir}`);
}

// フォントファイルが既に存在する場合はダウンロードしない
if (fs.existsSync(fontPath)) {
  console.log(`Font file already exists at ${fontPath}. Skipping download.`);
  process.exit(0);
}

console.log(`Downloading font from ${fontUrl} to ${fontPath}...`);

const file = fs.createWriteStream(fontPath);

https
  .get(fontUrl, (response) => {
    // リダイレクト処理 (3xx ステータスコード)
    if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
      console.log(`Redirecting to ${response.headers.location}`);
      https
        .get(response.headers.location, (redirectedResponse) => {
          if (redirectedResponse.statusCode !== 200) {
            console.error(`Error downloading font after redirect: Status Code ${redirectedResponse.statusCode}`);
            fs.unlink(fontPath, () => {}); // エラー時に空ファイルを削除
            process.exit(1);
          }
          redirectedResponse.pipe(file);
        })
        .on("error", (err) => {
          console.error("Error downloading font after redirect:", err.message);
          fs.unlink(fontPath, () => {});
          process.exit(1);
        });
    } else if (response.statusCode !== 200) {
      console.error(`Error downloading font: Status Code ${response.statusCode}`);
      fs.unlink(fontPath, () => {}); // エラー時に空ファイルを削除
      process.exit(1); // エラーコードを返す
    } else {
      response.pipe(file);
    }

    file.on("finish", () => {
      file.close();
      console.log("Font downloaded successfully.");
      process.exit(0); // 成功
    });

    file.on("error", (err) => {
      // ストリームのエラーハンドリング
      console.error("Error writing font file:", err.message);
      fs.unlink(fontPath, () => {});
      process.exit(1);
    });
  })
  .on("error", (err) => {
    console.error("Error initiating font download:", err.message);
    // fs.unlink はファイルが存在しない場合にエラーを出す可能性があるため、ここでは呼び出さない
    process.exit(1); // エラーコードを返す
  });
