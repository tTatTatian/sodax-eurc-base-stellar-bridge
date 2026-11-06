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

const BASE = ChainKeys.BASE_MAINNET;
const STELLAR = ChainKeys.STELLAR_MAINNET;
const BASE_EURC_ADDRESS = '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42';
const STELLAR_EURC_ADDRESS = 'CDTKPWPLOURQA2SGTKTUQOWRCBZEORB4BWBOMJ3D3ZTQQSGE5F6JBQLV';

console.log('\n=== SODAX SDK read-only EURC bridge check ===');
console.log('SDK loaded:', true);
console.log('Base chain key:', BASE);
console.log('Stellar chain key:', STELLAR);
console.log('Bridge methods:', methodNames(sodax.bridge));

const config = sodax.instanceConfig;
const baseToken = config.chains?.[BASE]?.supportedTokens?.EURC;
const stellarToken = config.chains?.[STELLAR]?.supportedTokens?.EURC;

console.log('\nEURC metadata:');
console.log(JSON.stringify({ baseToken, stellarToken }, null, 2));

if (!baseToken || !stellarToken) {
  console.error('EURC missing from one or both SDK chain configurations.');
  process.exitCode = 2;
} else {
  const baseToStellar = sodax.bridge.isBridgeable({ from: baseToken, to: stellarToken });
  const stellarToBase = sodax.bridge.isBridgeable({ from: stellarToken, to: baseToken });

  console.log('\n=== Compatibility (same hub vault) ===');
  console.log('Base -> Stellar isBridgeable:', baseToStellar);
  console.log('Stellar -> Base isBridgeable:', stellarToBase);

  const [baseDestinations, stellarDestinations] = [
    sodax.bridge.getBridgeableTokens(BASE, STELLAR, BASE_EURC_ADDRESS),
    sodax.bridge.getBridgeableTokens(STELLAR, BASE, STELLAR_EURC_ADDRESS),
  ];

  console.log('\n=== Destination tokens returned by SDK ===');
  console.log('Base EURC -> Stellar:', JSON.stringify(baseDestinations, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));
  console.log('Stellar EURC -> Base:', JSON.stringify(stellarDestinations, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));

  console.log('\n=== Partner fee configuration ===');
  console.log('Configured bridge partner fee:', JSON.stringify(sodax.config.bridgePartnerFee ?? null, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));
  console.log('Fee on 1.0 EURC-equivalent in 18-decimal hub units:', sodax.bridge.getFee(10n ** 18n).toString());
  console.log('Fee with explicit no-fee override (undefined):', sodax.bridge.getFee(10n ** 18n, undefined).toString());

  if (baseToStellar && stellarToBase) {
    console.log('\n=== Capacity reads ===');
    const [forward, reverse] = await Promise.all([
      sodax.bridge.getBridgeableAmount(baseToken, stellarToken),
      sodax.bridge.getBridgeableAmount(stellarToken, baseToken),
    ]);
    console.log('Base -> Stellar capacity:', JSON.stringify(forward, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));
    console.log('Stellar -> Base capacity:', JSON.stringify(reverse, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));
  } else {
    console.log('\nCapacity reads skipped: SDK compatibility check failed in at least one direction.');
  }
}

console.log('\nSafety: read-only configuration, compatibility, fee and capacity checks only.');
console.log('No wallet connection, approval, signature, transaction construction, or submission.');
