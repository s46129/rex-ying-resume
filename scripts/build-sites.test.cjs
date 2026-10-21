const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

test("build renders readable English with inline styles and valid navigation before JavaScript", () => {
  execFileSync(process.execPath, [path.join(__dirname, "build-sites.cjs")]);
  const root = path.resolve(__dirname, "..");
  const html = fs.readFileSync(path.join(root, "dist/index.html"), "utf8");
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/)[1];
  assert.match(main, /<h1>Rex Ying<\/h1>/);
  for (const id of ["top", "experience", "work", "expertise", "birdie-wing", "pili-universe", "monster-fruit"]) assert.match(main, new RegExp(`id="${id}"`));
  assert.match(main, /AI-assisted development workflow/);
  assert.doesNotMatch(html, /<link rel="stylesheet"/);
  assert.match(html, /src="script.js\?v=[a-f0-9]{12}" defer/);
  for (const name of ["styles.css", "screen.css"]) assert.ok(html.includes(fs.readFileSync(path.join(root, name), "utf8")));
  assert.equal((html.match(/<template id="resume-/g) || []).length, 3);
});
