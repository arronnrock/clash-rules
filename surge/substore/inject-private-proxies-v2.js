const marker = "# Sub-Store injects the private Surge proxy list here.";
const collection = "private";

const regionPatterns = {
  US: /(\bUS\b|USA|United\s*States|美国|美國|🇺🇸|洛杉矶|洛杉磯|圣何塞|聖何塞|西雅图|西雅圖|达拉斯|達拉斯|纽约|紐約|Los\s*Angeles|San\s*Jose|Seattle|Dallas|New\s*York|c87s[123]\b|US\d+)/i,
  HK: /(\bHK\b|Hong\s*Kong|香港|🇭🇰|HKBN|HK\d+)/i,
  JP: /(\bJP\b|Japan|日本|🇯🇵|东京|東京|大阪|埼玉|樱花|櫻花|biglobe|c87s4\b|JP\d+)/i,
  SG: /(\bSG\b|Singapore|新加坡|狮城|獅城|🇸🇬|SG\d+)/i,
};

const informationNodePatterns = [
  /^🔄?\s*建议.*更新订阅/i,
  /^剩余流量/,
  /^剩余/,
  /^距离下次重置/,
  /^套餐到期/,
  /^苏菲家宽官网地址/,
  /^官网地址防失联发布页/,
  /^地址防失联发布页/,
  /^联通移动用中转/,
];

const nodes = await produceArtifact({
  type: "collection",
  name: collection,
  platform: "Surge",
});

if (!$content.includes(marker)) {
  throw new Error("Surge v2 proxy marker not found");
}

const proxyLines = String(nodes || "")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => {
    const separator = line.indexOf("=");
    if (separator <= 0) {
      throw new Error(`Malformed Surge proxy line from ${collection}`);
    }
    return {
      line,
      name: line.slice(0, separator).trim(),
    };
  })
  .filter(({ name }) => !informationNodePatterns.some((pattern) => pattern.test(name)));

if (proxyLines.length === 0) {
  throw new Error(`Sub-Store collection ${collection} produced no usable Surge nodes`);
}

const names = proxyLines.map(({ name }) => name);
if (new Set(names).size !== names.length) {
  throw new Error(`Sub-Store collection ${collection} produced duplicate Surge node names`);
}

const regionCounts = Object.fromEntries(
  Object.entries(regionPatterns).map(([region, pattern]) => [
    region,
    names.filter((name) => pattern.test(name)).length,
  ]),
);
const missingRegions = Object.entries(regionCounts)
  .filter(([, count]) => count === 0)
  .map(([region]) => region);

if (missingRegions.length > 0) {
  throw new Error(
    `Refusing to publish Surge v2: no nodes matched ${missingRegions.join(", ")}`,
  );
}

console.log(
  `Surge v2 nodes: total=${proxyLines.length}, regions=${JSON.stringify(regionCounts)}`,
);

$content = $content.replace(
  marker,
  proxyLines.map(({ line }) => line).join("\n"),
);

if ($options) {
  $options._res = {
    headers: {
      "profile-update-interval": 24,
    },
  };
}
