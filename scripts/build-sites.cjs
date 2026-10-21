const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "dist");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const files = new Set(["index.html", "styles.css", "screen.css", "script.js"]);

for (const match of html.matchAll(/(?:src|href|data-full|data-video-poster)="(assets\/[^"?#]+)"/g)) {
  files.add(match[1]);
}

for (const file of files) {
  const source = path.resolve(root, file);
  const relative = path.relative(root, source);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error(`Invalid asset: ${file}`);
  if (fs.statSync(source).size > 25 * 1024 * 1024) throw new Error(`Asset exceeds the hosting limit: ${file}`);
  const destination = path.join(output, relative);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

console.log(`Prepared ${files.size} public files in ${output}`);
