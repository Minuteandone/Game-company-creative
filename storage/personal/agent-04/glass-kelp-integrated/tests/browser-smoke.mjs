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
    if (url.pathname === "/favicon.ico") {
      res.writeHead(204);
      res.end();
      return;
    }
    const rel = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(1));
    const target = path.resolve(ROOT, rel);
    if (!target.startsWith(ROOT + path.sep) && target !== path.join(ROOT, "index.html")) {
      res.writeHead(403);
      res.end("forbidden");
      return;
    }
    const data = await fs.readFile(target);
    res.writeHead(200, {"content-type": mime.get(path.extname(target)) || "application/octet-stream"});
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
});

const pause = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let chrome = null;
let ws = null;
let userDir = null;
let chromeStderr = "";
let chromeExit = null;
let nextId = 1;
const pending = new Map();
const runtimeErrors = [];

async function debuggerPortFromProfile(profile) {
  let lastError = "";
  for (let attempt = 0; attempt < 120; attempt++) {
    try {
      const raw = await fs.readFile(path.join(profile, "DevToolsActivePort"), "utf8");
      const port = Number(raw.split(/\r?\n/)[0]);
      if (Number.isInteger(port) && port > 0) return port;
    } catch (error) {
      lastError = error.code || String(error);
    }
    if (chromeExit) {
      throw new Error("Chrome exited before opening debugger: " +
        JSON.stringify(chromeExit) + "\n" + chromeStderr.slice(-2000));
    }
    await pause(100);
  }
  throw new Error("DevToolsActivePort unavailable (" + lastError + "). stderr:\n" +
    chromeStderr.slice(-2000));
}

async function getPageTarget(debuggerPort, pageUrl) {
  let last = "";
  const origin = pageUrl.split("/index.html")[0];
  for (let attempt = 0; attempt < 80; attempt++) {
    try {
      const res = await fetch("http://127.0.0.1:" + debuggerPort + "/json/list");
      const targets = await res.json();
      const target = targets.find(t => t.type === "page" && t.url.startsWith(origin));
      if (target?.webSocketDebuggerUrl) return target;
      last = "Targets: " + JSON.stringify(targets.map(t => ({type:t.type, url:t.url})));
    } catch (error) {
      last = String(error);
    }
    if (chromeExit) break;
    await pause(100);
  }
  throw new Error("Chrome DevTools page target did not appear. " + last +
    "\nstderr:\n" + chromeStderr.slice(-2000));
}

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
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await evaluate(expression)) return;
    await pause(60);
  }
  throw new Error("Timed out waiting for " + label);
}

async function click(selector) {
  const ok = await evaluate(`(() => {
    const button = document.querySelector(${JSON.stringify(selector)});
    if (!button || button.disabled) return false;
    button.click();
    return true;
  })()`);
  assert(ok, "Missing or disabled button " + selector);
}

try {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const pageUrl = `http://127.0.0.1:${port}/index.html`;
  userDir = await fs.mkdtemp(path.join(os.tmpdir(), "glass-kelp-chrome-"));

  chrome = spawn(chromePath, [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--remote-debugging-address=127.0.0.1",
    "--remote-debugging-port=0",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    `--user-data-dir=${userDir}`,
    pageUrl
  ], {stdio:["ignore","ignore","pipe"]});

  chrome.stderr.on("data", chunk => { chromeStderr += chunk.toString(); });
  chrome.on("exit", (code, signal) => { chromeExit = {code, signal}; });

  const debuggerPort = await debuggerPortFromProfile(userDir);
  const target = await getPageTarget(debuggerPort, pageUrl);
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, {once:true});
    ws.addEventListener("error", reject, {once:true});
  });

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

  await send("Runtime.enable");
  await send("Log.enable");
  await send("Page.enable");
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
    await click(`[data-place="${place}"]`);
  }

  assert(await evaluate(`document.querySelector("#tower-button").disabled === false`),
    "Tower did not unlock after three context visits");

  await click("#tower-button");
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
    await click(`.relay-tile[data-cell="${cell}"]`);
  }

  assert(await evaluate(`document.querySelector("#transmit-button").disabled === false`),
    "Four-click AAB route did not enable transmission");

  const sentence = await evaluate(`document.querySelector("#assembled-sentence").textContent`);
  assert(sentence.includes("At dusk") &&
         sentence.includes("open the north lock") &&
         sentence.includes("will drown"),
    "AAB sentence did not assemble expected fragments: " + sentence);

  await click("#transmit-button");
  assert(await evaluate(`document.querySelector("#transmission-banner").hidden === false`),
    "Transmission banner did not appear");
  assert(await evaluate(`document.activeElement?.id === "scene-title"`),
    "Keyboard focus should move to aftermath heading after transmission");

  for (const place of ["harbor","garden","lock"]) {
    await click(`[data-place="${place}"]`);
  }

  assert(await evaluate(`document.querySelector("#tower-button").disabled === false`),
    "Tower did not reopen after three aftermath visits");

  await click("#tower-button");
  assert(await evaluate(`document.querySelector("#echo-panel").hidden === false`),
    "Tower 12 echo did not open");
  assert(await evaluate(`document.querySelector("#tower-button").disabled === true`),
    "Tower should be terminally disabled after final echo");
  assert(await evaluate(`document.activeElement?.id === "echo-title"`),
    "Keyboard focus should move to echo heading");

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

  // Context-removal control: pre-transmission context stays withheld, but
  // aftermath must become available after a public commitment.
  await send("Page.navigate", {url: pageUrl + "?towerOnly=1"});
  await waitFor(
    `document.readyState === "complete" &&
     document.querySelector("#phase-label")?.textContent === "tower-only control" &&
     document.querySelector("#tower-panel")?.hidden === false`,
    "tower-only control mode"
  );

  assert(await evaluate(`document.querySelector("#visit-label").textContent === "context withheld"`),
    "Tower-only mode should label context as withheld");
  assert(await evaluate(`["harbor","garden","lock"].every(p =>
    document.querySelector('[data-place="' + p + '"]').disabled)`),
    "Tower-only mode should disable pre-transmission context locations");
  assert(await evaluate(`document.querySelector("#leave-tower").hidden === true`),
    "Tower-only control should not expose pre-transmission island context");
  assert((await evaluate(`document.querySelectorAll(".relay-tile").length`)) === 16,
    "Tower-only mode should start on same relay board");

  const collisionTurns = [1,0,0,1, 0,1,0,0, 0,1,2,2, 0,3,1,2];
  for (let cell = 0; cell < collisionTurns.length; cell++) {
    for (let turn = 0; turn < collisionTurns[cell]; turn++) {
      await click(`.relay-tile[data-cell="${cell}"]`);
    }
  }
  assert(await evaluate(`document.querySelectorAll(".sink-card.interference").length > 0`),
    "Known collision state did not render sink interference");
  assert(await evaluate(`[...document.querySelectorAll(".sink-card.interference .sink-source")]
    .some(el => el.textContent.includes("A + B / static"))`),
    "Interference was not labeled in text");

  await click("#reset-board");
  for (const cell of [0,5,10,15]) {
    await click(`.relay-tile[data-cell="${cell}"]`);
  }
  assert(await evaluate(`document.querySelector("#transmit-button").disabled === false`),
    "Tower-only AAB route did not become transmissible");

  await click("#transmit-button");
  assert(await evaluate(`["harbor","garden","lock"].every(p =>
    !document.querySelector('[data-place="' + p + '"]').disabled)`),
    "Tower-only aftermath locations should re-enable after transmission");
  assert(await evaluate(`document.querySelector('[data-place="harbor"] .place-sub').textContent.includes("tide gauge")`),
    "Tower-only aftermath should restore normal location descriptions");

  for (const place of ["harbor","garden","lock"]) {
    await click(`[data-place="${place}"]`);
  }
  assert(await evaluate(`document.querySelector("#tower-button").disabled === false`),
    "Tower-only control did not unlock Tower 12 after three aftermath visits");
  await click("#tower-button");
  assert(await evaluate(`document.querySelector("#echo-panel").hidden === false`),
    "Tower-only control could not reach final echo");

  assert(runtimeErrors.length === 0,
    "Browser runtime errors:\n" + runtimeErrors.join("\n"));

  console.log("Glass Kelp browser smoke passed:", {
    viewport: "375x812",
    normalPattern: "AAB",
    towerOnlyAftermath: true,
    interference: true,
    echo: finalData.title,
    artifact: finalData.artifact
  });
} finally {
  try { ws?.close(); } catch {}
  for (const task of pending.values()) task.reject(new Error("CDP session closed"));
  if (chrome) {
    if (chrome.exitCode === null && chrome.signalCode === null) {
      chrome.kill("SIGTERM");
      for (let i = 0; i < 40 && chrome.exitCode === null && chrome.signalCode === null; i++) {
        await pause(50);
      }
      if (chrome.exitCode === null && chrome.signalCode === null) {
        chrome.kill("SIGKILL");
        for (let i = 0; i < 20 && chrome.exitCode === null && chrome.signalCode === null; i++) {
          await pause(50);
        }
      }
    }
  }
  await new Promise(resolve => server.close(resolve));
  if (userDir) {
    await fs.rm(userDir, {recursive:true, force:true, maxRetries:20, retryDelay:100});
  }
}
