#!/usr/bin/env node

import { readFileSync } from 'node:fs';

const configPath = new URL('./mihomo_android_cn_v2.js', import.meta.url);
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const groups = config['proxy-groups'];

const byName = new Map();
for (const group of groups) {
  const normalized = group.name.toLowerCase();
  if (normalized === 'direct') {
    throw new Error('A proxy group must never be named DIRECT; DIRECT is built in.');
  }
  if (byName.has(normalized)) {
    throw new Error(`Duplicate proxy group name: ${group.name}`);
  }
  byName.set(normalized, group);
}

const edges = new Map();
for (const group of groups) {
  const dependencies = (group.proxies ?? [])
    .map((name) => String(name).toLowerCase())
    .filter((name) => byName.has(name));
  edges.set(group.name.toLowerCase(), dependencies);
}

const visited = new Set();
const visiting = new Set();
const visit = (name, chain = []) => {
  if (visiting.has(name)) {
    throw new Error(`Proxy group loop: ${[...chain, name].join(' -> ')}`);
  }
  if (visited.has(name)) return;
  visiting.add(name);
  for (const next of edges.get(name) ?? []) visit(next, [...chain, name]);
  visiting.delete(name);
  visited.add(name);
};

for (const name of byName.keys()) visit(name);

const requiredGroups = ['ai-region', 'access', 'proxy', 'us', 'hk', 'jp', 'sg', 'final'];
for (const name of requiredGroups) {
  if (!byName.has(name)) throw new Error(`Missing required group: ${name}`);
}

const rules = config.rules.join('\n');
for (const rule of [
  'PROCESS-NAME,com.openai.chatgpt,AI-REGION',
  'NETWORK,UDP)),REJECT',
  'RULE-SET,openai,AI-REGION',
  'PROCESS-NAME,com.paypal.android.p2pmobile,US',
  'MATCH,ACCESS',
]) {
  if (!rules.includes(rule)) throw new Error(`Missing required rule: ${rule}`);
}

console.log(`Mihomo Android v2 valid: groups=${groups.length} rules=${config.rules.length} loops=0`);
