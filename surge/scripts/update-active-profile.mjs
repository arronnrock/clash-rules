import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const activeProfilePath = process.argv[2];
assert(activeProfilePath, "Usage: node update-active-profile.mjs <active-profile>");

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const surgeDir = path.resolve(scriptDir, "..");
const injectionScript = fs.readFileSync(
  path.join(surgeDir, "substore", "inject-private-proxies-v2.js"),
  "utf8",
);
const marker = "# Sub-Store injects the private Surge proxy list here.";
const activeProfile = fs.readFileSync(activeProfilePath, "utf8");

const proxySectionPattern = /(\[Proxy\][ \t]*\r?\n)[\s\S]*?(\r?\n[ \t]*\[Proxy Group\])/;
assert(proxySectionPattern.test(activeProfile), "Active profile has no replaceable [Proxy] section");
const injectableProfile = activeProfile.replace(
  proxySectionPattern,
  `$1${marker}$2`,
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
  injectableProfile,
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

assert(!result.$content.includes(marker));
process.stdout.write(result.$content.endsWith("\n") ? result.$content : `${result.$content}\n`);
