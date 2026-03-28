import { Web3Auth } from "@web3auth/modal";
import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
import { AuthAdapter } from "@web3auth/auth-adapter";
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";

const WEB3AUTH_CLIENT_ID = import.meta?.env?.VITE_WEB3AUTH_CLIENT_ID || "BJILT6B9z2_gOIHCTrovzF2PLAbngM9-mgBSneY6eysUyuU-CU17mfX9_dFpAXGjAuE7bwgezUtOgXgV7ZK3w2E";

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
      this.web3auth = new Web3Auth({
        clientId: WEB3AUTH_CLIENT_ID,
        web3AuthNetwork: "sapphire_mainnet",
        chainConfig,
        privateKeyProvider: new SolanaPrivateKeyProvider({ config: { chainConfig } }),
        sessionTime: 86400, // 24 hours
        useCoreKitKey: false,
      });

      const authAdapter = new AuthAdapter({
        adapterSettings: {
          uxMode: "popup",
        },
      });
      this.web3auth.configureAdapter(authAdapter);

      await this.web3auth.initModal({
        modalConfig: {
          [WALLET_ADAPTERS.AUTH]: {
            label: "Social Login",
            showOnModal: true,
            loginMethods: {
              google: { name: "google", showOnModal: true },
              twitter: { name: "twitter", showOnModal: true },
              telegram: { name: "telegram", showOnModal: true },
              email_passwordless: { name: "email_passwordless", showOnModal: true },
            },
          },
          [WALLET_ADAPTERS.METAMASK]: { label: "MetaMask", showOnModal: false },
          [WALLET_ADAPTERS.PHANTOM]: { label: "Phantom", showOnModal: false },
        },
      });
    } catch (error) {
      console.error("Web3AuthService: Initialization error:", error);
      throw new Error("Failed to initialize Web3Auth. Please refresh the page.");
    }
  }

  getInstance() {
    return this.web3auth;
  }
}

// Singleton instance
const web3AuthService = new Web3AuthService();
export default web3AuthService;
