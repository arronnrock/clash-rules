import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const surfboardDir = path.resolve(scriptDir, "..");
const processor = fs.readFileSync(
  path.join(surfboardDir, "substore", "inject-private-proxies.js"),
  "utf8",
);
const artifact = {
  name: "surfboard_v1",
  displayName: "Surfboard Android v1",
  remark: "Android mainland-cellular profile with private collection injection",
  type: "file",
  source: "remote",
  url: "https://raw.githubusercontent.com/arronnrock/clash-rules/main/surfboard/surfboard.conf",
  process: [{
    type: "Script Operator",
    args: { customName: "Inject private Surfboard proxies", content: processor },
  }],
};
fs.writeFileSync(
  path.join(surfboardDir, "substore", "substore-surfboard-v1.json"),
  `${JSON.stringify(artifact, null, 2)}\n`,
);
