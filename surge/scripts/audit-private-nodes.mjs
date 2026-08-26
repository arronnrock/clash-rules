import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const surgeDir = path.resolve(scriptDir, "..");
const profile = fs.readFileSync(path.join(surgeDir, "surge.conf"), "utf8");
const injectionScript = fs.readFileSync(
  path.join(surgeDir, "substore", "inject-private-proxies-v2.js"),
  "utf8",
);

let privateNodes = "";
for await (const chunk of process.stdin) {
  privateNodes += chunk;
}
assert(privateNodes.trim(), "Expected Surge proxy lines on stdin");

const injectionLogs = [];
const sandboxConsole = {
  log(message) {
    injectionLogs.push(String(message));
  },
};
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const inject = new AsyncFunction(
  "$content",
  "$options",
  "produceArtifact",
  "console",
  `${injectionScript}\nreturn { $content, $options };`,
);
const result = await inject(
  profile,
  {},
  async (request) => {
    assert.deepEqual(request, {
      type: "collection",
      name: "private",
      platform: "Surge",
    });
    return privateNodes;
  },
  sandboxConsole,
);

const proxySection = result.$content.match(/\[Proxy\]\s*\n([\s\S]*?)\n\s*\[Proxy Group\]/);
assert(proxySection, "Generated profile is missing [Proxy] or [Proxy Group]");

const proxyLines = proxySection[1]
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"));
const protocols = {};
for (const line of proxyLines) {
  const separator = line.indexOf("=");
  assert(separator > 0, "Generated profile contains a malformed proxy line");
  const protocol = line
    .slice(separator + 1)
    .split(",", 1)[0]
    .trim()
    .toLowerCase();
  protocols[protocol] = (protocols[protocol] || 0) + 1;
}

assert(
  !proxyLines.some((line) => /^🔄?\s*建议.*更新订阅/i.test(line)),
  "Subscription-information node was not removed",
);

console.log(injectionLogs.at(-1) || "Surge v2 region validation passed");
console.log(
  `Generated profile audit: proxies=${proxyLines.length}, protocols=${JSON.stringify(protocols)}`,
);
