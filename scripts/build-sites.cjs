const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");

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

const english = html.match(/<template id="resume-en">([\s\S]*?)<\/template>/)?.[1];
if (!english) throw new Error("Missing English resume template");
let projectIndex = 0;
const initialResume = english
  .replace(/<article class="project(?: flagship)?"/g, match => `${match} id="${["birdie-wing", "pili-universe", "monster-fruit"][projectIndex++]}"`)
  .replace('class="hero"', 'class="hero" id="top"')
  .replace('class="experience section-block"', 'class="experience section-block" id="experience"')
  .replace('class="projects section-block"', 'class="projects section-block" id="work"')
  .replace('class="bottom-grid section-block"', 'class="bottom-grid section-block" id="expertise"');
let page = html.replace(/<main id="resume"[^>]*><\/main>/, `<main id="resume" class="resume" aria-live="polite" data-rendered-language="en">${initialResume}</main>`);
if (page === html) throw new Error("Missing resume output slot");
for (const [file, media] of [["styles.css", ""], ["screen.css", ' media="screen"']]) {
  const css = fs.readFileSync(path.join(root, file), "utf8");
  page = page.replace(new RegExp(`<link rel="stylesheet" href="${file.replace('.', '\\.')}[^\"]*"[^>]*>`), `<style${media}>${css}</style>`);
}
const scriptHash = createHash("sha256").update(fs.readFileSync(path.join(root, "script.js"))).digest("hex").slice(0, 12);
page = page.replace(/src="script.js[^\"]*"/, `src="script.js?v=${scriptHash}"`);
fs.writeFileSync(path.join(output, "index.html"), page);

console.log(`Prepared ${files.size} public files in ${output}`);
