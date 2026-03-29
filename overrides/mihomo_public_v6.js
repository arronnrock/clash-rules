{
  "dns": {
    "enable": true,
    "ipv6": false,
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
      "name": "PROXY",
      "type": "select",
      "proxies": [
        "Auto",
        "🇺🇸US",
        "🇯🇵JP",
        "🇭🇰HK",
        "🇸🇬SG",
        "🇲🇾MY",
        "🇰🇷KR",
        "🇦🇺AU",
        "🇩🇪DE",
        "🇬🇧UK",
        "🇳🇱NL",
        "🇹🇷TR",
        "🇨🇳TW",
        "DIRECT"
      ]
    },
    {
      "name": "Auto",
      "type": "url-test",
      "include-all": true,
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 300,
      "tolerance": 80
    },
    {
      "name": "🇺🇸US",
      "type": "select",
      "include-all": true,
      "filter": "(?i)(\\bUS\\b|USA|United\\s*States|美国|洛杉矶|圣何塞|西雅图|达拉斯|纽约|c87s1|c87s2|c87s3|🇺🇸US\\d+|US\\d+)",
      "proxies": [
        "DIRECT"
      ]
    },
    {
      "name": "🇯🇵JP",
      "type": "select",
      "include-all": true,
      "filter": "(?i)(\\bJP\\b|Japan|日本|东京|大阪|埼玉|c87s4|🇯🇵JP\\d+|JP\\d+)",
      "proxies": [
        "DIRECT"
      ]
    },
    {
      "name": "🇭🇰HK",
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\bHK\\b|Hong\\s*Kong|香港|🇭🇰HK\\d+|HK\\d+)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 300,
      "tolerance": 100
    },
    {
      "name": "🇸🇬SG",
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\bSG\\b|Singapore|新加坡|🇸🇬SG\\d+|SG\\d+)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 300,
      "tolerance": 100
    },
    {
      "name": "🇲🇾MY",
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\bMY\\b|Malaysia|马来西亚|🇲🇾MY\\d+|MY\\d+)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 300,
      "tolerance": 100
    },
    {
      "name": "🇰🇷KR",
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\bKR\\b|Korea|韩国|首尔|🇰🇷KR\\d+|KR\\d+)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 300,
      "tolerance": 100
    },
    {
      "name": "🇦🇺AU",
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\bAU\\b|Australia|澳大利亚|悉尼|🇦🇺AU\\d+|AU\\d+)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 300,
      "tolerance": 100
    },
    {
      "name": "🇩🇪DE",
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\bDE\\b|Germany|德国|法兰克福|🇩🇪DE\\d+|DE\\d+)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 300,
      "tolerance": 100
    },
    {
      "name": "🇬🇧UK",
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\bUK\\b|United\\s*Kingdom|Britain|英国|伦敦|🇬🇧UK\\d+|UK\\d+)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 300,
      "tolerance": 100
    },
    {
      "name": "🇳🇱NL",
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\bNL\\b|Netherlands|荷兰|阿姆斯特丹|🇳🇱NL\\d+|NL\\d+)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 300,
      "tolerance": 100
    },
    {
      "name": "🇹🇷TR",
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\bTR\\b|Turkey|土耳其|伊斯坦布尔|🇹🇷TR\\d+|TR\\d+)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 300,
      "tolerance": 100
    },
    {
      "name": "🇨🇳TW",
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\bTW\\b|Taiwan|台湾|台北|🇨🇳TW\\d+|TW\\d+)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 300,
      "tolerance": 100
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
    }
  },
  "rules": [
    "DOMAIN,e.szridge.com,DIRECT",
    "DOMAIN-SUFFIX,szridge.com,DIRECT",
    "IP-CIDR,10.0.0.0/8,DIRECT,no-resolve",
    "IP-CIDR,172.16.0.0/12,DIRECT,no-resolve",
    "IP-CIDR,192.168.0.0/16,DIRECT,no-resolve",

    "DOMAIN-SUFFIX,chatgpt.com,PROXY",
    "DOMAIN-SUFFIX,ws.chatgpt.com,PROXY",
    "DOMAIN-SUFFIX,openai.com,PROXY",
    "DOMAIN-SUFFIX,ios.chat.openai.com,PROXY",
    "DOMAIN-SUFFIX,oaistatic.com,PROXY",
    "DOMAIN-SUFFIX,oaiusercontent.com,PROXY",
    "DOMAIN-SUFFIX,cdn.openai.com,PROXY",
    "DOMAIN-SUFFIX,files.openai.com,PROXY",
    "RULE-SET,openai,PROXY",

    "DOMAIN-SUFFIX,connectivitycheck.gstatic.com,PROXY",
    "DOMAIN-SUFFIX,gstatic.com,PROXY",
    "DOMAIN-SUFFIX,googleapis.com,PROXY",
    "DOMAIN-SUFFIX,gemini.google.com,PROXY",
    "DOMAIN-SUFFIX,bard.google.com,PROXY",
    "DOMAIN-SUFFIX,generativelanguage.googleapis.com,PROXY",
    "DOMAIN-SUFFIX,proactivebackend-pa.googleapis.com,PROXY",
    "DOMAIN-SUFFIX,ai.google.dev,PROXY",
    "RULE-SET,gemini,PROXY",
    "RULE-SET,google,PROXY",

    "DOMAIN-SUFFIX,api.telegram.org,PROXY",
    "IP-CIDR,91.108.0.0/16,PROXY,no-resolve",
    "IP-CIDR,149.154.160.0/20,PROXY,no-resolve",
    "RULE-SET,telegram,PROXY",

    "RULE-SET,whatsapp,PROXY",

    "GEOIP,CN,DIRECT",
    "MATCH,PROXY"
  ]
}