import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const profile = fs.readFileSync(path.join(root, "surfboard.conf"), "utf8");
const injectionScript = fs.readFileSync(
  path.join(root, "substore", "inject-private-proxies.js"),
  "utf8",
);
const artifact = JSON.parse(
  fs.readFileSync(path.join(root, "substore", "substore-surfboard-v1.json"), "utf8"),
);

function activeLines(text) {
  return text.split(/\r?\n/).map((line) => line.trim())
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

for (const name of ["General", "Host", "Proxy", "Proxy Group", "Rule"]) section(name);
assert.equal(activeLines(section("Proxy")).length, 0, "Public [Proxy] must be empty");
assert(profile.includes("# Sub-Store injects the private Surfboard proxy list here."));
assert(!profile.includes("#!MANAGED-CONFIG"), "The private gateway must add the managed URL");
assert(!/(password|passwd|token|uuid)\s*=/i.test(profile), "Public profile contains credentials");
assert(section("General").includes("ipv6 = false"));
assert(section("General").includes("doh-server = https://dns.alidns.com/dns-query, https://doh.pub/dns-query"));
assert(section("Host").includes("api.telegram.org = 149.154.166.110,149.154.167.220"));

const groups = new Map(activeLines(section("Proxy Group")).map((line) => {
  const separator = line.indexOf("=");
  assert(separator > 0, `Malformed group: ${line}`);
  return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
}));
for (const region of ["US", "HK", "JP", "SG"]) {
  assert(groups.get(`${region}-AUTO`));
  assert(groups.get(`${region}-MANUAL`));
  assert(groups.get(`${region}-AUTO`).startsWith(region === "US" ? "fallback," : "url-test,"));
  assert(groups.get(`${region}-MANUAL`).startsWith("select,"));
  if (region !== "US") {
    assert(groups.get(`${region}-AUTO`).includes('policy-regex-filter="(?i).*('));
    assert(groups.get(`${region}-AUTO`).includes(').*"'));
  }
  assert.equal(groups.get(region), `select, ${region}-AUTO, ${region}-MANUAL`);
}
assert.equal(groups.get("AI-REGION"), "select, US-AUTO, JP-AUTO, SG-AUTO");
assert.equal(groups.get("PROXY"), "select, PROXY-AUTO, HK, US, JP, SG, DIRECT");
assert(groups.get("US-TCP-AUTO").includes("\\[SS\\]"));
assert(groups.get("US-H2-AUTO").includes("\\[H2\\]"));
assert(groups.get("H2-UNDERLAY").includes("\\[SS\\]\\[UDP\\]"));
assert(groups.get("TCP-AUTO").includes("\\[SS\\]"));
assert(groups.get("PROXY-AUTO").startsWith("fallback, TCP-AUTO,"));
assert(section("General").includes("test-timeout = 15"));
assert.equal(groups.get("WIFI"), "select, PROXY, DIRECT");
assert.equal(groups.get("ACCESS"), "subnet, default=PROXY, TYPE:CELLULAR=PROXY, TYPE:WIFI=WIFI");

const filters = new Map(["US", "HK", "JP", "SG"].map((region) => {
  const match = groups.get(`${region}-MANUAL`).match(/policy-regex-filter="([^"]+)"/);
  assert(match, `Cannot parse ${region} filter`);
  return [region, new RegExp(match[1].replace(/^\(\?i\)/, ""), "i")];
}));
for (const [name, expected] of [
  ["JMS-user@c87s1.example.com:7171", "US"],
  ["美国AT&T家宽备用🇺🇸hy2", "US"],
  ["香港HKT三网|商宽1", "HK"],
  ["日本·三网|SAK-1", "JP"],
  ["新加坡 | GCP-1", "SG"],
]) {
  const matched = [...filters].filter(([, regex]) => regex.test(name)).map(([region]) => region);
  assert.deepEqual(matched, [expected], `${name} matched ${matched.join(",") || "none"}`);
}

const rules = activeLines(section("Rule"));
const index = (fragment) => rules.findIndex((line) => line.includes(fragment));
for (const fragment of [
  "DOMAIN,e.szridge.com,DIRECT",
  "PROCESS-NAME,com.openai.chatgpt,AI-REGION,force-remote-dns,enhanced-mode",
  "PROCESS-NAME,com.paypal.android.p2pmobile,US-AUTO,force-remote-dns,enhanced-mode",
  "PROCESS-NAME,com.tigerbrokers.stock*,ACCESS",
  "PROCESS-NAME,cn.futu.trader.*,ACCESS",
  "PROCESS-NAME,global.longbridge.*.android,ACCESS",
  "DOMAIN-SUFFIX,itiger.com,ACCESS",
  "DOMAIN-SUFFIX,qq.com,DIRECT",
  "DOMAIN-SUFFIX,miui.com,DIRECT",
  "DOMAIN-SUFFIX,alipay.com,DIRECT",
  "GEOIP,CN,DIRECT",
  "DOMAIN-SUFFIX,ts.net,ACCESS",
  "DOMAIN,play.googleapis.com,ACCESS",
]) assert(index(fragment) >= 0, `Missing rule ${fragment}`);
assert(index("PROTOCOL,QUIC" ) < index("com.openai.chatgpt,AI-REGION"));
assert(index("com.openai.chatgpt,AI-REGION") < index("GEOIP,CN,DIRECT"));
assert(index("com.paypal.android.p2pmobile,US-AUTO") < index("GEOIP,CN,DIRECT"));
assert(index("com.tigerbrokers.stock*,ACCESS") < index("DOMAIN-SUFFIX,cn,DIRECT"));
assert.equal(rules.at(-1), "FINAL,ACCESS");
assert(!rules.some((line) => line.startsWith("SUBNET,TYPE:CELLULAR,DIRECT")));
assert(!rules.some((line) => line.startsWith("RULE-SET,")), "Managed profile must be self-contained");

const allowedTypes = new Set(["DOMAIN", "DOMAIN-SUFFIX", "DOMAIN-KEYWORD", "IP-CIDR", "IP-CIDR6"]);
const listTargets = {
  "lan-corporate-direct.list": "DIRECT",
  "ai-stable.list": "AI-REGION",
  "paypal-us.list": "US-AUTO",
  "securities.list": "ACCESS",
  "wechat-direct.list": "DIRECT",
  "android-compat-direct.list": "DIRECT",
  "china-direct.list": "DIRECT",
  "international.list": "ACCESS",
};
for (const name of fs.readdirSync(path.join(root, "rules")).filter((name) => name.endsWith(".list"))) {
  const lines = activeLines(fs.readFileSync(path.join(root, "rules", name), "utf8"));
  assert(lines.length, `${name} is empty`);
  for (const line of lines) {
    const fields = line.split(",");
    assert.equal(fields.length, 2, `${name} malformed: ${line}`);
    assert(allowedTypes.has(fields[0]), `${name} has unsupported rule: ${line}`);
    const prefix = `${line},${listTargets[name]}`;
    assert(
      rules.some((rule) => rule === prefix || rule.startsWith(`${prefix},`)),
      `${name} is not compiled into surfboard.conf: ${line}`,
    );
  }
}

assert.equal(artifact.name, "surfboard_v1");
assert.equal(artifact.type, "file");
assert.equal(artifact.url, "https://raw.githubusercontent.com/arronnrock/clash-rules/main/surfboard/surfboard.conf");
assert.equal(artifact.process[0].args.content.trim(), injectionScript.trim());

const surfboardOnlyThree = [
  "美国 SS = ss, 1.1.1.1, 443, encrypt-method=aes-128-gcm, password=test",
  "香港 SS = ss, 1.1.1.2, 443, encrypt-method=aes-128-gcm, password=test",
  "日本 SS = ss, 1.1.1.3, 443, encrypt-method=aes-128-gcm, password=test",
].join("\n");
const completeSurgeCompatible = [
  "美国 US1 = hysteria2, 1.1.1.1, 443, password=test, download-bandwidth=100, sni=example.com, skip-cert-verify=true",
  "香港 HK1 = hysteria2, 1.1.1.2, 443, password=test, port-hopping=1000-2000, sni=example.com, skip-cert-verify=true",
  "日本 JP1 = hysteria2, 1.1.1.3, 443, password=test, sni=example.com, skip-cert-verify=true",
  "新加坡 SG1 = ss, 1.1.1.4, 443, encrypt-method=aes-128-gcm, password=test, udp-relay=true",
  "🔄建议每日更新订阅 = ss, 127.0.0.1, 1, encrypt-method=aes-128-gcm, password=test",
].join("\n");
const requests = [];
const logs = [];
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const inject = new AsyncFunction(
  "$content", "$options", "produceArtifact", "console",
  `${injectionScript}\nreturn { $content, $options };`,
);
const injected = await inject(profile, {}, async (request) => {
  requests.push(request);
  return request.platform === "Surfboard" ? surfboardOnlyThree : completeSurgeCompatible;
}, { log(message) { logs.push(String(message)); } });
assert.deepEqual(requests.map(({ platform }) => platform), ["Surfboard", "Surge"]);
assert(injected.$content.includes("美国 US1 [H2] = hysteria2"));
assert(injected.$content.includes("underlying-proxy=H2-UNDERLAY"));
assert(!injected.$content.includes("建议每日更新订阅"));
assert.equal(injected.$options._res.headers["profile-update-interval"], 6);
assert(logs.some((line) => line.includes("source=Surge-compatible")));

console.log("Surfboard template, rules, groups and Sub-Store fallback validated");
