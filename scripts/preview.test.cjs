const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

test("video preview serves seekable byte ranges", async () => {
  const port = 18765;
  const server = spawn(process.execPath, [path.join(__dirname, "preview.cjs")], { env: { ...process.env, PORT: String(port) }, stdio: ["ignore", "pipe", "pipe"] });
  try {
    await new Promise((resolve, reject) => {
      server.stdout.once("data", resolve);
      server.once("error", reject);
      server.once("exit", code => reject(new Error(`Server exited: ${code}`)));
    });
    const name = "assets/grandma-fruity-secret/app-demo-web.mp4";
    const source = fs.readFileSync(path.join(__dirname, "..", name));
    const url = `http://127.0.0.1:${port}/${name}`;
    for (const [range, start, end] of [["bytes=0-99", 0, 99], ["bytes=100-199", 100, 199], ["bytes=-100", source.length - 100, source.length - 1]]) {
      const response = await fetch(url, { headers: { Range: range } });
      assert.equal(response.status, 206);
      assert.equal(response.headers.get("content-range"), `bytes ${start}-${end}/${source.length}`);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), source.subarray(start, end + 1));
    }
    const head = await fetch(url, { method: "HEAD" });
    assert.equal(head.headers.get("accept-ranges"), "bytes");
    assert.equal(Number(head.headers.get("content-length")), source.length);
    const invalid = await fetch(url, { headers: { Range: `bytes=${source.length}-` } });
    assert.equal(invalid.status, 416);
    assert.equal((await fetch(`http://127.0.0.1:${port}/.git/config`)).status, 400);
  } finally {
    server.kill();
  }
});
