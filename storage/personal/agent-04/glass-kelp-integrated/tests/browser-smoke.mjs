import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const chromePath = process.env.CHROME_PATH;

if (!chromePath) throw new Error("CHROME_PATH is required");
if (typeof WebSocket === "undefined") throw new Error("Node WebSocket global is unavailable");

const mime = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"]
]);

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://127.0.0.1");
    const rel = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(1));
    const target = path.resolve(ROOT, rel);
    if (!target.startsWith(ROOT + path.sep) && target !== path.join(ROOT, "index.html")) {
      res.writeHead(403); res.end("forbidden"); return;
    }
    const data = await fs.readFile(target);
    res.writeHead(200, {"content-type": mime.get(path.extname(target)) || "application/octet-stream"});
    res.end(data);
  } catch {
    res.writeHead(404); res.end("not found");
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;
const pageUrl = `http://127.0.0.1:${port}/index.html`;
const userDir = await fs.mkdtemp(path.join(os.tmpdir(), "glass-kelp-chrome-"));

const chrome = spawn(chromePath, [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  "--disable-dev-shm-usage",
  "--remote-debugging-address=127.0.0.1",
  "--remote-debugging-port=9222",
  `--user-data-dir=${userDir}`,
  pageUrl
], {stdio:["ignore","ignore","pipe"]});

let chromeStderr = "";
chrome.stderr.on("data", chunk => { chromeStderr += chunk.toString(); });

async function getPageTarget() {
  for (let attempt = 0; attempt < 80; attempt++) {
    try {
      const res = await fetch("http://127.0.0.1:9222/json/list");
      const targets = await res.json();
      const target = targets.find(t => t.type === "page" && t.url.startsWith("http://127.0.0.1:"));
      if (target?.webSocketDebuggerUrl) return target;
    } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error("Chrome DevTools page target did not appear. stderr:\n" + chromeStderr);
}

const target = await getPageTarget();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve, {once:true});
  ws.addEventListener("error", reject, {once:true});
});

let nextId = 1;
const pending = new Map();
const runtimeErrors = [];

ws.addEventListener("message", event => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const {resolve, reject} = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(JSON.stringify(msg.error)));
    else resolve(msg.result);
    return;
  }
  if (msg.method === "Runtime.exceptionThrown") {
    runtimeErrors.push(msg.params?.exceptionDetails?.text || "Runtime exception");
  }
  if (msg.method === "Log.entryAdded" && msg.params?.entry?.level === "error") {
    runtimeErrors.push(msg.params.entry.text || "Console error");
  }
});

function send(method, params={}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, {resolve, reject});
    ws.send(JSON.stringify({id, method, params}));
  });
}

async function evaluate(expression) {
  const out = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true
  });
  if (out.exceptionDetails) {
    throw new Error("Evaluation failed: " + JSON.stringify(out.exceptionDetails));
  }
  return out.result?.value;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitFor(expression, label) {
  for (let attempt = 0; attempt < 80; attempt++) {
    if (await evaluate(expression)) return;
    await new Promise(r => setTimeout(r, 75));
  }
  throw new Error("Timed out waiting for " + label);
}

try {
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 375,
    height: 812,
    deviceScaleFactor: 1,
    mobile: true
  });

  await waitFor(
    `document.readyState === "complete" && !!globalThis.GKRelay && !!globalThis.GKContent`,
    "Glass Kelp modules"
  );

  assert(await evaluate(`document.documentElement.scrollWidth <= window.innerWidth`),
    "375px viewport has horizontal overflow");
  assert(await evaluate(`document.querySelector("#tower-button").disabled === true`),
    "Tower should start locked");

  for (const place of ["harbor","garden","lock"]) {
    await evaluate(`document.querySelector('[data-place="${place}"]').click(); true`);
  }

  assert(await evaluate(`document.querySelector("#tower-button").disabled === false`),
    "Tower did not unlock after three context visits");

  await evaluate(`document.querySelector("#tower-button").click(); true`);
  assert(await evaluate(`document.querySelector("#tower-panel").hidden === false`),
    "Tower panel did not open");
  assert((await evaluate(`document.querySelectorAll(".relay-tile").length`)) === 16,
    "Expected 16 relay tiles");

  const focusCell = await evaluate(`(() => {
    const b = document.querySelector('.relay-tile[data-cell="0"]');
    b.focus();
    b.click();
    return document.activeElement?.dataset?.cell || null;
  })()`);
  assert(focusCell === "0", "Keyboard focus was not restored to rotated cell 0");

  for (const cell of [5,10,15]) {
    await evaluate(`document.querySelector('.relay-tile[data-cell="${cell}"]').click(); true`);
  }

  const ready = await evaluate(`document.querySelector("#transmit-button").disabled === false`);
  assert(ready, "Four-click AAB route did not enable transmission");

  const sentence = await evaluate(`document.querySelector("#assembled-sentence").textContent`);
  assert(sentence.includes("At dusk") && sentence.includes("open the north lock") && sentence.includes("will drown"),
    "AAB sentence did not assemble expected fragments: " + sentence);

  await evaluate(`document.querySelector("#transmit-button").click(); true`);
  assert(await evaluate(`document.querySelector("#transmission-banner").hidden === false`),
    "Transmission banner did not appear");

  for (const place of ["harbor","garden","lock"]) {
    await evaluate(`document.querySelector('[data-place="${place}"]').click(); true`);
  }

  assert(await evaluate(`document.querySelector("#tower-button").disabled === false`),
    "Tower did not reopen after three aftermath visits");

  await evaluate(`document.querySelector("#tower-button").click(); true`);
  assert(await evaluate(`document.querySelector("#echo-panel").hidden === false`),
    "Tower 12 echo did not open");

  const finalData = await evaluate(`({
    title: document.querySelector("#echo-title").textContent,
    benefit: document.querySelector("#impact-benefit").textContent,
    strain: document.querySelector("#impact-strain").textContent,
    artifact: document.querySelector("#artifact-name").textContent,
    artifactChange: document.querySelector("#artifact-after").textContent
  })`);

  assert(finalData.title.length > 8, "Missing Tower 12 echo title");
  assert(finalData.benefit.length > 30, "Missing beneficiary summary");
  assert(finalData.strain.length > 30, "Missing strain summary");
  assert(finalData.artifact === "Root vial", "Unexpected artifact");
  assert(finalData.artifactChange.length > 20, "Missing artifact change");

  assert(runtimeErrors.length === 0, "Browser runtime errors:\n" + runtimeErrors.join("\n"));

  console.log("Glass Kelp browser smoke passed:", {
    viewport: "375x812",
    pattern: "AAB",
    sentence,
    echo: finalData.title,
    artifact: finalData.artifact
  });
} finally {
  try { ws.close(); } catch {}
  chrome.kill("SIGTERM");
  server.close();
  await fs.rm(userDir, {recursive:true, force:true});
}
