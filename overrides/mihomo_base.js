function main(config) {
  const RULE_BASE =
    "https://raw.githubusercontent.com/arronnrock/clash-rules/main/rule-providers";

  const out = {};

  // 保留订阅里已经生成的节点来源
  if (config["proxy-providers"]) out["proxy-providers"] = config["proxy-providers"];
  if (config["proxies"]) out["proxies"] = config["proxies"];

  out["mixed-port"] = 7890;
  out["allow-lan"] = true;
  out["mode"] = "rule";
  out["log-level"] = "info";
  out["external-controller"] = ":9090";

  out["dns"] = {
    enable: true,
    ipv6: false,
    listen: "0.0.0.0:1053",
    "enhanced-mode": "redir-host",
    nameserver: ["223.5.5.5", "119.29.29.29"],
    "nameserver-policy": {
      "e.szridge.com": ["10.0.0.1", "10.0.0.200"],
      "*.szridge.com": ["10.0.0.1", "10.0.0.200"]
    }
  };

  out["proxy-groups"] = [
    {
      name: "PROXY",
      type: "select",
      proxies: ["Auto", "US", "US-PIN", "HK", "JP", "SG", "DIRECT"]
    },
    {
      name: "Auto",
      type: "url-test",
      "include-all": true,
      url: "https://cp.cloudflare.com/generate_204",
      interval: 300,
      tolerance: 80
    },
    {
      name: "US",
      type: "url-test",
      "include-all": true,
      filter:
        "(?i)(\\bUS\\b|USA|United\\s*States|美国|洛杉矶|圣何塞|西雅图|达拉斯|纽约|c87s(1|2|3))",
      url: "https://cp.cloudflare.com/generate_204",
      interval: 300,
      tolerance: 80
    },
    {
      name: "US-PIN",
      type: "select",
      "include-all": true,
      filter:
        "(?i)(@c87s(1|2|3)\\b|\\bUS\\b|USA|United\\s*States|美国|洛杉矶|圣何塞|西雅图|达拉斯|纽约)",
      proxies: ["DIRECT"]
    },
    {
      name: "HK",
      type: "url-test",
      "include-all": true,
      filter: "(?i)(\\bHK\\b|Hong\\s*Kong|香港)",
      url: "https://cp.cloudflare.com/generate_204",
      interval: 300,
      tolerance: 150
    },
    {
      name: "JP",
      type: "url-test",
      "include-all": true,
      filter: "(?i)(\\bJP\\b|Japan|日本|东京|大阪|埼玉|c87s4)",
      url: "https://cp.cloudflare.com/generate_204",
      interval: 300,
      tolerance: 150
    },
    {
      name: "SG",
      type: "url-test",
      "include-all": true,
      filter: "(?i)(\\bSG\\b|Singapore|新加坡)",
      url: "https://cp.cloudflare.com/generate_204",
      interval: 300,
      tolerance: 150
    },
    {
      name: "AppleAI",
      type: "select",
      proxies: ["US-PIN", "US", "PROXY", "DIRECT"]
    },
    {
      name: "OpenAI",
      type: "select",
      proxies: ["US-PIN", "US", "PROXY", "DIRECT"]
    },
    {
      name: "AppleMedia",
      type: "select",
      proxies: ["US-PIN", "US", "PROXY", "DIRECT"]
    },
    {
      name: "Gemini",
      type: "select",
      proxies: ["US-PIN", "US", "PROXY", "DIRECT"]
    },
    {
      name: "Google",
      type: "select",
      proxies: ["US-PIN", "US", "HK", "JP", "PROXY", "DIRECT"]
    },
    {
      name: "YouTube",
      type: "select",
      proxies: ["US-PIN", "US", "HK", "PROXY", "DIRECT"]
    },
    {
      name: "IM",
      type: "select",
      proxies: ["HK", "SG", "US", "PROXY", "DIRECT"]
    },
    {
      name: "PayPal",
      type: "select",
      proxies: ["US-PIN", "US", "PROXY", "DIRECT"]
    },
    {
      name: "NSFW",
      type: "select",
      proxies: ["HK", "SG", "US", "US-PIN", "PROXY", "DIRECT"]
    }
  ];

  out["rule-providers"] = {
    openai: {
      type: "http",
      behavior: "domain",
      format: "yaml",
      url: `${RULE_BASE}/openai.yaml`,
      path: "./rule-providers/openai.yaml",
      interval: 86400
    },
    apple_ai: {
      type: "http",
      behavior: "domain",
      format: "yaml",
      url: `${RULE_BASE}/apple_ai.yaml`,
      path: "./rule-providers/apple_ai.yaml",
      interval: 86400
    },
    apple_media: {
      type: "http",
      behavior: "domain",
      format: "yaml",
      url: `${RULE_BASE}/apple_media.yaml`,
      path: "./rule-providers/apple_media.yaml",
      interval: 86400
    },
    gemini: {
      type: "http",
      behavior: "domain",
      format: "yaml",
      url: `${RULE_BASE}/gemini.yaml`,
      path: "./rule-providers/gemini.yaml",
      interval: 86400
    },
    google: {
      type: "http",
      behavior: "domain",
      format: "yaml",
      url: `${RULE_BASE}/google.yaml`,
      path: "./rule-providers/google.yaml",
      interval: 86400
    },
    im: {
      type: "http",
      behavior: "domain",
      format: "yaml",
      url: `${RULE_BASE}/im.yaml`,
      path: "./rule-providers/im.yaml",
      interval: 86400
    },
    paypal: {
      type: "http",
      behavior: "domain",
      format: "yaml",
      url: `${RULE_BASE}/paypal.yaml`,
      path: "./rule-providers/paypal.yaml",
      interval: 86400
    },
    youtube: {
      type: "http",
      behavior: "domain",
      format: "yaml",
      url: `${RULE_BASE}/youtube.yaml`,
      path: "./rule-providers/youtube.yaml",
      interval: 86400
    },
    nsfw: {
      type: "http",
      behavior: "domain",
      format: "yaml",
      url: `${RULE_BASE}/nsfw.yaml`,
      path: "./rule-providers/nsfw.yaml",
      interval: 86400
    }
  };

  out["rules"] = [
    "DOMAIN,e.szridge.com,DIRECT",
    "DOMAIN-SUFFIX,szridge.com,DIRECT",
    "IP-CIDR,10.0.0.0/8,DIRECT,no-resolve",
    "IP-CIDR,172.16.0.0/12,DIRECT,no-resolve",
    "IP-CIDR,192.168.0.0/16,DIRECT,no-resolve",

    "RULE-SET,apple_ai,AppleAI",
    "RULE-SET,openai,OpenAI",
    "RULE-SET,apple_media,AppleMedia",
    "RULE-SET,gemini,Gemini",
    "RULE-SET,google,Google",
    "RULE-SET,youtube,YouTube",
    "RULE-SET,im,IM",
    "RULE-SET,paypal,PayPal",
    "RULE-SET,nsfw,NSFW",

    "GEOIP,CN,DIRECT",
    "MATCH,PROXY"
  ];

  return out;
}
