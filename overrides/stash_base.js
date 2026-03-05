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
    "nameserver-policy": {
      "e.szridge.com": "10.0.0.1",
      "*.szridge.com": "10.0.0.1"
    }
  },
  "proxy-groups": [
    {
      "name": "PROXY",
      "type": "select",
      "proxies": [
        "Auto",
        "US",
        "US-PIN",
        "HK",
        "JP",
        "SG",
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
      "name": "US",
      "type": "select",
      "include-all": true,
      "filter": "(?i)(\\\\bUS\\\\b|USA|United\\\\s*States|美国|洛杉矶|圣何塞|西雅图|达拉斯|纽约|c87s(1|2|3))",
      "proxies": [
        "DIRECT"
      ]
    },
    {
      "name": "US-PIN",
      "type": "select",
      "include-all": true,
      "filter": "(?i)(@c87s(1|2|3)\\\\b|\\\\bUS\\\\b|USA|United\\\\s*States|美国|洛杉矶|圣何塞|西雅图|达拉斯|纽约)",
      "proxies": [
        "DIRECT"
      ]
    },
    {
      "name": "HK",
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\\\bHK\\\\b|Hong\\\\s*Kong|香港)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 300,
      "tolerance": 150
    },
    {
      "name": "JP",
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\\\bJP\\\\b|Japan|日本|东京|大阪|埼玉|c87s4)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 300,
      "tolerance": 150
    },
    {
      "name": "SG",
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\\\bSG\\\\b|Singapore|新加坡)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 300,
      "tolerance": 150
    },
    {
      "name": "AppleAI",
      "type": "select",
      "proxies": [
        "US-PIN",
        "US",
        "PROXY",
        "DIRECT"
      ]
    },
    {
      "name": "OpenAI",
      "type": "select",
      "proxies": [
        "US-PIN",
        "US",
        "PROXY",
        "DIRECT"
      ]
    },
    {
      "name": "AppleMedia",
      "type": "select",
      "proxies": [
        "US-PIN",
        "US",
        "PROXY",
        "DIRECT"
      ]
    },
    {
      "name": "Gemini",
      "type": "select",
      "proxies": [
        "US-PIN",
        "US",
        "PROXY",
        "DIRECT"
      ]
    },
    {
      "name": "Google",
      "type": "select",
      "proxies": [
        "US-PIN",
        "US",
        "HK",
        "JP",
        "PROXY",
        "DIRECT"
      ]
    },
    {
      "name": "YouTube",
      "type": "select",
      "proxies": [
        "US-PIN",
        "US",
        "HK",
        "PROXY",
        "DIRECT"
      ]
    },
    {
      "name": "IM",
      "type": "select",
      "proxies": [
        "HK",
        "SG",
        "US",
        "PROXY",
        "DIRECT"
      ]
    },
    {
      "name": "PayPal",
      "type": "select",
      "proxies": [
        "US-PIN",
        "US",
        "PROXY",
        "DIRECT"
      ]
    },
    {
      "name": "NSFW",
      "type": "select",
      "proxies": [
        "HK",
        "SG",
        "US",
        "US-PIN",
        "PROXY",
        "DIRECT"
      ]
    },
    {
      "name": "SubStore",
      "type": "select",
      "proxies": [
        "DIRECT",
        "PROXY"
      ]
    }
  ]
}
