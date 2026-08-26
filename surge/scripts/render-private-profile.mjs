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
  { log() {} },
);

assert(!result.$content.includes("# Sub-Store injects the private Surge proxy list here."));
process.stdout.write(result.$content.endsWith("\n") ? result.$content : `${result.$content}\n`);
