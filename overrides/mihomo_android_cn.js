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
      "+.szridge.com": [
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
      "name": "🚀 PROXY",
      "type": "select",
      "proxies": [
        "🇭🇰 HK",
        "🇺🇸 US",
        "🇯🇵 JP",
        "🎯 DIRECT"
      ]
    },
    {
      "name": "🇺🇸 US",
      "type": "select",
      "include-all": true,
      "filter": "(?i)(\\bUS\\b|USA|United\\s*States|美国|洛杉矶|圣何塞|西雅图|达拉斯|纽约|Hawaiian|Leaseweb|Misaka|星链|c87s1|c87s2|c87s3|🇺🇸US\\d+|US\\d+)"
    },
    {
      "name": "🇭🇰 HK",
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\bHK\\b|Hong\\s*Kong|香港|HKBN|家宽|BGP|🇭🇰HK\\d+|HK\\d+)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 600,
      "tolerance": 100,
      "lazy": true
    },
    {
      "name": "🇯🇵 JP",
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\bJP\\b|Japan|日本|东京|大阪|埼玉|樱花|biglobe|c87s4|🇯🇵JP\\d+|JP\\d+)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 600,
      "tolerance": 100,
      "lazy": true
    },
    {
      "name": "🎯 DIRECT",
      "type": "select",
      "proxies": [
        "DIRECT"
      ]
    },
    {
      "name": "🐟 FINAL",
      "type": "select",
      "proxies": [
        "🇭🇰 HK",
        "🚀 PROXY",
        "🇺🇸 US",
        "🇯🇵 JP",
        "🎯 DIRECT"
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
    "DOMAIN,e.szridge.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,szridge.com,🎯 DIRECT",
    "IP-CIDR,10.0.0.0/8,🎯 DIRECT,no-resolve",
    "IP-CIDR,100.64.0.0/10,🎯 DIRECT,no-resolve",
    "IP-CIDR,127.0.0.0/8,🎯 DIRECT,no-resolve",
    "IP-CIDR,169.254.0.0/16,🎯 DIRECT,no-resolve",
    "IP-CIDR,172.16.0.0/12,🎯 DIRECT,no-resolve",
    "IP-CIDR,192.168.0.0/16,🎯 DIRECT,no-resolve",

    "DOMAIN-SUFFIX,msftconnecttest.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,msftncsi.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,connectivitycheck.platform.hicloud.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,g.cn,🎯 DIRECT",
    "DOMAIN-SUFFIX,miui.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,vivo.com,🎯 DIRECT",

    "DOMAIN-SUFFIX,heytap.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,heytapmobi.com,🎯 DIRECT",
    "DOMAIN,push.heytapmobi.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,oppo.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,oppomobile.com,🎯 DIRECT",
    "DOMAIN,conn1.oppomobile.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,coloros.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,opposhop.cn,🎯 DIRECT",
    "DOMAIN-SUFFIX,oppo.cn,🎯 DIRECT",

    "DOMAIN-SUFFIX,qq.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,gtimg.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,qpic.cn,🎯 DIRECT",
    "DOMAIN-SUFFIX,qlogo.cn,🎯 DIRECT",
    "DOMAIN,weixin.qq.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,wechat.com,🎯 DIRECT",
    "DOMAIN,wx.qq.com,🎯 DIRECT",
    "DOMAIN,work.weixin.qq.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,wecom.work,🎯 DIRECT",

    "DOMAIN-SUFFIX,alipay.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,alipayobjects.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,aliyun.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,taobao.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,tmall.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,amap.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,autonav.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,unionpay.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,chinaums.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,baidu.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,bdstatic.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,bilibili.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,jd.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,meituan.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,dianping.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,douyin.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,snssdk.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,toutiao.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,xiaohongshu.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,smzdm.com,🎯 DIRECT",
    "DOMAIN-SUFFIX,10jqka.com.cn,🎯 DIRECT",
    "DOMAIN-SUFFIX,eastmoney.com,🎯 DIRECT",
    "GEOSITE,cn,🎯 DIRECT",
    "GEOIP,CN,🎯 DIRECT",

    "RULE-SET,apple_ai,🇺🇸 US",
    "DOMAIN-SUFFIX,openai.com,🇺🇸 US",
    "DOMAIN-SUFFIX,chatgpt.com,🇺🇸 US",
    "DOMAIN-SUFFIX,oaistatic.com,🇺🇸 US",
    "DOMAIN-SUFFIX,oaiusercontent.com,🇺🇸 US",
    "DOMAIN,auth0.openai.com,🇺🇸 US",
    "DOMAIN-SUFFIX,auth.openai.com,🇺🇸 US",
    "DOMAIN-SUFFIX,chat.openai.com,🇺🇸 US",
    "DOMAIN-SUFFIX,api.openai.com,🇺🇸 US",
    "DOMAIN-SUFFIX,files.openai.com,🇺🇸 US",
    "DOMAIN-SUFFIX,cdn.openai.com,🇺🇸 US",
    "RULE-SET,openai,🇺🇸 US",

    "DOMAIN-SUFFIX,anthropic.com,🇺🇸 US",
    "DOMAIN-SUFFIX,claude.ai,🇺🇸 US",

    "DOMAIN,gemini.google.com,🇺🇸 US",
    "DOMAIN,ai.google.dev,🇺🇸 US",
    "DOMAIN,generativelanguage.googleapis.com,🇺🇸 US",
    "DOMAIN,aistudio.google.com,🇺🇸 US",
    "RULE-SET,gemini,🇺🇸 US",

    "DOMAIN-SUFFIX,paypal.com,🇺🇸 US",
    "DOMAIN-SUFFIX,paypalobjects.com,🇺🇸 US",
    "RULE-SET,paypal,🇺🇸 US",

    "DOMAIN-SUFFIX,github.com,🚀 PROXY",
    "DOMAIN-SUFFIX,githubusercontent.com,🚀 PROXY",
    "DOMAIN-SUFFIX,telegram.org,🚀 PROXY",
    "DOMAIN-SUFFIX,t.me,🚀 PROXY",
    "DOMAIN-SUFFIX,youtube.com,🚀 PROXY",
    "DOMAIN-SUFFIX,googlevideo.com,🚀 PROXY",
    "DOMAIN-SUFFIX,x.com,🚀 PROXY",
    "DOMAIN-SUFFIX,twitter.com,🚀 PROXY",
    "DOMAIN-SUFFIX,reddit.com,🚀 PROXY",
    "RULE-SET,apple_media,🚀 PROXY",
    "RULE-SET,google,🚀 PROXY",
    "RULE-SET,telegram,🚀 PROXY",
    "RULE-SET,youtube,🚀 PROXY",
    "RULE-SET,nsfw,🚀 PROXY",

    "MATCH,🐟 FINAL"
  ]
}
