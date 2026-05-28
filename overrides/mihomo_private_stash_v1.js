{
  "dns": {
    "enable": true,
    "ipv6": false,
    "listen": "0.0.0.0:1053",
    "enhanced-mode": "redir-host",
    "nameserver": [
      "223.5.5.5",
      "119.29.29.29"
    ],
    "fallback": [
      "https://1.1.1.1/dns-query",
      "https://8.8.8.8/dns-query"
    ],
    "fallback-filter": {
      "geoip": true,
      "geoip-code": "CN"
    }
  },
  "proxy-groups": [
    {
      "name": "NETWORK",
      "type": "select",
      "proxies": [
        "HK",
        "DIRECT",
        "SG",
        "TW",
        "JP",
        "US"
      ]
    },
    {
      "name": "US",
      "type": "select",
      "include-all": true,
      "filter": "(?i)(\\bUS\\b|USA|United\\s*States|美国|洛杉矶|圣何塞|西雅图|达拉斯|纽约|c87s1|c87s2|c87s3|US\\d+)"
    },
    {
      "name": "JP",
      "type": "select",
      "include-all": true,
      "filter": "(?i)(\\bJP\\b|Japan|日本|东京|大阪|埼玉|c87s4|JP\\d+)"
    },
    {
      "name": "HK",
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\bHK\\b|Hong\\s*Kong|香港|HK\\d+)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 600,
      "tolerance": 100,
      "lazy": true
    },
    {
      "name": "SG",
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\bSG\\b|Singapore|新加坡|SG\\d+)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 600,
      "tolerance": 100,
      "lazy": true
    },
    {
      "name": "TW",
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\bTW\\b|Taiwan|台湾|台北|TW\\d+)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 600,
      "tolerance": 100,
      "lazy": true
    }
  ],
  "rule-providers": {
    "openai": {
      "type": "http",
      "behavior": "domain",
      "format": "yaml",
      "url": "https://raw.githubusercontent.com/arronnrock/clash-rules/main/rule-providers/openai.yaml",
      "path": "./rule-providers/openai.yaml",
      "interval": 86400
    },
    "apple_ai": {
      "type": "http",
      "behavior": "domain",
      "format": "yaml",
      "url": "https://raw.githubusercontent.com/arronnrock/clash-rules/main/rule-providers/apple_ai.yaml",
      "path": "./rule-providers/apple_ai.yaml",
      "interval": 86400
    },
    "apple_media": {
      "type": "http",
      "behavior": "domain",
      "format": "yaml",
      "url": "https://raw.githubusercontent.com/arronnrock/clash-rules/main/rule-providers/apple_media.yaml",
      "path": "./rule-providers/apple_media.yaml",
      "interval": 86400
    },
    "gemini": {
      "type": "http",
      "behavior": "domain",
      "format": "yaml",
      "url": "https://raw.githubusercontent.com/arronnrock/clash-rules/main/rule-providers/gemini.yaml",
      "path": "./rule-providers/gemini.yaml",
      "interval": 86400
    },
    "google": {
      "type": "http",
      "behavior": "domain",
      "format": "yaml",
      "url": "https://raw.githubusercontent.com/arronnrock/clash-rules/main/rule-providers/google.yaml",
      "path": "./rule-providers/google.yaml",
      "interval": 86400
    },
    "telegram": {
      "type": "http",
      "behavior": "domain",
      "format": "yaml",
      "url": "https://raw.githubusercontent.com/arronnrock/clash-rules/main/rule-providers/telegram.yaml",
      "path": "./rule-providers/telegram.yaml",
      "interval": 86400
    },
    "whatsapp": {
      "type": "http",
      "behavior": "domain",
      "format": "yaml",
      "url": "https://raw.githubusercontent.com/arronnrock/clash-rules/main/rule-providers/whatsapp.yaml",
      "path": "./rule-providers/whatsapp.yaml",
      "interval": 86400
    },
    "paypal": {
      "type": "http",
      "behavior": "domain",
      "format": "yaml",
      "url": "https://raw.githubusercontent.com/arronnrock/clash-rules/main/rule-providers/paypal.yaml",
      "path": "./rule-providers/paypal.yaml",
      "interval": 86400
    },
    "youtube": {
      "type": "http",
      "behavior": "domain",
      "format": "yaml",
      "url": "https://raw.githubusercontent.com/arronnrock/clash-rules/main/rule-providers/youtube.yaml",
      "path": "./rule-providers/youtube.yaml",
      "interval": 86400
    },
    "nsfw": {
      "type": "http",
      "behavior": "domain",
      "format": "yaml",
      "url": "https://raw.githubusercontent.com/arronnrock/clash-rules/main/rule-providers/nsfw.yaml",
      "path": "./rule-providers/nsfw.yaml",
      "interval": 86400
    }
  },
  "rules": [
    "IP-CIDR,10.0.0.0/8,DIRECT,no-resolve",
    "IP-CIDR,172.16.0.0/12,DIRECT,no-resolve",
    "IP-CIDR,192.168.0.0/16,DIRECT,no-resolve",
    "RULE-SET,apple_ai,US",
    "DOMAIN-SUFFIX,chatgpt.com,US",
    "DOMAIN-SUFFIX,ws.chatgpt.com,US",
    "DOMAIN-SUFFIX,openai.com,US",
    "DOMAIN-SUFFIX,ios.chat.openai.com,US",
    "DOMAIN-SUFFIX,oaistatic.com,US",
    "DOMAIN-SUFFIX,oaiusercontent.com,US",
    "DOMAIN-SUFFIX,cdn.openai.com,US",
    "DOMAIN-SUFFIX,files.openai.com,US",
    "RULE-SET,openai,US",
    "RULE-SET,apple_media,US",
    "DOMAIN-SUFFIX,connectivitycheck.gstatic.com,NETWORK",
    "DOMAIN-SUFFIX,gstatic.com,NETWORK",
    "DOMAIN-SUFFIX,googleapis.com,NETWORK",
    "DOMAIN-SUFFIX,gemini.google.com,NETWORK",
    "DOMAIN-SUFFIX,bard.google.com,NETWORK",
    "DOMAIN-SUFFIX,generativelanguage.googleapis.com,NETWORK",
    "DOMAIN-SUFFIX,proactivebackend-pa.googleapis.com,NETWORK",
    "DOMAIN-SUFFIX,ai.google.dev,NETWORK",
    "RULE-SET,gemini,NETWORK",
    "RULE-SET,google,NETWORK",
    "DOMAIN-SUFFIX,api.telegram.org,NETWORK",
    "IP-CIDR,91.108.0.0/16,NETWORK,no-resolve",
    "IP-CIDR,149.154.160.0/20,NETWORK,no-resolve",
    "RULE-SET,telegram,NETWORK",
    "RULE-SET,whatsapp,NETWORK",
    "RULE-SET,youtube,NETWORK",
    "RULE-SET,paypal,US",
    "RULE-SET,nsfw,NETWORK",
    "GEOIP,CN,DIRECT",
    "MATCH,NETWORK"
  ]
}
