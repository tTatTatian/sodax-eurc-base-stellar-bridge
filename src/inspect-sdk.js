import { Sodax, ChainKeys } from '@sodax/sdk';

const sodax = new Sodax();

function methodNames(value) {
  if (!value) return [];
  const names = new Set();
  let proto = value;
  while (proto && proto !== Object.prototype) {
    for (const name of Object.getOwnPropertyNames(proto)) {
      if (name !== 'constructor' && typeof value[name] === 'function') names.add(name);
    }
    proto = Object.getPrototypeOf(proto);
  }
  return [...names].sort();
}

const baseKey = ChainKeys.BASE_MAINNET;
const stellarKey = ChainKeys.STELLAR_MAINNET;

console.log('\n=== SODAX SDK read-only inspection ===');
console.log('SDK loaded:', true);
console.log('Base chain key:', baseKey);
console.log('Stellar chain key:', stellarKey);
console.log('Bridge methods:', methodNames(sodax.bridge));
console.log('Config methods:', methodNames(sodax.config));

const config = sodax.instanceConfig;
console.log('\nConfigured chain keys:', Object.keys(config?.chains ?? {}));

function findEurc(value, path = 'root', depth = 0, seen = new WeakSet(), hits = []) {
  if (!value || typeof value !== 'object' || depth > 10 || hits.length >= 50) return hits;
  if (seen.has(value)) return hits;
  seen.add(value);

  if (
    typeof value.symbol === 'string' &&
    value.symbol.toUpperCase() === 'EURC' &&
    typeof value.address === 'string'
  ) {
    hits.push({
      path,
      symbol: value.symbol,
      name: value.name ?? null,
      address: value.address,
      decimals: value.decimals ?? null,
      chainKey: value.chainKey ?? null,
      vault: value.vault ?? value.hubVault ?? null,
    });
  }

  for (const [key, child] of Object.entries(value)) {
    if (child && typeof child === 'object') {
      findEurc(child, path + '.' + key, depth + 1, seen, hits);
    }
  }
  return hits;
}

const eurcEntries = findEurc(config);
console.log('\nEURC entries in packaged SDK config:');
console.log(JSON.stringify(eurcEntries, null, 2));

console.log('\nSafety: this script only reads local SDK configuration.');
console.log('It does not connect a wallet, approve tokens, sign, or submit transactions.');
