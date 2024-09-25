const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

// Import các hằng số từ file constants.js
const { BACKEND_PROJECT_PATH, PDF_OUTPUT_BE_FOLDER } = require("./constants"); // Bạn có thể đổi sang backend nếu muốn

// Kiểm tra định dạng file mà bạn muốn chuyển đổi
const validExtensions = [".cs"];

// Tạo thư mục PDF nếu chưa tồn tại
if (!fs.existsSync(PDF_OUTPUT_BE_FOLDER)) {
  fs.mkdirSync(PDF_OUTPUT_BE_FOLDER, { recursive: true }); // Đảm bảo tạo tất cả các thư mục cần thiết
}

// Hàm để đọc tất cả các file từ thư mục và bảo tồn cấu trúc
const getAllFiles = (dirPath, arrayOfFiles, baseDir) => {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles, baseDir);
    } else {
      arrayOfFiles.push({
        fullPath: fullPath,
        relativePath: path.relative(baseDir, fullPath), // Lưu đường dẫn tương đối từ thư mục gốc
      });
    }
  });

  return arrayOfFiles;
};

// Hàm để escape các ký tự đặc biệt trong nội dung file
const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Chuyển đổi nội dung file sang HTML và tạo file PDF
const convertFileToPdf = async (filePath, relativePath) => {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const escapedContent = escapeHtml(fileContent); // Escape ký tự đặc biệt

  // Đường dẫn tới folder PDF tương ứng với cấu trúc gốc
  const outputDir = path.join(PDF_OUTPUT_BE_FOLDER, path.dirname(relativePath));

  // Tạo thư mục đích nếu nó chưa tồn tại
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true }); // Tạo tất cả các thư mục cần thiết
  }

  const fileName = path.basename(filePath, path.extname(filePath));
  const outputPdfPath = path.join(outputDir, `${fileName}.pdf`);

  const browser = await puppeteer.launch({
    headless: true, // Đảm bảo chạy không giao diện
  });
  const page = await browser.newPage();

  // Chuyển nội dung code thành HTML có định dạng monospaced
  const htmlContent = `
    <html>
    <head>
      <style>
        body {
          font-family: 'Courier New', Courier, monospace;
          white-space: pre-wrap;
        }
      </style>
    </head>
    <body>
      <pre>${escapedContent}</pre>
    </body>
    </html>
  `;

  // Đưa HTML vào page và tạo file PDF
  await page.setContent(htmlContent);
  await page.pdf({
    path: outputPdfPath, // Đường dẫn file PDF sẽ lưu trong folder có cấu trúc giống project gốc
    format: "A4",
    printBackground: true,
  });

  await browser.close();
  console.log(`Đã lưu file PDF: ${outputPdfPath}`);
};

// Hàm chính để duyệt qua toàn bộ file và chuyển đổi
const main = async () => {
  const files = getAllFiles(BACKEND_PROJECT_PATH, [], BACKEND_PROJECT_PATH); // Duyệt tất cả các file trong thư mục

  for (let file of files) {
    const ext = path.extname(file.fullPath);
    if (validExtensions.includes(ext)) {
      console.log(`Đang chuyển đổi file: ${file.fullPath}`);
      await convertFileToPdf(file.fullPath, file.relativePath);
    }
  }

  console.log("Hoàn thành chuyển đổi tất cả các file!");
};

main().catch((error) => {
  console.error("Đã xảy ra lỗi:", error);
});
