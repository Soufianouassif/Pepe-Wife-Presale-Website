import { describe, it, expect, vi } from 'vitest';
import { detectWalletProviders, selectWalletProvider } from './detector';
import { createWalletAdapter } from './adapters';

const createMetaMaskProvider = () => {
  let currentChainId = '0x38';
  const provider = {
    isMetaMask: true,
    request: vi.fn(async ({ method }) => {
      if (method === 'eth_requestAccounts') return ['0x1111111111111111111111111111111111111111'];
      if (method === 'eth_chainId') return currentChainId;
      if (method === 'personal_sign') return '0xsignature';
      if (method === 'eth_sendTransaction') return '0xtxhash';
      return null;
    }),
    switchChain(next) {
      currentChainId = next;
    }
  };
  return provider;
};

const createPhantomProvider = () => ({
  isPhantom: true,
  connect: vi.fn(async () => ({
    publicKey: {
      toString: () => '7A4hJ9A8iYDJkW4M8YkFQq6fD7A9hA7gLkJj2BnWPhnt'
    }
  })),
  signMessage: vi.fn(async () => ({ signature: 'sol-signature' })),
  request: vi.fn(async () => 'sol-tx-hash')
});

describe('wallet detection', () => {
  it('returns no wallets when providers are missing', () => {
    const detected = detectWalletProviders({});
    expect(detected.MetaMask).toBeNull();
    expect(detected.Phantom).toBeNull();
  });

  it('detects a single wallet when only MetaMask is available', () => {
    const metamask = createMetaMaskProvider();
    const detected = detectWalletProviders({ ethereum: metamask });
    expect(detected.MetaMask).toBe(metamask);
    expect(detected.Phantom).toBeNull();
  });

  it('detects a single wallet when only Phantom is available', () => {
    const phantom = createPhantomProvider();
    const detected = detectWalletProviders({ phantom: { solana: phantom } });
    expect(detected.MetaMask).toBeNull();
    expect(detected.Phantom).toBe(phantom);
  });

  it('respects priority MetaMask then Phantom when both exist', () => {
    const metamask = createMetaMaskProvider();
    const phantom = createPhantomProvider();
    const selected = selectWalletProvider({
      preferred: 'MetaMask',
      fallback: 'Phantom',
      win: {
        ethereum: metamask,
        phantom: { solana: phantom }
      }
    });
    expect(selected.walletType).toBe('MetaMask');
    expect(selected.provider).toBe(metamask);
  });
});

describe('wallet adapter error and security behavior', () => {
  it('throws USER_REJECTED when user rejects connection', async () => {
    const provider = {
      isMetaMask: true,
      request: vi.fn(async ({ method }) => {
        if (method === 'eth_requestAccounts') {
          throw new Error('User rejected request');
        }
        return null;
      })
    };
    const adapter = createWalletAdapter({
      provider,
      walletType: 'MetaMask',
      expectedChainId: '0x38'
    });
    await expect(adapter.connect()).rejects.toMatchObject({
      code: 'USER_REJECTED'
    });
  });

  it('fails when chain switches to unexpected network', async () => {
    const provider = createMetaMaskProvider();
    const adapter = createWalletAdapter({
      provider,
      walletType: 'MetaMask',
      expectedChainId: '0x38'
    });
    const address = await adapter.connect();
    expect(address).toBe('0x1111111111111111111111111111111111111111');
    provider.switchChain('0x1');
    await expect(adapter.sign('hello', address)).rejects.toMatchObject({
      code: 'CHAIN_MISMATCH'
    });
  });
});
