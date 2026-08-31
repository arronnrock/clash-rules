{
  "dns": {
    "enable": true,
    "ipv6": false,
    "listen": "0.0.0.0:1053",
    "enhanced-mode": "redir-host",
    "prefer-h3": false,
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
      "+.openai.com": "https://1.1.1.1/dns-query#AI-REGION",
      "+.chatgpt.com": "https://1.1.1.1/dns-query#AI-REGION",
      "+.oaistatic.com": "https://1.1.1.1/dns-query#AI-REGION",
      "+.oaiusercontent.com": "https://1.1.1.1/dns-query#AI-REGION",
      "+.openai.azureedge.net": "https://1.1.1.1/dns-query#AI-REGION",
      "+.openaiapi-site.azureedge.net": "https://1.1.1.1/dns-query#AI-REGION"
    }
  },
  "proxy-groups": [
    {
      "name": "AI-REGION",
      "type": "select",
      "proxies": [
        "US",
        "JP",
        "SG"
      ],
      "default-selected": "US"
    },
    {
      "name": "PROXY",
      "type": "select",
      "proxies": [
        "HK",
        "US",
        "JP",
        "SG",
        "DIRECT"
      ],
      "default-selected": "HK"
    },
    {
      "name": "ACCESS",
      "type": "select",
      "proxies": [
        "PROXY",
        "DIRECT"
      ],
      "default-selected": "PROXY"
    },
    {
      "name": "US",
      "type": "select",
      "proxies": [
        "US-AUTO",
        "US-MANUAL"
      ],
      "default-selected": "US-AUTO"
    },
    {
      "name": "US-AUTO",
      "type": "fallback",
      "include-all": true,
      "filter": "(?i)(\\bUS\\b|USA|United\\s*States|美国|洛杉矶|圣何塞|西雅图|达拉斯|纽约|Hawaiian|Leaseweb|Misaka|星链|c87s1|c87s2|c87s3|🇺🇸US\\d+|US\\d+)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 300,
      "timeout": 8000,
      "lazy": true
    },
    {
      "name": "US-MANUAL",
      "type": "select",
      "include-all": true,
      "filter": "(?i)(\\bUS\\b|USA|United\\s*States|美国|洛杉矶|圣何塞|西雅图|达拉斯|纽约|Hawaiian|Leaseweb|Misaka|星链|c87s1|c87s2|c87s3|🇺🇸US\\d+|US\\d+)"
    },
    {
      "name": "HK",
      "type": "select",
      "proxies": [
        "HK-AUTO",
        "HK-MANUAL"
      ],
      "default-selected": "HK-AUTO"
    },
    {
      "name": "HK-AUTO",
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\bHK\\b|Hong\\s*Kong|香港|HKBN|家宽|BGP|🇭🇰HK\\d+|HK\\d+)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 600,
      "timeout": 8000,
      "tolerance": 100,
      "lazy": true
    },
    {
      "name": "HK-MANUAL",
      "type": "select",
      "include-all": true,
      "filter": "(?i)(\\bHK\\b|Hong\\s*Kong|香港|HKBN|家宽|BGP|🇭🇰HK\\d+|HK\\d+)"
    },
    {
      "name": "JP",
      "type": "select",
      "proxies": [
        "JP-AUTO",
        "JP-MANUAL"
      ],
      "default-selected": "JP-AUTO"
    },
    {
      "name": "JP-AUTO",
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\bJP\\b|Japan|日本|东京|大阪|埼玉|樱花|biglobe|c87s4|🇯🇵JP\\d+|JP\\d+)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 600,
      "timeout": 8000,
      "tolerance": 100,
      "lazy": true
    },
    {
      "name": "JP-MANUAL",
      "type": "select",
      "include-all": true,
      "filter": "(?i)(\\bJP\\b|Japan|日本|东京|大阪|埼玉|樱花|biglobe|c87s4|🇯🇵JP\\d+|JP\\d+)"
    },
    {
      "name": "SG",
      "type": "select",
      "proxies": [
        "SG-AUTO",
        "SG-MANUAL"
      ],
      "default-selected": "SG-AUTO"
    },
    {
      "name": "SG-AUTO",
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)(\\bSG\\b|Singapore|新加坡|🇸🇬SG\\d+|SG\\d+)",
      "url": "https://cp.cloudflare.com/generate_204",
      "interval": 600,
      "timeout": 8000,
      "tolerance": 100,
      "lazy": true
    },
    {
      "name": "SG-MANUAL",
      "type": "select",
      "include-all": true,
      "filter": "(?i)(\\bSG\\b|Singapore|新加坡|🇸🇬SG\\d+|SG\\d+)"
    },
    {
      "name": "DIRECT",
      "type": "select",
      "proxies": [
        "DIRECT"
      ]
    },
    {
      "name": "FINAL",
      "type": "select",
      "proxies": [
        "ACCESS",
        "HK",
        "PROXY",
        "US",
        "JP",
        "SG",
        "DIRECT"
      ],
      "default-selected": "ACCESS"
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
    "DOMAIN,e.szridge.com,DIRECT",
    "DOMAIN-SUFFIX,szridge.com,DIRECT",
    "IP-CIDR,10.0.0.0/8,DIRECT,no-resolve",
    "IP-CIDR,100.64.0.0/10,DIRECT,no-resolve",
    "IP-CIDR,127.0.0.0/8,DIRECT,no-resolve",
    "IP-CIDR,169.254.0.0/16,DIRECT,no-resolve",
    "IP-CIDR,172.16.0.0/12,DIRECT,no-resolve",
    "IP-CIDR,192.168.0.0/16,DIRECT,no-resolve",

    "AND,((PROCESS-NAME,com.openai.chatgpt),(NETWORK,UDP)),REJECT",
    "AND,((DOMAIN-SUFFIX,openai.com),(NETWORK,UDP)),REJECT",
    "AND,((DOMAIN-SUFFIX,chatgpt.com),(NETWORK,UDP)),REJECT",
    "AND,((DOMAIN-SUFFIX,oaistatic.com),(NETWORK,UDP)),REJECT",
    "AND,((DOMAIN-SUFFIX,oaiusercontent.com),(NETWORK,UDP)),REJECT",
    "PROCESS-NAME,com.openai.chatgpt,AI-REGION",
    "RULE-SET,apple_ai,US",
    "DOMAIN-SUFFIX,openai.com,AI-REGION",
    "DOMAIN-SUFFIX,chatgpt.com,AI-REGION",
    "DOMAIN-SUFFIX,oaistatic.com,AI-REGION",
    "DOMAIN-SUFFIX,oaiusercontent.com,AI-REGION",
    "DOMAIN-SUFFIX,openai.azureedge.net,AI-REGION",
    "DOMAIN-SUFFIX,openaiapi-site.azureedge.net,AI-REGION",
    "DOMAIN-SUFFIX,auth.openai.com,AI-REGION",
    "DOMAIN-SUFFIX,auth0.openai.com,AI-REGION",
    "DOMAIN-SUFFIX,chat.openai.com,AI-REGION",
    "DOMAIN-SUFFIX,api.openai.com,AI-REGION",
    "DOMAIN-SUFFIX,files.openai.com,AI-REGION",
    "DOMAIN-SUFFIX,cdn.openai.com,AI-REGION",
    "RULE-SET,openai,AI-REGION",

    "PROCESS-NAME,com.paypal.android.p2pmobile,US",
    "DOMAIN-SUFFIX,paypal.com,US",
    "DOMAIN-SUFFIX,paypalobjects.com,US",
    "RULE-SET,paypal,US",

    "PROCESS-NAME-WILDCARD,com.tigerbrokers.stock*,ACCESS",
    "PROCESS-NAME-WILDCARD,cn.futu.trader.*,ACCESS",
    "PROCESS-NAME-WILDCARD,global.longbridge.*.android,ACCESS",

    "DOMAIN-SUFFIX,msftconnecttest.com,DIRECT",
    "DOMAIN-SUFFIX,msftncsi.com,DIRECT",
    "DOMAIN-SUFFIX,connectivitycheck.platform.hicloud.com,DIRECT",
    "DOMAIN-SUFFIX,g.cn,DIRECT",
    "DOMAIN-SUFFIX,miui.com,DIRECT",
    "DOMAIN-SUFFIX,vivo.com,DIRECT",
    "DOMAIN-SUFFIX,heytap.com,DIRECT",
    "DOMAIN-SUFFIX,heytapmobi.com,DIRECT",
    "DOMAIN,push.heytapmobi.com,DIRECT",
    "DOMAIN-SUFFIX,oppo.com,DIRECT",
    "DOMAIN-SUFFIX,oppomobile.com,DIRECT",
    "DOMAIN,conn1.oppomobile.com,DIRECT",
    "DOMAIN-SUFFIX,coloros.com,DIRECT",
    "DOMAIN-SUFFIX,opposhop.cn,DIRECT",
    "DOMAIN-SUFFIX,oppo.cn,DIRECT",
    "DOMAIN-SUFFIX,qq.com,DIRECT",
    "DOMAIN-SUFFIX,gtimg.com,DIRECT",
    "DOMAIN-SUFFIX,qpic.cn,DIRECT",
    "DOMAIN-SUFFIX,qlogo.cn,DIRECT",
    "DOMAIN,weixin.qq.com,DIRECT",
    "DOMAIN-SUFFIX,wechat.com,DIRECT",
    "DOMAIN,wx.qq.com,DIRECT",
    "DOMAIN,work.weixin.qq.com,DIRECT",
    "DOMAIN-SUFFIX,wecom.work,DIRECT",
    "DOMAIN-SUFFIX,alipay.com,DIRECT",
    "DOMAIN-SUFFIX,alipayobjects.com,DIRECT",
    "DOMAIN-SUFFIX,aliyun.com,DIRECT",
    "DOMAIN-SUFFIX,taobao.com,DIRECT",
    "DOMAIN-SUFFIX,tmall.com,DIRECT",
    "DOMAIN-SUFFIX,amap.com,DIRECT",
    "DOMAIN-SUFFIX,autonav.com,DIRECT",
    "DOMAIN-SUFFIX,unionpay.com,DIRECT",
    "DOMAIN-SUFFIX,chinaums.com,DIRECT",
    "DOMAIN-SUFFIX,baidu.com,DIRECT",
    "DOMAIN-SUFFIX,bdstatic.com,DIRECT",
    "DOMAIN-SUFFIX,bilibili.com,DIRECT",
    "DOMAIN-SUFFIX,jd.com,DIRECT",
    "DOMAIN-SUFFIX,meituan.com,DIRECT",
    "DOMAIN-SUFFIX,dianping.com,DIRECT",
    "DOMAIN-SUFFIX,douyin.com,DIRECT",
    "DOMAIN-SUFFIX,snssdk.com,DIRECT",
    "DOMAIN-SUFFIX,toutiao.com,DIRECT",
    "DOMAIN-SUFFIX,xiaohongshu.com,DIRECT",
    "DOMAIN-SUFFIX,smzdm.com,DIRECT",
    "DOMAIN-SUFFIX,10jqka.com.cn,DIRECT",
    "DOMAIN-SUFFIX,eastmoney.com,DIRECT",
    "GEOSITE,cn,DIRECT",
    "GEOIP,CN,DIRECT",

    "DOMAIN-SUFFIX,anthropic.com,US",
    "DOMAIN-SUFFIX,claude.ai,US",
    "DOMAIN,gemini.google.com,US",
    "DOMAIN,ai.google.dev,US",
    "DOMAIN,generativelanguage.googleapis.com,US",
    "DOMAIN,aistudio.google.com,US",
    "RULE-SET,gemini,US",
    "DOMAIN-SUFFIX,github.com,ACCESS",
    "DOMAIN-SUFFIX,githubusercontent.com,ACCESS",
    "DOMAIN-SUFFIX,telegram.org,ACCESS",
    "DOMAIN-SUFFIX,t.me,ACCESS",
    "DOMAIN-SUFFIX,youtube.com,ACCESS",
    "DOMAIN-SUFFIX,googlevideo.com,ACCESS",
    "DOMAIN-SUFFIX,x.com,ACCESS",
    "DOMAIN-SUFFIX,twitter.com,ACCESS",
    "DOMAIN-SUFFIX,reddit.com,ACCESS",
    "RULE-SET,apple_media,ACCESS",
    "RULE-SET,google,ACCESS",
    "RULE-SET,telegram,ACCESS",
    "RULE-SET,youtube,ACCESS",
    "RULE-SET,nsfw,ACCESS",
    "MATCH,ACCESS"
  ]
}
