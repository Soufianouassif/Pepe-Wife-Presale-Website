import { Web3AuthNoModal } from "@web3auth/no-modal";
import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";

const WEB3AUTH_CLIENT_ID = import.meta?.env?.VITE_WEB3AUTH_CLIENT_ID || "BJILT6B9z2_gOIHCTrovzF2PLAbngM9-mgBSneY6eysUyuU-CU17mfX9_dFpAXGjAuE7bwgezUtOgXgV7ZK3w2E";
const WEB3AUTH_ALLOWED_ORIGINS = (import.meta?.env?.VITE_WEB3AUTH_ALLOWED_ORIGINS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.SOLANA,
  chainId: "0x1", // Mainnet-beta
  rpcTarget: "https://api.mainnet-beta.solana.com",
  displayName: "Solana Mainnet",
  blockExplorer: "https://explorer.solana.com",
  ticker: "SOL",
  tickerName: "Solana",
};

class Web3AuthService {
  constructor() {
    this.web3auth = null;
  }

  async init() {
    if (this.web3auth) return;
    
    try {
      if (!WEB3AUTH_CLIENT_ID || typeof WEB3AUTH_CLIENT_ID !== 'string') {
        throw new Error("Web3Auth client id is missing.");
      }
      if (typeof window !== 'undefined' && WEB3AUTH_ALLOWED_ORIGINS.length > 0) {
        const currentOrigin = window.location.origin;
        if (!WEB3AUTH_ALLOWED_ORIGINS.includes(currentOrigin)) {
          throw new Error("Current origin is not allowed for Web3Auth.");
        }
      }
      this.web3auth = new Web3AuthNoModal({
        clientId: WEB3AUTH_CLIENT_ID,
        web3AuthNetwork: "sapphire_mainnet",
        chainConfig,
        privateKeyProvider: new SolanaPrivateKeyProvider({ config: { chainConfig } }),
        sessionTime: 86400,
        useCoreKitKey: false,
      });

      const openloginAdapter = new OpenloginAdapter({
        adapterSettings: {
          uxMode: "popup",
        },
      });
      this.web3auth.configureAdapter(openloginAdapter);
      await this.web3auth.init();
    } catch (error) {
      console.error("Web3AuthService: Initialization error:", error);
      throw new Error("Failed to initialize Web3Auth. Please refresh the page.");
    }
  }

  async login(loginProvider, extraLoginOptions = {}) {
    await this.init();
    const provider = await this.web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
      loginProvider,
      extraLoginOptions,
    });
    return provider;
  }

  async logout() {
    if (!this.web3auth) return;
    await this.web3auth.logout();
  }

  getProvider() {
    return this.web3auth?.provider || null;
  }

  getStatus() {
    return this.web3auth?.status || null;
  }

  getInstance() {
    return this.web3auth;
  }
}

const web3AuthService = new Web3AuthService();
export default web3AuthService;
