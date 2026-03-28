const WEB3AUTH_CLIENT_ID = import.meta?.env?.VITE_WEB3AUTH_CLIENT_ID || "BJILT6B9z2_gOIHCTrovzF2PLAbngM9-mgBSneY6eysUyuU-CU17mfX9_dFpAXGjAuE7bwgezUtOgXgV7ZK3w2E";
const WEB3AUTH_ALLOWED_ORIGINS = (import.meta?.env?.VITE_WEB3AUTH_ALLOWED_ORIGINS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const chainConfig = {
  chainNamespace: "solana",
  chainId: "0x1", // Mainnet-beta
  rpcTarget: "https://api.mainnet-beta.solana.com",
  displayName: "Solana Mainnet",
  blockExplorer: "https://explorer.solana.com",
  ticker: "SOL",
  tickerName: "Solana",
};

const AUTH_CONNECTION_KEYS = {
  google: "GOOGLE",
  twitter: "X",
  telegram: "TELEGRAM",
  email_passwordless: "EMAIL_PASSWORDLESS",
};
const WEB3AUTH_CONNECT_TIMEOUT_MS = 25000;

class Web3AuthService {
  constructor() {
    this.web3auth = null;
    this.walletConnectors = null;
    this.authConnections = null;
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
      const web3authPkg = await import("@web3auth/no-modal");
      const Web3AuthClass = web3authPkg?.Web3AuthNoModal || web3authPkg?.Web3Auth || web3authPkg?.default?.Web3AuthNoModal || web3authPkg?.default;
      if (typeof Web3AuthClass !== "function") {
        throw new Error("Web3Auth class is not available.");
      }
      this.walletConnectors = web3authPkg?.WALLET_CONNECTORS || web3authPkg?.WALLET_ADAPTERS || {};
      this.authConnections = web3authPkg?.AUTH_CONNECTION || {};
      this.web3auth = new Web3AuthClass({
        clientId: WEB3AUTH_CLIENT_ID,
        web3AuthNetwork: "sapphire_mainnet",
        chainConfig,
        sessionTime: 86400,
        useCoreKitKey: false,
      });
      if (typeof this.web3auth.init === "function") {
        await this.web3auth.init();
      } else if (typeof this.web3auth.initModal === "function") {
        await this.web3auth.initModal();
      } else {
        throw new Error("Web3Auth init method is unavailable.");
      }
    } catch (error) {
      console.error("Web3AuthService: Initialization error:", error);
      throw new Error("Failed to initialize Web3Auth. Please refresh the page.");
    }
  }

  resolveAuthConnection(loginProvider) {
    const key = AUTH_CONNECTION_KEYS[loginProvider];
    if (!key || !this.authConnections) return null;
    return this.authConnections[key] || null;
  }

  resolveAuthConnectionId(loginProvider) {
    const map = {
      google: import.meta?.env?.VITE_WEB3AUTH_GOOGLE_CONNECTION_ID,
      twitter: import.meta?.env?.VITE_WEB3AUTH_X_CONNECTION_ID || import.meta?.env?.VITE_WEB3AUTH_TWITTER_CONNECTION_ID,
      telegram: import.meta?.env?.VITE_WEB3AUTH_TELEGRAM_CONNECTION_ID,
      email_passwordless: import.meta?.env?.VITE_WEB3AUTH_EMAIL_CONNECTION_ID,
    };
    const value = map[loginProvider];
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  async connectWithTimeout(connector, options) {
    let timer = null;
    try {
      return await Promise.race([
        this.web3auth.connectTo(connector, options),
        new Promise((_, reject) => {
          timer = setTimeout(() => {
            reject(new Error('Web3Auth connect timeout.'));
          }, WEB3AUTH_CONNECT_TIMEOUT_MS);
        })
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async login(loginProvider, extraLoginOptions = {}) {
    await this.init();
    if (!this.web3auth || typeof this.web3auth.connectTo !== "function") {
      throw new Error("Web3Auth connect is unavailable.");
    }
    const connector = this.walletConnectors?.AUTH || this.walletConnectors?.OPENLOGIN || "auth";
    const authConnection = this.resolveAuthConnection(loginProvider);
    const authConnectionId = this.resolveAuthConnectionId(loginProvider);
    const loginHint = typeof extraLoginOptions?.login_hint === "string" ? extraLoginOptions.login_hint.trim() : "";
    const attempts = [];
    if (authConnection) {
      attempts.push({
        authConnection,
        ...(authConnectionId ? { authConnectionId } : {}),
        ...(loginHint ? { loginHint } : {}),
      });
    }
    attempts.push({
      loginProvider,
      extraLoginOptions,
    });
    attempts.push({
      loginProvider,
    });

    let lastError = null;
    for (const options of attempts) {
      try {
        const provider = await this.connectWithTimeout(connector, options);
        if (provider) return provider;
      } catch (error) {
        lastError = error;
      }
    }
    const normalizedMessage = String(lastError?.message || '');
    if (normalizedMessage.toLowerCase().includes('timeout')) {
      throw new Error("Social auth timed out. Verify Web3Auth allowed origins and social connection IDs.");
    }
    throw lastError || new Error("Failed social connection.");
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
