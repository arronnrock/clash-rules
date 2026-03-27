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
      "proxies": ["DIRECT"]
    },

    {
      "name": "🇯🇵JP-PIN",
      "type": "select",
      "include-all": true,
      "filter": "(?i)(c87s4|🇯🇵JP\\d+|JP\\d+)",
      "proxies": ["DIRECT"]
    },

    {
      "name": "US-STRICT",
      "type": "select",
      "proxies": ["🇺🇸US-PIN", "🇺🇸US", "DIRECT"]
    },

    {
      "name": "APPLE-AI",
      "type": "select",
      "proxies": ["🇺🇸US-PIN", "🇺🇸US", "🇯🇵JP"]
    },

    {
      "name": "OPENAI",
      "type": "select",
      "proxies": ["🇺🇸US-PIN", "🇯🇵JP-PIN", "🇺🇸US", "🇯🇵JP"]
    },

    {
      "name": "AI",
      "type": "select",
      "proxies": ["🇺🇸US-PIN", "🇯🇵JP-PIN", "🇺🇸US", "🇯🇵JP", "PROXY", "DIRECT"]
    },

    {
      "name": "GOOGLE",
      "type": "select",
      "proxies": ["🇺🇸US-PIN", "🇺🇸US", "🇯🇵JP", "🇭🇰HK", "🇸🇬SG"]
    }
  ]
}
