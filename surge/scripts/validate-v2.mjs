import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const surgeDir = path.resolve(scriptDir, "..");
const profile = fs.readFileSync(path.join(surgeDir, "surge.conf"), "utf8");
const subStoreScript = fs.readFileSync(
  path.join(surgeDir, "substore", "inject-private-proxies-v2.js"),
  "utf8",
);
const subStoreArtifact = JSON.parse(
  fs.readFileSync(
    path.join(surgeDir, "substore", "substore-surge-v2.json"),
    "utf8",
  ),
);
const readme = fs.readFileSync(path.join(surgeDir, "README.md"), "utf8");
const regionScript = fs.readFileSync(
  path.join(scriptDir, "network-region.js"),
  "utf8",
);

function activeLines(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !/^[#;]/.test(line));
}

function section(name) {
  const lines = profile.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `[${name}]`);
  assert(start >= 0, `Missing [${name}]`);
  const end = lines.findIndex(
    (line, index) => index > start && /^\[[^\]]+\]$/.test(line.trim()),
  );
  return lines.slice(start + 1, end < 0 ? undefined : end).join("\n");
}

for (const name of ["General", "Host", "Proxy", "Proxy Group", "Script", "Rule"]) {
  section(name);
}

assert(section("General").includes("use-local-host-item-for-proxy = true"));
assert(
  section("Host").includes(
    "api.telegram.org = 149.154.166.110,149.154.167.220",
  ),
  "Telegram Bot API must retain its verified anti-pollution mapping",
);

assert.equal(activeLines(section("Proxy")).length, 0, "[Proxy] must not contain nodes");
assert(profile.includes("# Sub-Store injects the private Surge proxy list here."));
assert(!profile.includes("policy-path="), "Complete-profile injection must not retain policy-path");
assert(!profile.includes("SUB-STORE-HOST"), "Public template must not require a private host placeholder");
assert(!/(password|passwd|token|uuid)\s*=/i.test(profile), "Profile contains a credential field");

const groups = new Map(
  activeLines(section("Proxy Group")).map((line) => {
    const separator = line.indexOf("=");
    assert(separator > 0, `Malformed group: ${line}`);
    return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
  }),
);

assert(!groups.has("_ALL-NODES"), "Injected [Proxy] nodes do not need a carrier group");
for (const region of ["US", "HK", "JP", "SG"]) {
  const auto = groups.get(`${region}-AUTO`);
  const manual = groups.get(`${region}-MANUAL`);
  assert(auto, `Missing ${region}-AUTO`);
  assert(manual, `Missing ${region}-MANUAL`);
  assert(auto.startsWith(region === "US" ? "fallback," : "url-test,"));
  assert(manual.startsWith("select,"));
  assert(auto.includes("include-all-proxies=true"));
  assert(manual.includes("include-all-proxies=true"));
  assert(auto.includes("policy-regex-filter="));
  assert(manual.includes("policy-regex-filter="));
  assert.equal(groups.get(region), `select, ${region}-AUTO, ${region}-MANUAL`);
}
assert.equal(groups.get("AI-REGION"), "select, US-AUTO, JP-AUTO, SG-AUTO");
assert.equal(groups.get("PROXY-AUTO"), "fallback, HK-AUTO, SG-AUTO, JP-AUTO, US-AUTO, interval=300, timeout=5, evaluate-before-use=true");
assert.equal(groups.get("PROXY"), "select, PROXY-AUTO, HK, US, JP, SG, DIRECT");
assert.equal(groups.get("WIFI"), "select, PROXY, DIRECT");
assert(groups.get("SECURITIES-AUTO")?.startsWith("smart,"));
assert(groups.get("SECURITIES-AUTO")?.includes("include-all-proxies=true"));
assert(groups.get("SECURITIES-AUTO")?.includes("policy-priority="));
assert(groups.get("SECURITIES-AUTO")?.includes("evaluate-before-use=true"));
assert.equal(groups.get("SECURITIES"), "select, SECURITIES-AUTO, HK, JP, SG, US, DIRECT");
for (const removed of ["TW", "OTHER", "NETWORK", "GLOBAL-PROXY", "US-JP-SG", "OPENAI_GROUP", "GOOGLE_GROUP", "APPLE_AI_GROUP", "TELEGRAM_GROUP"]) {
  assert(!groups.has(removed), `Removed group unexpectedly present: ${removed}`);
}

const filters = new Map(
  ["US", "HK", "JP", "SG"].map((region) => {
    const match = groups
      .get(`${region}-MANUAL`)
      .match(/policy-regex-filter="([^"]+)"/);
    assert(match, `Cannot parse ${region} filter`);
    return [region, new RegExp(match[1].replace(/^\(\?i\)/, ""), "i")];
  }),
);

const samples = [
  ["JMS-user@c87s1.example.com:7171", "US"],
  ["JMS-user@c87s2.example.com:7171", "US"],
  ["JMS-user@c87s3.example.com:7171", "US"],
  ["JMS-user@c87s4.example.com:7171", "JP"],
  ["香港家宽hy2🇭🇰", "HK"],
  ["美国AT&T家宽备用🇺🇸hy2", "US"],
  ["【1】新加坡高速节点🇸🇬hy2", "SG"],
  ["🇯🇵日本·三网|SAK-1", "JP"],
  ["🇭🇰香港HKT三网|商宽1", "HK"],
  ["🇸🇬 新加坡 | GCP-1", "SG"],
  ["🇺🇸美国·洛杉矶|原生-1", "US"],
];
for (const [node, expected] of samples) {
  const matched = [...filters]
    .filter(([, regex]) => regex.test(node))
    .map(([region]) => region);
  assert.deepEqual(matched, [expected], `${node} matched ${matched.join(",") || "none"}`);
}
assert(![...filters.values()].some((regex) => regex.test("c87s5.example.com")));
for (const otherRegionNode of [
  "台湾seednet动态家宽🇹🇼hy2",
  "加拿大家宽🇨🇦hy2",
  "🇰🇷韩国SK·三网|家宽1",
  "🇲🇴澳门|特别行政区1",
]) {
  assert(
    ![...filters.values()].some((regex) => regex.test(otherRegionNode)),
    `${otherRegionNode} must not enter US/HK/JP/SG`,
  );
}

const ruleLines = activeLines(section("Rule"));
const index = (fragment) => ruleLines.findIndex((line) => line.includes(fragment));
for (const fragment of [
  "LAN,DIRECT",
  "/ai-stable.list,AI-REGION",
  "/paypal-us.list,US-AUTO",
  "TYPE:CELLULAR,DIRECT",
  "DOMAIN-SUFFIX,iotaskyt.com,SECURITIES",
  "DOMAIN-SUFFIX,tigerfintech.com,SECURITIES",
  "DOMAIN-SUFFIX,skytigris.cn,SECURITIES",
  "PROCESS-NAME,Tiger Trade,SECURITIES #!MACOS-ONLY",
  "PROCESS-NAME,longbridge,SECURITIES #!MACOS-ONLY",
  "PROCESS-NAME,Futubull,SECURITIES #!MACOS-ONLY",
  "PROCESS-NAME,moomoo,SECURITIES #!MACOS-ONLY",
  "/securities-wifi.list,SECURITIES",
  "/wechat-direct-v2.list,DIRECT",
  "/compat-direct.list,DIRECT",
  "/china-direct-v2.list,DIRECT",
  "GEOIP,CN,DIRECT",
  "/international-wifi.list,WIFI",
  "FINAL,WIFI",
]) {
  assert(index(fragment) >= 0, `Missing rule: ${fragment}`);
}
assert(index("/ai-stable.list,AI-REGION") < index("TYPE:CELLULAR,DIRECT"));
assert(index("/paypal-us.list,US-AUTO") < index("TYPE:CELLULAR,DIRECT"));
assert(index("TYPE:CELLULAR,DIRECT") < index("DOMAIN-SUFFIX,iotaskyt.com,SECURITIES"));
assert(index("PROCESS-NAME,Tiger Trade,SECURITIES #!MACOS-ONLY") < index("DOMAIN-SUFFIX,iotaskyt.com,SECURITIES"));
assert(index("DOMAIN-SUFFIX,skytigris.cn,SECURITIES") < index("GEOIP,CN,DIRECT"));
assert(index("TYPE:CELLULAR,DIRECT") < index("/securities-wifi.list,SECURITIES"));
assert(index("PROCESS-NAME,Tiger Trade,SECURITIES") < index("/securities-wifi.list,SECURITIES"));
assert(index("/securities-wifi.list,SECURITIES") < index("/wechat-direct-v2.list,DIRECT"));
assert(index("GEOIP,CN,DIRECT") < index("/international-wifi.list,WIFI"));
assert.equal(ruleLines.at(-1), "FINAL,WIFI,dns-failed");

const listNames = [
  "ai-stable.list",
  "paypal-us.list",
  "securities-wifi.list",
  "wechat-direct-v2.list",
  "compat-direct.list",
  "china-direct-v2.list",
  "international-wifi.list",
  "lan-corporate-direct.list",
];
const allowedRuleTypes = new Set([
  "DOMAIN",
  "DOMAIN-SUFFIX",
  "DOMAIN-KEYWORD",
  "IP-CIDR",
  "IP-CIDR6",
]);
const lists = new Map();
for (const name of listNames) {
  const lines = activeLines(fs.readFileSync(path.join(surgeDir, "rules", name), "utf8"));
  assert(lines.length > 0, `${name} is empty`);
  for (const line of lines) {
    const fields = line.split(",");
    assert.equal(fields.length, 2, `${name} malformed: ${line}`);
    assert(allowedRuleTypes.has(fields[0]), `${name} unsupported type: ${line}`);
  }
  lists.set(name, new Set(lines));
}

for (const required of [
  "DOMAIN-SUFFIX,openai.com",
  "DOMAIN-SUFFIX,chatgpt.com",
  "DOMAIN,mask.icloud.com",
  "DOMAIN,gemini.google.com",
]) {
  assert(lists.get("ai-stable.list").has(required), `AI list missing ${required}`);
}
for (const required of [
  "DOMAIN-SUFFIX,itiger.com",
  "DOMAIN-SUFFIX,iotaskyt.com",
  "DOMAIN-SUFFIX,tigerfintech.com",
  "DOMAIN-SUFFIX,skytigris.cn",
  "DOMAIN-SUFFIX,futunn.com",
  "DOMAIN-SUFFIX,longbridge.com",
  "DOMAIN-SUFFIX,longbridge.cn",
]) {
  assert(lists.get("securities-wifi.list").has(required), `Securities list missing ${required}`);
}
for (const required of [
  "DOMAIN-SUFFIX,gtimg.com",
  "DOMAIN-SUFFIX,qpic.cn",
  "IP-CIDR,43.154.95.0/24",
]) {
  assert(lists.get("wechat-direct-v2.list").has(required), `WeChat list missing ${required}`);
}
for (const required of [
  "DOMAIN,play.googleapis.com",
  "DOMAIN,android.clients.google.com",
  "DOMAIN,connectivitycheck.gstatic.com",
]) {
  assert(lists.get("international-wifi.list").has(required), `Compatibility list missing ${required}`);
}

assert(profile.match(/event-name=network-changed/));
assert(profile.match(/event-name=engine-started/));
assert(regionScript.includes('policy: "DIRECT"'));
assert(regionScript.includes("setSelectGroupPolicy"));

assert.equal(subStoreArtifact.name, "surge_v2");
assert.equal(subStoreArtifact.type, "file");
assert.equal(
  subStoreArtifact.url,
  "https://raw.githubusercontent.com/arronnrock/clash-rules/main/surge/surge.conf",
);
assert.equal(subStoreArtifact.process.length, 1);
assert.equal(subStoreArtifact.process[0].type, "Script Operator");
assert.equal(subStoreArtifact.process[0].args.content.trim(), subStoreScript.trim());

const sampleNodes = [
  "Sub-Store US sample = direct",
  "Sub-Store HK sample = direct",
  "Sub-Store JP sample = direct",
  "Sub-Store SG sample = direct",
  "🔄建议每日更新订阅 = direct",
].join("\n");
let productionRequest;
const subStoreOptions = {};
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const inject = new AsyncFunction(
  "$content",
  "$options",
  "produceArtifact",
  `${subStoreScript}\nreturn { $content, $options };`,
);
const injected = await inject(profile, subStoreOptions, async (request) => {
  productionRequest = request;
  return sampleNodes;
});
assert.deepEqual(productionRequest, {
  type: "collection",
  name: "private",
  platform: "Surge",
});
assert(!injected.$content.includes("# Sub-Store injects the private Surge proxy list here."));
assert(injected.$content.includes("Sub-Store US sample = direct"));
assert(injected.$content.includes("Sub-Store HK sample = direct"));
assert(injected.$content.includes("Sub-Store JP sample = direct"));
assert(injected.$content.includes("Sub-Store SG sample = direct"));
assert(!injected.$content.includes("建议每日更新订阅"));
assert.equal(injected.$options._res.headers["profile-update-interval"], 24);

await assert.rejects(
  inject(
    profile,
    {},
    async () => [
      "Sub-Store US sample = direct",
      "Sub-Store HK sample = direct",
      "Sub-Store SG sample = direct",
    ].join("\n"),
  ),
  /no nodes matched JP/,
);
assert(readme.includes("VPS HTTPS path with a private read-only token"));
assert(readme.includes("profile rendered from a pinned Git commit"));
assert(readme.includes("reverse-forward listen address"));
assert(readme.includes("Tailscale Funnel is not a production"));
assert(readme.includes("management ports on loopback"));
assert(readme.includes("no bind mount or Docker volume"));

async function exerciseRegionScript({ status = 200, data = "", error = null, initial = "PROXY" }) {
  let selected = initial;
  let done = 0;
  const logs = [];
  const httpClient = {
    get(options, callback) {
      assert.equal(options.policy, "DIRECT");
      callback(error, status == null ? null : { status }, data);
    },
  };
  const surge = {
    selectGroupDetails: () => ({ groups: { WIFI: ["PROXY", "DIRECT"] }, decisions: { WIFI: selected } }),
    setSelectGroupPolicy(group, policy) {
      assert.equal(group, "WIFI");
      selected = policy;
      return true;
    },
    logbook(message) {
      logs.push(message);
    },
  };
  const run = new Function("$httpClient", "$surge", "$done", "console", regionScript);
  run(httpClient, surge, () => { done += 1; }, { log: (message) => logs.push(message) });
  assert.equal(done, 1, "network-region.js must call $done once");
  return { selected, logs };
}

const mainland = await exerciseRegionScript({ data: "ip=1.1.1.1\nloc=CN\n", initial: "DIRECT" });
assert.equal(mainland.selected, "PROXY");
assert(mainland.logs.some((message) => message.includes("mainland China")));
const hongKong = await exerciseRegionScript({ data: "ip=1.1.1.1\nloc=HK\n", initial: "PROXY" });
assert.equal(hongKong.selected, "DIRECT");
assert(hongKong.logs.some((message) => message.includes("Hong Kong/Macau")));
assert.equal((await exerciseRegionScript({ data: "ip=1.1.1.1\nloc=MO\n", initial: "PROXY" })).selected, "DIRECT");
const overseas = await exerciseRegionScript({ data: "ip=1.1.1.1\nloc=JP\n", initial: "PROXY" });
assert.equal(overseas.selected, "DIRECT");
assert(overseas.logs.some((message) => message.includes("overseas")));
assert.equal((await exerciseRegionScript({ error: "offline", status: null, initial: "DIRECT" })).selected, "DIRECT");
assert.equal((await exerciseRegionScript({ data: "malformed", initial: "PROXY" })).selected, "PROXY");

console.log(`Validated ${groups.size} groups, ${ruleLines.length} routing rules and ${listNames.length} rule lists.`);
console.log(`Validated ${samples.length} representative node names and 6 network-region branches.`);
