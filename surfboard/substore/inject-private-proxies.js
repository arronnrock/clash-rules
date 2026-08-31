const marker = "# Sub-Store injects the private Surfboard proxy list here.";
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

const supportedProtocols = new Set([
  "http", "https", "socks5", "socks5-tls", "ss", "vmess", "trojan",
  "wireguard", "hysteria2", "anytls", "tuic", "snell",
]);
const hysteria2Parameters = new Set([
  "password", "download-bandwidth", "port-hopping", "port-hopping-interval",
  "skip-cert-verify", "sni", "server-cert-fingerprint-sha256",
  "salamander-password", "udp-relay", "underlying-proxy", "block-quic",
]);

function parseNodes(raw, platform) {
  const nodes = String(raw || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf("=");
      if (separator <= 0) throw new Error(`Malformed ${platform} proxy line`);
      const name = line.slice(0, separator).trim();
      const fields = line.slice(separator + 1).split(",").map((field) => field.trim());
      const protocol = String(fields[0] || "").toLowerCase();
      return { line, name, protocol, fields };
    })
    .filter(({ name }) => !informationNodePatterns.some((pattern) => pattern.test(name)));

  if (!nodes.length) throw new Error(`${platform} produced no usable nodes`);
  const names = nodes.map(({ name }) => name);
  if (new Set(names).size !== names.length) {
    throw new Error(`${platform} produced duplicate proxy names`);
  }
  for (const node of nodes) {
    if (!supportedProtocols.has(node.protocol)) {
      throw new Error(`${platform} produced unsupported protocol ${node.protocol}`);
    }
    if (node.protocol === "hysteria2") {
      for (const field of node.fields.slice(3)) {
        const separator = field.indexOf("=");
        if (separator < 1) continue;
        const key = field.slice(0, separator).trim();
        if (!hysteria2Parameters.has(key)) {
          throw new Error(`${platform} produced unsupported Hysteria2 parameter ${key}`);
        }
      }
    }
  }

  const counts = Object.fromEntries(
    Object.entries(regionPatterns).map(([region, pattern]) => [
      region,
      names.filter((name) => pattern.test(name)).length,
    ]),
  );
  const missing = Object.entries(counts)
    .filter(([, count]) => count === 0)
    .map(([region]) => region);
  if (missing.length) {
    throw new Error(`${platform} has no nodes matching ${missing.join(", ")}`);
  }
  return { nodes, counts };
}

if (!$content.includes(marker)) {
  throw new Error("Surfboard proxy marker not found");
}

let selected;
let selectedPlatform = "Surfboard";
try {
  selected = parseNodes(await produceArtifact({
    type: "collection",
    name: collection,
    platform: "Surfboard",
  }), "Surfboard");
} catch (error) {
  // The deployed Sub-Store producer currently omits Hysteria2 from Surfboard
  // output. Surge node syntax is accepted by Surfboard, so use it only after
  // strict protocol, parameter and region validation.
  selectedPlatform = "Surge-compatible";
  selected = parseNodes(await produceArtifact({
    type: "collection",
    name: collection,
    platform: "Surge",
  }), selectedPlatform);
}

// A policy filter can only inspect the proxy name.  Keep the original name
// intact and append a protocol marker, allowing Android to prefer SS/TCP when
// a mobile network filters Hysteria2's UDP/QUIC transport.
$content = $content.replace(
  marker,
  selected.nodes.map(({ line, name, protocol }) => (
    `${name} [${protocol === "hysteria2" ? "H2" : protocol.toUpperCase()}]${line.slice(name.length)}`
  )).join("\n"),
);
console.log(
  `Surfboard nodes: source=${selectedPlatform}, total=${selected.nodes.length}, regions=${JSON.stringify(selected.counts)}`,
);

if ($options) {
  $options._res = { headers: { "profile-update-interval": 6 } };
}
