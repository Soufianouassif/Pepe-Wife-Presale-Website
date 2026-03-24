/**
 * Manual test script for formatAddress utility.
 * Run with: node test-format-address.js
 */

import { formatAddress } from './src/utils/format.js';

const testCases = [
  { input: '0x1234567890abcdef1234567890abcdef12345678', expected: '0x1234...5678', name: 'Valid ETH address' },
  { input: 'SolanaAddress1234567890', expected: 'Solana...7890', name: 'Valid Solana address' },
  { input: null, expected: 'Connect Wallet', name: 'Null address' },
  { input: undefined, expected: 'Connect Wallet', name: 'Undefined address' },
  { input: '', expected: 'Connect Wallet', name: 'Empty string' },
  { input: '123', expected: '123', name: 'Short string' },
  { input: { toString: () => 'ObjectAddr1234567890' }, expected: 'Object...7890', name: 'Object with toString' },
  { input: {}, expected: 'Connect Wallet', name: 'Invalid object' }
];

console.log('--- formatAddress Utility Tests ---');
let passed = 0;

testCases.forEach(c => {
  const result = formatAddress(c.input);
  if (result === c.expected) {
    console.log(`✅ [PASS] ${c.name}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${c.name}: expected "${c.expected}", got "${result}"`);
  }
});

console.log(`\nFinal Summary: ${passed}/${testCases.length} tests passed.`);
if (passed === testCases.length) {
  console.log('🎉 All utility tests passed!');
  process.exit(0);
} else {
  console.log('⚠️ Some utility tests failed.');
  process.exit(1);
}
