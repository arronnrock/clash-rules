import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "../..");
const outputDir = path.join(rootDir, "dist/surge");
const sourceProfilePaths = {
  A: path.join(rootDir, "surge/iphone_personal.conf"),
  B: path.join(rootDir, "surge/iphone_personal_b.conf"),
};

const listPaths = {
  openai: path.join(rootDir, "surge/rules/openai.list"),
  paypal: path.join(rootDir, "surge/rules/paypal.list"),
  wechat: path.join(rootDir, "surge/rules/wechat-direct.list"),
  china: path.join(rootDir, "surge/rules/china-direct.list"),
  foreign: path.join(rootDir, "surge/rules/foreign-proxy.list"),
};

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function activeLines(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

function getSection(text, sectionName) {
  const marker = `[${sectionName}]`;
  const lines = text.split("\n");
  const start = lines.findIndex((line) => line.trim() === marker);
  assert(start >= 0, `Missing ${marker} section`);

  const nextSection = lines.findIndex(
    (line, index) => index > start && /^\[[^\]]+\]$/.test(line.trim()),
  );
  return lines.slice(start + 1, nextSection >= 0 ? nextSection : undefined).join("\n");
}

function validateRuleList(name, text) {
  const allowedTypes = new Set([
    "DOMAIN",
    "DOMAIN-SUFFIX",
    "DOMAIN-KEYWORD",
    "IP-CIDR",
    "IP-CIDR6",
  ]);
  const lines = activeLines(text);

  assert(lines.length > 0, `${name} rule list is empty`);
  for (const line of lines) {
    const fields = line.split(",").map((field) => field.trim());
    assert(fields.length === 2, `${name} contains a policy or malformed rule: ${line}`);
    assert(allowedTypes.has(fields[0]), `${name} contains unsupported rule type: ${line}`);
    assert(fields[1], `${name} contains an empty rule value: ${line}`);
  }

  return lines;
}

function requireEntries(name, lines, entries) {
  const rules = new Set(lines);
  for (const entry of entries) {
    assert(rules.has(entry), `${name} is missing required rule: ${entry}`);
  }
}

function requireBefore(ruleLines, earlierFragment, laterFragment) {
  const earlier = ruleLines.findIndex((line) => line.includes(earlierFragment));
  const later = ruleLines.findIndex((line) => line.includes(laterFragment));
  assert(earlier >= 0, `Missing rule containing: ${earlierFragment}`);
  assert(later >= 0, `Missing rule containing: ${laterFragment}`);
  assert(earlier < later, `${earlierFragment} must appear before ${laterFragment}`);
}

const lists = Object.fromEntries(
  Object.entries(listPaths).map(([name, filePath]) => [
    name,
    validateRuleList(name, readText(filePath)),
  ]),
);

const representativeNodes = [
  ["JMS-user@c87s1.example.com:7171", "US"],
  ["JMS-user@c87s2.example.com:7171", "US"],
  ["JMS-user@c87s3.example.com:7171", "US"],
  ["JMS-user@c87s4.example.com:7171", "JP"],
  ["优秀|【3x】中转|香港家宽🇭🇰", "HK"],
  ["【3x】中转|美国一🇺🇸", "US"],
  ["【3x】中转|高速新加坡🇸🇬", "SG"],
  ["【3x】中转|日本樱花🇯🇵", "JP"],
  ["优秀|【3x】中转|台湾hinet动态家宽🇹🇼", "TW"],
  ["【3x】中转|英国", "OTHER"],
  ["【3x】中转|加拿大家宽🇨🇦", "OTHER"],
  ["韩国", "OTHER"],
  ["泰国", "OTHER"],
  ["越南", "OTHER"],
  ["尼日利亚", "OTHER"],
];

requireEntries("openai", lists.openai, [
  "DOMAIN-SUFFIX,openai.com",
  "DOMAIN-SUFFIX,chatgpt.com",
  "DOMAIN-SUFFIX,oaiusercontent.com",
]);
requireEntries("paypal", lists.paypal, [
  "DOMAIN-SUFFIX,paypal.com",
  "DOMAIN-SUFFIX,paypalobjects.com",
]);
requireEntries("wechat", lists.wechat, [
  "DOMAIN-SUFFIX,qq.com",
  "DOMAIN-SUFFIX,weixin.qq.com",
  "DOMAIN-SUFFIX,wechat.com",
  "DOMAIN-SUFFIX,gtimg.com",
  "IP-CIDR,43.154.95.0/24",
]);
requireEntries("china", lists.china, [
  "DOMAIN-SUFFIX,xiaohongshu.com",
  "DOMAIN-SUFFIX,xhscdn.com",
  "DOMAIN-SUFFIX,xhslink.com",
  "DOMAIN-KEYWORD,xiaohongshu",
  "DOMAIN-KEYWORD,xhscdn",
]);

const foreignRules = new Set(lists.foreign);
for (const domesticRule of [...lists.wechat, ...lists.china]) {
  assert(!foreignRules.has(domesticRule), `Domestic rule leaked into foreign list: ${domesticRule}`);
}

const wifiCatchAllRule = "SUBNET,TYPE:WIFI,GLOBAL-PROXY";

function validateProfile(profileName, profile, wifiCatchAll) {
  const label = `Profile ${profileName}`;

  for (const section of ["General", "Host", "Proxy", "Proxy Group", "Rule"]) {
    getSection(profile, section);
  }

  const proxyLines = activeLines(getSection(profile, "Proxy"));
  assert(
    proxyLines.length === 0,
    `${label} [Proxy] must remain empty for private Sub-Store injection`,
  );

  const forbiddenPatterns = [
    [/\bPROCESS-(?:NAME|PATH|NAME-REGEX)\b/i, "process rules"],
    [/\bsmart\b/i, "Smart policy groups"],
    [/\b(?:password|passwd|token|uuid)\s*=/i, "embedded credentials"],
  ];
  for (const [pattern, description] of forbiddenPatterns) {
    assert(!pattern.test(profile), `${label} contains forbidden ${description}`);
  }

  const groupLines = activeLines(getSection(profile, "Proxy Group"));
  const groups = new Map(
    groupLines.map((line) => {
      const separator = line.indexOf("=");
      assert(separator > 0, `${label} has malformed proxy group: ${line}`);
      return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
    }),
  );

  for (const groupName of ["US", "HK", "JP", "SG", "TW", "OTHER"]) {
    const definition = groups.get(groupName);
    assert(definition, `${label} is missing ${groupName} proxy group`);
    assert(/^select\s*,/i.test(definition), `${label} ${groupName} must use select`);
    assert(
      /(?:^|,)\s*include-all-proxies\s*=\s*true(?:\s*,|$)/i.test(definition),
      `${label} ${groupName} must include Sub-Store-injected proxies`,
    );
    assert(
      /(?:^|,)\s*policy-regex-filter\s*=/i.test(definition),
      `${label} ${groupName} must define a regional filter`,
    );
    assert(
      !/(?:^|,)\s*DIRECT(?:\s*,|$)/i.test(definition),
      `${label} ${groupName} must not contain DIRECT`,
    );
  }

  assert(
    groups.get("GLOBAL-PROXY") === "select, HK, JP, SG, TW, US, OTHER",
    `${label} GLOBAL-PROXY must default to HK and preserve the approved group order`,
  );
  assert(!/\bc87s5\b/i.test(profile), `${label} must not contain c87s5`);

  const usGroup = groups.get("US");
  for (const nodeName of ["c87s1", "c87s2", "c87s3"]) {
    assert(usGroup.includes(nodeName), `${label} must classify ${nodeName} as US`);
  }
  assert(groups.get("JP").includes("c87s4"), `${label} must classify c87s4 as JP`);

  const regionalFilters = new Map(
    ["US", "HK", "JP", "SG", "TW", "OTHER"].map((groupName) => {
      const match = groups.get(groupName).match(/policy-regex-filter="(.+)"$/);
      assert(match, `${label} ${groupName} has an invalid policy-regex-filter`);
      return [groupName, new RegExp(match[1].replace(/^\(\?i\)/, ""), "i")];
    }),
  );
  for (const [nodeName, expectedGroup] of representativeNodes) {
    const matches = [...regionalFilters]
      .filter(([, regex]) => regex.test(nodeName))
      .map(([groupName]) => groupName);
    assert(
      matches.length === 1 && matches[0] === expectedGroup,
      `${label} ${nodeName} must match only ${expectedGroup}; matched: ${
        matches.join(", ") || "none"
      }`,
    );
  }
  assert(
    ![...regionalFilters.values()].some((regex) =>
      regex.test("JMS-user@c87s5.example.com:7171"),
    ),
    `${label} c87s5 must not match a regional group`,
  );

  const ruleLines = activeLines(getSection(profile, "Rule"));
  assert(
    ruleLines.filter((line) => /^FINAL,/i.test(line)).length === 1,
    `${label} requires exactly one FINAL rule`,
  );
  assert(ruleLines.at(-1) === "FINAL,DIRECT", `${label} FINAL must be DIRECT`);

  requireBefore(ruleLines, "/openai.list", "TYPE:CELLULAR");
  requireBefore(ruleLines, "/paypal.list", "TYPE:CELLULAR");
  requireBefore(ruleLines, "TYPE:CELLULAR", "/wechat-direct.list");
  requireBefore(ruleLines, "/wechat-direct.list", "/foreign-proxy.list");
  requireBefore(ruleLines, "/china-direct.list", "/foreign-proxy.list");
  requireBefore(ruleLines, "GEOIP,CN,DIRECT", "/foreign-proxy.list");
  requireBefore(ruleLines, "/foreign-proxy.list", "FINAL,DIRECT");

  const wifiRules = ruleLines.filter((line) => line === wifiCatchAllRule);
  if (wifiCatchAll) {
    assert(wifiRules.length === 1, `${label} requires one Wi-Fi proxy fallback`);
    requireBefore(ruleLines, "GEOIP,CN,DIRECT", wifiCatchAllRule);
    requireBefore(ruleLines, "/foreign-proxy.list", wifiCatchAllRule);
    requireBefore(ruleLines, wifiCatchAllRule, "FINAL,DIRECT");
  } else {
    assert(wifiRules.length === 0, `${label} must not contain a Wi-Fi proxy fallback`);
  }

  const hostSection = activeLines(getSection(profile, "Host"));
  for (const host of [
    "xiaohongshu.com",
    "*.xiaohongshu.com",
    "xhscdn.com",
    "*.xhscdn.com",
    "xhslink.com",
    "*.xhslink.com",
  ]) {
    assert(
      hostSection.includes(`${host} = server:223.5.5.5`),
      `${label} is missing Xiaohongshu DNS policy for ${host}`,
    );
  }

  return groupLines.length;
}

const profiles = Object.fromEntries(
  Object.entries(sourceProfilePaths).map(([profileName, filePath]) => [
    profileName,
    readText(filePath),
  ]),
);
const groupCounts = {
  A: validateProfile("A", profiles.A, false),
  B: validateProfile("B", profiles.B, true),
};

assert(
  profiles.A === profiles.B.replace(`${wifiCatchAllRule}\n`, ""),
  "Profiles A and B must differ only by the Wi-Fi proxy fallback",
);

fs.mkdirSync(outputDir, { recursive: true });
const outputProfiles = {
  "iphone_personal.conf": profiles.A,
  "iphone_personal_a.conf": profiles.A,
  "iphone_personal_b.conf": profiles.B,
};
for (const [fileName, profile] of Object.entries(outputProfiles)) {
  const outputPath = path.join(outputDir, fileName);
  fs.writeFileSync(outputPath, profile.endsWith("\n") ? profile : `${profile}\n`);
  console.log(`Built ${path.relative(rootDir, outputPath)}`);
}

const totalRules = Object.values(lists).reduce((sum, rules) => sum + rules.length, 0);
console.log(
  `Validated ${groupCounts.A + groupCounts.B} proxy groups and ${totalRules} shared external rules`,
);
console.log(`Validated ${representativeNodes.length} representative node names`);
console.log("A/B invariant: profiles differ only by B's Wi-Fi GLOBAL-PROXY fallback");
