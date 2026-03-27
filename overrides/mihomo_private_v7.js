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
    },
    "nameserver-policy": {
      "e.szridge.com": [
        "10.0.0.1",
        "10.0.0.200"
      ],
      "*.szridge.com": [
        "10.0.0.1",
        "10.0.0.200"
      ]
    }
  },
  "proxy-groups": [
    {
      "name": "PROXY",
      "type": "select",
      "proxies": [
        "Auto",
        "🇺🇸US-PIN",
        "🇯🇵JP-PIN",
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
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\bUS\\b|USA|United\\s*States|美国|洛杉矶|圣何塞|西雅图|达拉斯|纽约|c87s1|c87s2|c87s3|🇺🇸US\\d+|US\\d+)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 300,
      "tolerance": 100
    },
    {
      "name": "🇯🇵JP",
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\bJP\\b|Japan|日本|东京|大阪|埼玉|c87s4|🇯🇵JP\\d+|JP\\d+)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 300,
      "tolerance": 100
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
    },
    {
      "name": "🇺🇸US-PIN",
      "type": "select",
      "include-all": true,
      "filter": "(?i)(c87s1|c87s2|c87s3|🇺🇸US\\d+|US\\d+)",
      "proxies": [
        "DIRECT"
      ]
    },
    {
      "name": "🇯🇵JP-PIN",
      "type": "select",
      "include-all": true,
      "filter": "(?i)(c87s4|🇯🇵JP\\d+|JP\\d+)",
      "proxies": [
        "DIRECT"
      ]
    },
    {
      "name": "US-STRICT",
      "type": "select",
      "proxies": [
        "🇺🇸US-PIN",
        "🇺🇸US",
        "DIRECT"
      ]
    },
    {
      "name": "APPLE-AI",
      "type": "select",
      "proxies": [
        "🇺🇸US-PIN",
        "🇺🇸US",
        "🇯🇵JP"
      ]
    },
    {
      "name": "OPENAI",
      "type": "select",
      "proxies": [
        "🇺🇸US-PIN",
        "🇯🇵JP-PIN",
        "🇺🇸US",
        "🇯🇵JP"
      ]
    },
    {
      "name": "AI",
      "type": "select",
      "proxies": [
        "🇺🇸US-PIN",
        "🇯🇵JP-PIN",
        "🇺🇸US",
        "🇯🇵JP",
        "PROXY",
        "DIRECT"
      ]
    },
    {
      "name": "GOOGLE",
      "type": "select",
      "proxies": [
        "🇺🇸US-PIN",
        "🇺🇸US",
        "🇯🇵JP",
        "🇭🇰HK",
        "🇸🇬SG"
      ]
    },
    {
      "name": "STREAM",
      "type": "url-test",
      "proxies": [
        "🇭🇰HK",
        "🇸🇬SG",
        "🇺🇸US",
        "🇯🇵JP",
        "PROXY"
      ],
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 300,
      "tolerance": 100
    },
    {
      "name": "YouTube",
      "type": "url-test",
      "proxies": [
        "🇺🇸US",
        "🇭🇰HK",
        "🇯🇵JP",
        "PROXY"
      ],
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 300,
      "tolerance": 100
    },
    {
      "name": "TELEGRAM",
      "type": "select",
      "proxies": [
        "🇭🇰HK",
        "🇸🇬SG",
        "🇨🇳TW",
        "🇰🇷KR",
        "🇯🇵JP",
        "🇺🇸US",
        "🇺🇸US-PIN",
        "🇯🇵JP-PIN"
      ]
    },
    {
      "name": "TG-API",
      "type": "select",
      "proxies": [
        "🇭🇰HK",
        "🇸🇬SG",
        "🇯🇵JP-PIN",
        "🇺🇸US-PIN",
        "🇯🇵JP",
        "🇺🇸US"
      ]
    },
    {
      "name": "WHATSAPP",
      "type": "url-test",
      "proxies": [
        "🇭🇰HK",
        "🇸🇬SG",
        "🇯🇵JP",
        "🇺🇸US",
        "🇲🇾MY",
        "🇰🇷KR",
        "🇨🇳TW"
      ],
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 240,
      "tolerance": 80
    },
    {
      "name": "NSFW",
      "type": "select",
      "proxies": [
        "STREAM",
        "🇭🇰HK",
        "🇸🇬SG",
        "🇺🇸US",
        "🇯🇵JP",
        "PROXY"
      ]
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
    "DOMAIN,e.szridge.com,DIRECT",
    "DOMAIN-SUFFIX,szridge.com,DIRECT",
    "IP-CIDR,10.0.0.0/8,DIRECT,no-resolve",
    "IP-CIDR,172.16.0.0/12,DIRECT,no-resolve",
    "IP-CIDR,192.168.0.0/16,DIRECT,no-resolve",

    "RULE-SET,apple_ai,APPLE-AI",

    "DOMAIN-SUFFIX,chatgpt.com,OPENAI",
    "DOMAIN-SUFFIX,ws.chatgpt.com,OPENAI",
    "DOMAIN-SUFFIX,openai.com,OPENAI",
    "DOMAIN-SUFFIX,ios.chat.openai.com,OPENAI",
    "DOMAIN-SUFFIX,oaistatic.com,OPENAI",
    "DOMAIN-SUFFIX,oaiusercontent.com,OPENAI",
    "DOMAIN-SUFFIX,cdn.openai.com,OPENAI",
    "DOMAIN-SUFFIX,files.openai.com,OPENAI",
    "RULE-SET,openai,OPENAI",

    "RULE-SET,apple_media,US-STRICT",

    "DOMAIN-SUFFIX,connectivitycheck.gstatic.com,GOOGLE",
    "DOMAIN-SUFFIX,gstatic.com,GOOGLE",
    "DOMAIN-SUFFIX,googleapis.com,GOOGLE",
    "DOMAIN-SUFFIX,gemini.google.com,GOOGLE",
    "DOMAIN-SUFFIX,bard.google.com,GOOGLE",
    "DOMAIN-SUFFIX,generativelanguage.googleapis.com,GOOGLE",
    "DOMAIN-SUFFIX,proactivebackend-pa.googleapis.com,GOOGLE",
    "DOMAIN-SUFFIX,ai.google.dev,GOOGLE",
    "RULE-SET,gemini,GOOGLE",
    "RULE-SET,google,GOOGLE",

    "DOMAIN-SUFFIX,api.telegram.org,TG-API",
    "IP-CIDR,91.108.0.0/16,TELEGRAM,no-resolve",
    "IP-CIDR,149.154.160.0/20,TELEGRAM,no-resolve",
    "RULE-SET,telegram,TELEGRAM",

    "RULE-SET,whatsapp,WHATSAPP",

    "RULE-SET,youtube,YouTube",
    "RULE-SET,paypal,US-STRICT",
    "RULE-SET,nsfw,NSFW",
    "GEOIP,CN,DIRECT",
    "MATCH,PROXY"
  ]
}
