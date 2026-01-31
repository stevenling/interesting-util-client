/**
 * EPUB → PDF 转换服务（Node.js + Puppeteer）
 * 真实浏览器渲染，支持复杂 CSS、字体与分页。
 */
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const puppeteer = require("puppeteer");
const AdmZip = require("adm-zip");
const path = require("path");
const fs = require("fs");
const os = require("os");

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3001;

// 内存存储，避免写盘（后续再解压到 temp）
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB

// 从 container.xml 解析出 content.opf 路径
function getOpfPath(containerXml) {
  const m = containerXml.match(/full-path=["']([^"']+)["']/i);
  return m ? m[1].trim() : null;
}

// 从 content.opf 解析 manifest (id -> href) 和 spine 顺序
function parseOpf(opfXml) {
  const manifest = {};
  const spine = [];
  // manifest: <item ... id="..." href="..." /> 或 href 在 id 前；可能带命名空间 (opf:item)
  const itemRe = /<item\s[^>]*?(?:id=["']([^"']+)["'][^>]*href=["']([^"']+)["']|href=["']([^"']+)["'][^>]*id=["']([^"']+)["'])[^>]*\/?>/gi;
  let match;
  while ((match = itemRe.exec(opfXml)) !== null) {
    const id = match[1] || match[4];
    const href = match[2] || match[3];
    if (id && href) manifest[id] = href;
  }
  // spine: <itemref idref="..." ... />
  const itemrefRe = /<itemref\s[^>]*?idref=["']([^"']+)["'][^>]*\/?>/gi;
  while ((match = itemrefRe.exec(opfXml)) !== null) {
    spine.push(match[1]);
  }
  return { manifest, spine };
}

// 解压 EPUB 到临时目录，返回 tempDir 和 opf 目录
function extractEpub(buffer) {
  const zip = new AdmZip(buffer);
  const tempDir = path.join(os.tmpdir(), `epub-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
  zip.extractAllTo(tempDir, true);

  const containerPath = path.join(tempDir, "META-INF", "container.xml");
  if (!fs.existsSync(containerPath)) {
    throw new Error("EPUB 无效：缺少 META-INF/container.xml");
  }
  const containerXml = fs.readFileSync(containerPath, "utf8");
  const opfRelative = getOpfPath(containerXml);
  if (!opfRelative) {
    throw new Error("EPUB 无效：container.xml 中未找到 content.opf 路径");
  }

  const opfPath = path.join(tempDir, opfRelative.split("/").join(path.sep));
  const opfDir = path.dirname(opfPath);
  if (!fs.existsSync(opfPath)) {
    throw new Error("EPUB 无效：找不到 content.opf");
  }

  const opfXml = fs.readFileSync(opfPath, "utf8");
  const { manifest, spine } = parseOpf(opfXml);
  if (spine.length === 0) {
    throw new Error("EPUB 无效：spine 为空");
  }

  return { tempDir, opfDir, opfPath, manifest, spine };
}

// 构建合并后的 HTML（按 spine 顺序拼接章节）
function buildCombinedHtml(tempDir, opfDir, manifest, spine) {
  const parts = [];
  const baseHref = "file://" + opfDir.replace(/\\/g, "/") + "/";

  parts.push(`<!DOCTYPE html><html><head><meta charset="utf-8"><base href="${baseHref}">`);
  parts.push(
    `<style>
      body { font-size: 16px; line-height: 1.6; color: #111; background: #fff; margin: 0; padding: 24px; }
      .chapter { page-break-after: always; }
      .chapter:last-child { page-break-after: auto; }
    </style></head><body>`
  );

  for (const id of spine) {
    const href = manifest[id];
    if (!href) continue;
    const fullPath = path.join(opfDir, href.replace(/\//g, path.sep));
    if (!fs.existsSync(fullPath)) continue;
    let html = fs.readFileSync(fullPath, "utf8");
    // 提取 body 内容，去掉外层标签便于拼接
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const content = bodyMatch ? bodyMatch[1] : html;
    parts.push(`<div class="chapter">${content}</div>`);
  }

  parts.push("</body></html>");
  return parts.join("");
}

// 清理临时目录
function cleanup(tempDir) {
  try {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  } catch (e) {
    console.warn("cleanup temp dir failed:", e.message);
  }
}

app.post("/convert/epub2pdf", upload.single("epub"), async (req, res) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ error: "请上传 EPUB 文件" });
  }
  const buf = req.file.buffer;
  if (!Buffer.isBuffer(buf) || buf.length === 0) {
    return res.status(400).json({ error: "文件为空" });
  }

  let tempDir = null;
  let browser = null;

  try {
    const { tempDir: td, opfDir, manifest, spine } = extractEpub(buf);
    tempDir = td;

    const combinedHtml = buildCombinedHtml(tempDir, opfDir, manifest, spine);
    const outPath = path.join(opfDir, "combined.html");
    fs.writeFileSync(outPath, combinedHtml, "utf8");

    const fileUrl = "file://" + outPath.replace(/\\/g, "/");
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();
    await page.goto(fileUrl, { waitUntil: "networkidle0", timeout: 60000 });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "24px", right: "24px", bottom: "24px", left: "24px" },
      preferCSSPageSize: false,
    });
    await browser.close();
    browser = null;
    cleanup(tempDir);
    tempDir = null;

    const filename = (req.file.originalname || "converted").replace(/\.epub$/i, "") + ".pdf";
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
    res.send(pdfBuffer);
  } catch (err) {
    if (browser) try { await browser.close(); } catch (_) {}
    cleanup(tempDir);
    console.error("epub2pdf error:", err);
    res.status(500).json({ error: err.message || "转换失败" });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "ebook-convert-server" });
});

app.listen(PORT, () => {
  console.log(`ebook-convert-server listening on http://localhost:${PORT}`);
});
