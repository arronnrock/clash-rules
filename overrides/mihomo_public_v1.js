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
        "US",
        "JP",
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
      "filter": "(?i)(c87s1|c87s2|c87s3)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 300,
      "tolerance": 100
    },

    {
      "name": "JP",
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(c87s4)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 300,
      "tolerance": 100
    },

    {
      "name": "JMS-US-PIN",
      "type": "select",
      "include-all": true,
      "filter": "(?i)(c87s1|c87s2|c87s3)",
      "proxies": [
        "DIRECT"
      ]
    },

    {
      "name": "JMS-JP-PIN",
      "type": "select",
      "include-all": true,
      "filter": "(?i)(c87s4)",
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
        "PROXY",
        "DIRECT"
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
    }
  },

  "rules": [
    "RULE-SET,apple_ai,US-STRICT",
    "RULE-SET,openai,AI",
    "RULE-SET,apple_media,US-STRICT",
    "RULE-SET,gemini,AI",
    "RULE-SET,google,GOOGLE",
    "GEOIP,CN,DIRECT",
    "MATCH,PROXY"
  ]
}
