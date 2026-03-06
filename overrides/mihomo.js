{
  "proxy-groups": [
    {
      "name": "PROXY",
      "type": "select",
      "proxies": [
        "Auto",
        "US",
        "JP",
        "HK",
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
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\bUS\\b|USA|United\\s*States|美国|洛杉矶|圣何塞|西雅图|达拉斯|纽约|s1|s2|s3)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 300,
      "tolerance": 100
    },
    {
      "name": "JP",
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\bJP\\b|Japan|日本|东京|大阪|埼玉|s4)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 300,
      "tolerance": 100
    },
    {
      "name": "HK",
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\bHK\\b|Hong\\s*Kong|香港)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 300,
      "tolerance": 100
    },
    {
      "name": "SG",
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\bSG\\b|Singapore|新加坡)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 300,
      "tolerance": 100
    },
    {
      "name": "JMS-US-PIN",
      "type": "select",
      "include-all": true,
      "filter": "(?i)(\\bs1\\b|\\bs2\\b|\\bs3\\b)",
      "proxies": [
        "DIRECT"
      ]
    },
    {
      "name": "JMS-JP-PIN",
      "type": "select",
      "include-all": true,
      "filter": "(?i)(\\bs4\\b)",
      "proxies": [
        "DIRECT"
      ]
    },
    {
      "name": "US-STRICT",
      "type": "select",
      "proxies": [
        "JMS-US-PIN",
        "US",
        "DIRECT"
      ]
    },
    {
      "name": "AI",
      "type": "select",
      "proxies": [
        "JMS-US-PIN",
        "JMS-JP-PIN",
        "US",
        "JP",
        "PROXY",
        "DIRECT"
      ]
    },
    {
      "name": "GOOGLE",
      "type": "select",
      "proxies": [
        "US",
        "JP",
        "HK",
        "PROXY",
        "DIRECT"
      ]
    },
    {
      "name": "STREAM",
      "type": "url-test",
      "proxies": [
        "HK",
        "SG",
        "US",
        "JP",
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
        "US",
        "HK",
        "JP",
        "PROXY"
      ],
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 300,
      "tolerance": 100
    },
    {
      "name": "NSFW",
      "type": "select",
      "proxies": [
        "STREAM",
        "HK",
        "SG",
        "US",
        "JP",
        "PROXY",
        "DIRECT"
      ]
    }
  ],
  "rules": [
    "DOMAIN,e.szridge.com,DIRECT",
    "DOMAIN-SUFFIX,szridge.com,DIRECT",
    "IP-CIDR,10.0.0.0/8,DIRECT,no-resolve",
    "IP-CIDR,172.16.0.0/12,DIRECT,no-resolve",
    "IP-CIDR,192.168.0.0/16,DIRECT,no-resolve",
    "RULE-SET,apple_ai,US-STRICT",
    "RULE-SET,openai,AI",
    "RULE-SET,apple_media,US-STRICT",
    "RULE-SET,gemini,AI",
    "RULE-SET,google,GOOGLE",
    "RULE-SET,youtube,YouTube",
    "RULE-SET,im,STREAM",
    "RULE-SET,paypal,US-STRICT",
    "RULE-SET,nsfw,NSFW",
    "GEOIP,CN,DIRECT",
    "MATCH,PROXY"
  ]
}
