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
        "HK",
        "SG",
        "TW",
        "JP",
        "US",
        "DIRECT",
        "OTHER"
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
      "exclude-filter": "(?i)(泰国|Thailand|越南|Vietnam|尼日利亚|Nigeria|韩国|(?:South\\s*)?Korea|朝鲜|North\\s*Korea|印度|India|印度尼西亚|Indonesia|马来西亚|Malaysia|菲律宾|Philippines|柬埔寨|Cambodia|老挝|Laos|缅甸|Myanmar|蒙古|Mongolia|俄罗斯|Russia|英国|United\\s*Kingdom|\\bUK\\b|德国|Germany|法国|France|荷兰|Netherlands|加拿大|Canada|澳大利亚|Australia|新西兰|New\\s*Zealand|巴西|Brazil|墨西哥|Mexico|阿联酋|UAE|Dubai|土耳其|Turkey|以色列|Israel|南非|South\\s*Africa)",
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
    },
    {
      "name": "OTHER",
      "type": "select",
      "include-all": true,
      "filter": "(?i)(泰国|Thailand|越南|Vietnam|尼日利亚|Nigeria|韩国|(?:South\\s*)?Korea|朝鲜|North\\s*Korea|印度|India|印度尼西亚|Indonesia|马来西亚|Malaysia|菲律宾|Philippines|柬埔寨|Cambodia|老挝|Laos|缅甸|Myanmar|蒙古|Mongolia|俄罗斯|Russia|英国|United\\s*Kingdom|\\bUK\\b|德国|Germany|法国|France|荷兰|Netherlands|加拿大|Canada|澳大利亚|Australia|新西兰|New\\s*Zealand|巴西|Brazil|墨西哥|Mexico|阿联酋|UAE|Dubai|土耳其|Turkey|以色列|Israel|南非|South\\s*Africa)"
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
    "IP-CIDR,100.64.0.0/10,DIRECT,no-resolve",
    "IP-CIDR,127.0.0.0/8,DIRECT,no-resolve",
    "IP-CIDR,169.254.0.0/16,DIRECT,no-resolve",
    "IP-CIDR,172.16.0.0/12,DIRECT,no-resolve",
    "IP-CIDR,192.168.0.0/16,DIRECT,no-resolve",
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
    "DOMAIN,wx.qq.com,DIRECT",
    "DOMAIN,work.weixin.qq.com,DIRECT",
    "DOMAIN-SUFFIX,wechat.com,DIRECT",
    "DOMAIN-SUFFIX,wecom.work,DIRECT",
    "DOMAIN-SUFFIX,tenpay.com,DIRECT",
    "DOMAIN-SUFFIX,alipay.com,DIRECT",
    "DOMAIN-SUFFIX,alipayobjects.com,DIRECT",
    "DOMAIN-SUFFIX,aliyun.com,DIRECT",
    "DOMAIN-SUFFIX,taobao.com,DIRECT",
    "DOMAIN-SUFFIX,tmall.com,DIRECT",
    "DOMAIN-SUFFIX,amap.com,DIRECT",
    "DOMAIN-SUFFIX,autonav.com,DIRECT",
    "DOMAIN-SUFFIX,unionpay.com,DIRECT",
    "DOMAIN-SUFFIX,chinaums.com,DIRECT",
    "DOMAIN-SUFFIX,icbc.com.cn,DIRECT",
    "DOMAIN-SUFFIX,ccb.com,DIRECT",
    "DOMAIN-SUFFIX,abchina.com,DIRECT",
    "DOMAIN-SUFFIX,boc.cn,DIRECT",
    "DOMAIN-SUFFIX,bankcomm.com,DIRECT",
    "DOMAIN-SUFFIX,cmbchina.com,DIRECT",
    "DOMAIN-SUFFIX,spdb.com.cn,DIRECT",
    "DOMAIN-SUFFIX,cib.com.cn,DIRECT",
    "DOMAIN-SUFFIX,cebbank.com,DIRECT",
    "DOMAIN-SUFFIX,citicbank.com,DIRECT",
    "DOMAIN-SUFFIX,pingan.com,DIRECT",
    "DOMAIN-SUFFIX,psbc.com,DIRECT",
    "DOMAIN-SUFFIX,10jqka.com.cn,DIRECT",
    "DOMAIN-SUFFIX,eastmoney.com,DIRECT",
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
    "DOMAIN-SUFFIX,cn,DIRECT",
    "GEOSITE,private,DIRECT",
    "GEOSITE,cn,DIRECT",
    "RULE-SET,apple_ai,US",
    "DOMAIN-SUFFIX,chatgpt.com,US",
    "DOMAIN-SUFFIX,ws.chatgpt.com,US",
    "DOMAIN-SUFFIX,openai.com,US",
    "DOMAIN-SUFFIX,ios.chat.openai.com,US",
    "DOMAIN-SUFFIX,oaistatic.com,US",
    "DOMAIN-SUFFIX,oaiusercontent.com,US",
    "DOMAIN-SUFFIX,cdn.openai.com,US",
    "DOMAIN-SUFFIX,files.openai.com,US",
    "DOMAIN-SUFFIX,api.openai.com,US",
    "DOMAIN-SUFFIX,chat.openai.com,US",
    "DOMAIN-SUFFIX,chatgptusercontent.com,US",
    "DOMAIN-SUFFIX,auth0.com,US",
    "DOMAIN-SUFFIX,auth.openai.com,US",
    "DOMAIN-SUFFIX,sora.com,US",
    "DOMAIN-SUFFIX,sora.chat,US",
    "RULE-SET,openai,US",
    "DOMAIN-SUFFIX,anthropic.com,US",
    "DOMAIN-SUFFIX,claude.ai,US",
    "DOMAIN-SUFFIX,gemini.google.com,US",
    "DOMAIN-SUFFIX,bard.google.com,US",
    "DOMAIN-SUFFIX,generativelanguage.googleapis.com,US",
    "DOMAIN-SUFFIX,proactivebackend-pa.googleapis.com,US",
    "DOMAIN-SUFFIX,ai.google.dev,US",
    "DOMAIN-SUFFIX,aistudio.google.com,US",
    "DOMAIN-SUFFIX,notebooklm.google.com,US",
    "RULE-SET,gemini,US",
    "RULE-SET,paypal,US",
    "RULE-SET,apple_media,HK",
    "DOMAIN-SUFFIX,connectivitycheck.gstatic.com,HK",
    "DOMAIN-SUFFIX,gstatic.com,HK",
    "DOMAIN-SUFFIX,googleapis.com,HK",
    "RULE-SET,google,HK",
    "DOMAIN-SUFFIX,api.telegram.org,HK",
    "IP-CIDR,91.108.0.0/16,HK,no-resolve",
    "IP-CIDR,149.154.160.0/20,HK,no-resolve",
    "RULE-SET,telegram,HK",
    "RULE-SET,whatsapp,HK",
    "RULE-SET,youtube,HK",
    "RULE-SET,nsfw,HK",
    "GEOIP,CN,DIRECT",
    "MATCH,HK"
  ]
}
