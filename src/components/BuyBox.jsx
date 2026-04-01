import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useWallet } from '../context/WalletContext';
import { CURRENT_TOKEN_PRICE_USD } from '../presaleConfig';
import { PROJECT_CURRENCY_SYMBOL, PROJECT_CURRENCY_NAME } from '../constants/projectConstants';
import { getPaymentRange, validatePaymentAmount, clampPaymentAmount } from '../utils/amountValidation';
import EthereumUsdtNotice from './EthereumUsdtNotice';
import { Zap, Settings as SettingsIcon, ChevronDown, ArrowDown, Info, Loader2, CheckCircle2, AlertCircle, Shield, X } from 'lucide-react';

const TOKENS = [
  { id: 'SOL', name: 'Solana', symbol: 'SOL', icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png', price: 185.50 },
  { id: 'USDT', name: 'Tether', symbol: 'USDT', icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8En2vBY/logo.png', price: 1.00 },
  { id: 'ETH', name: 'Ethereum', symbol: 'ETH', icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png', price: 3450.20 },
  { id: 'BNB', name: 'BNB', symbol: 'BNB', icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png', price: 580.40 }
];

const PWIFE_PRICE = CURRENT_TOKEN_PRICE_USD;

const BuyBox = ({ t: tProp, onSuccess }) => {
  const { t: i18nT } = useTranslation();
  const t = tProp || i18nT;
  const { isConnected, sendTransaction } = useWallet();
  const [fromToken, setFromToken] = useState({
    ...TOKENS[0],
    name: t('buybox_widget.tokens.sol_name')
  });
  const [amount, setAmount] = useState('');
  const [showTokenList, setShowTokenList] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [txStatus, setTxStatus] = useState('idle'); // idle, pending, success, error
  const [amountError, setAmountError] = useState('');

  const range = useMemo(() => getPaymentRange(fromToken.id), [fromToken.id]);

  const calculatedTokensNum = useMemo(() => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return 0;
    const usdValue = parseFloat(amount) * (fromToken.price || 0);
    return Math.floor(usdValue / PWIFE_PRICE);
  }, [amount, fromToken]);

  const calculatedTokens = useMemo(() => {
    return calculatedTokensNum.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }, [calculatedTokensNum]);

  const handleAmountChange = (nextRaw) => {
    setAmount(nextRaw);
    if (nextRaw === '') {
      setAmountError('');
      return;
    }
    const validation = validatePaymentAmount(nextRaw, fromToken.id);
    if (!validation.valid) {
      setAmountError(t('validation.amount_range', { min: validation.min, max: validation.max }));
      return;
    }
    setAmountError('');
  };

  const handleAmountBlur = () => {
    if (amount === '') return;
    const validation = validatePaymentAmount(amount, fromToken.id);
    if (!validation.valid) {
      const clamped = clampPaymentAmount(amount, fromToken.id);
      setAmount(clamped);
    }
  };

  const handleBuy = async () => {
    if (!isConnected) return;
    if (!amount || parseFloat(amount) <= 0) return;
    const validation = validatePaymentAmount(amount, fromToken.id);
    if (!validation.valid) {
      setAmountError(t('validation.amount_range', { min: validation.min, max: validation.max }));
      return;
    }

    setIsBuying(true);
    setTxStatus('pending');
    
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onSuccess) {
        onSuccess(calculatedTokensNum);
      }
      
      setTxStatus('success');
      setAmount('');
    } catch (error) {
      console.error("BuyBox: Purchase failed", error);
      setTxStatus('error');
    } finally {
      setIsBuying(false);
      setTimeout(() => setTxStatus('idle'), 5000);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border-4 border-pepe-black rounded-[2.5rem] p-6 sm:p-8 shadow-[12px_12px_0_0_#000] space-y-6 relative overflow-hidden group">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 bg-pepe-yellow rounded-xl border-2 border-pepe-black flex items-center justify-center shadow-[4px_4px_0_0_#000]">
            <Zap className="text-pepe-black" />
          </div>
          <h3 className="text-xl font-black uppercase italic tracking-tight">{t('buybox_widget.title')}</h3>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <SettingsIcon className="text-gray-400" />
        </button>
      </div>

      {/* From Input */}
      <div className="space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-gray-500 px-2">
          <span>{t('buybox_widget.you_pay')}</span>
        </div>
        <div className="flex justify-between text-[10px] font-bold text-gray-400 px-2">
          <span>{t('buybox_widget.balance')}</span>
          <span>{t('buybox_widget.range_hint', { min: range.min, max: range.max })}</span>
        </div>
        <div className="bg-gray-50 border-4 border-pepe-black rounded-2xl p-4 flex items-center gap-4 focus-within:ring-4 ring-pepe-yellow/20 transition-all">
          <input 
            type="number"
            value={amount}
            min={range.min}
            max={range.max}
            onChange={(e) => handleAmountChange(e.target.value)}
            onBlur={handleAmountBlur}
            placeholder={t('buybox_widget.amount_placeholder')}
            className="flex-1 bg-transparent text-2xl font-black outline-none placeholder:text-gray-300"
          />
          <button 
            onClick={() => setShowTokenList(!showTokenList)}
            className="flex items-center gap-2 bg-white border-2 border-pepe-black px-3 py-2 rounded-xl hover:bg-gray-100 transition-all shadow-[2px_2px_0_0_#000] active:translate-y-[1px] active:shadow-none"
          >
            <img src={fromToken.icon} alt={fromToken.symbol} className="w-6 h-6 rounded-full" />
            <span className="font-black uppercase text-sm">{fromToken.symbol}</span>
            <ChevronDown className="text-base" />
          </button>
        </div>
        {amountError && <p className="text-xs font-black text-red-600 px-2">{amountError}</p>}
      </div>

      {fromToken.id === 'USDT' && <EthereumUsdtNotice />}

      {/* Divider / Switch */}
      <div className="flex justify-center -my-3 relative z-10">
        <div className="bg-pepe-black text-white p-2 rounded-full border-4 border-white shadow-lg">
          <ArrowDown className="text-base" />
        </div>
      </div>

      {/* To Output */}
      <div className="space-y-3">
        <div className="flex justify-between text-xs font-black uppercase tracking-wider text-gray-400 px-2">
          <span>{t('buybox_widget.you_receive')}</span>
          <span>{t('buybox_widget.price')}</span>
        </div>
        <div className="bg-pepe-black border-4 border-pepe-black rounded-2xl p-4 flex items-center gap-4 shadow-[4px_4px_0_0_#FF69B4]">
          <div className="flex-1 text-2xl font-black text-pepe-yellow">
            {calculatedTokens}
          </div>
          <div className="flex items-center gap-2 bg-white/10 border-2 border-white/20 px-3 py-2 rounded-xl">
            <img src="/assets/hero-character.png" alt="PWIFE" className="w-6 h-6 object-contain" />
            <span className="font-black uppercase text-sm text-white">$PWIFE</span>
            <span className="sr-only">{PROJECT_CURRENCY_SYMBOL}</span>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="bg-gray-50 rounded-2xl p-4 space-y-3 border-2 border-pepe-black/5">
        <div className="flex justify-between text-xs font-bold text-gray-500">
          <div className="flex items-center gap-1">
            {t('buybox_widget.exchange_rate')} <Info className="text-xs" />
          </div>
            <span className="font-black text-pepe-black">1 {fromToken.symbol} ≈ {(fromToken.price / PWIFE_PRICE).toLocaleString()} {PROJECT_CURRENCY_NAME}</span>
        </div>
        <div className="flex justify-between text-xs font-bold text-gray-500">
          <div className="flex items-center gap-1">
            {t('buybox_widget.network_fee')} <Info className="text-xs" />
          </div>
          <span className="font-black text-pepe-black">~$0.25</span>
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={handleBuy}
        disabled={isBuying || !amount || txStatus !== 'idle' || !!amountError}
        className={`
          w-full py-5 rounded-2xl border-4 border-pepe-black font-black uppercase italic text-xl shadow-[8px_8px_0_0_#000]
          transition-all active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed
          ${txStatus === 'success' ? 'bg-pepe-green text-pepe-black' : 
            txStatus === 'error' ? 'bg-red-500 text-white' : 
            'bg-pepe-pink text-white hover:bg-pepe-pink/90'}
        `}
      >
        {isBuying ? (
          <div className="flex items-center justify-center gap-3">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <Loader2 className="text-2xl" />
            </motion.div>
            {t('buybox_widget.processing')}
          </div>
        ) : txStatus === 'success' ? (
          <div className="flex items-center justify-center gap-3">
            <CheckCircle2 className="text-2xl" />
            {t('buybox_widget.success')}
          </div>
        ) : txStatus === 'error' ? (
          <div className="flex items-center justify-center gap-3">
            <AlertCircle className="text-2xl" />
            {t('buybox_widget.failed')}
          </div>
        ) : (
          t('buybox_widget.buy_now')
        )}
      </button>

      {/* Footer Security */}
      <div className="flex items-center justify-center gap-2 opacity-30 text-[10px] font-black uppercase tracking-widest">
        <Shield className="text-sm" />
        {t('buybox_widget.secured')}
      </div>

      {/* Token Selector Modal */}
      <AnimatePresence>
        {showTokenList && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-0 z-20 bg-white p-6 rounded-[2.5rem] border-4 border-pepe-black flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black uppercase italic text-lg">{t('buybox_widget.select_token')}</h4>
              <button onClick={() => setShowTokenList(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="text-lg" />
              </button>
            </div>
            <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2">
              {TOKENS.map((token) => (
                <button 
                  key={token.id}
                  onClick={() => {
                    setFromToken(token);
                    setShowTokenList(false);
                  }}
                  className={`
                    w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all
                    ${fromToken.id === token.id ? 'bg-pepe-yellow/10 border-pepe-black shadow-[4px_4px_0_0_#000]' : 'bg-gray-50 border-transparent hover:border-pepe-black/20'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <img src={token.icon} alt={token.name} className="w-8 h-8 rounded-full" />
                    <div className="text-left">
                      <p className="font-black text-sm">{token.symbol}</p>
                      <p className="text-[10px] font-bold text-gray-400">{token.id === 'SOL' ? t('buybox_widget.tokens.sol_name') : token.id === 'USDT' ? t('buybox_widget.tokens.usdt_name') : token.id === 'ETH' ? t('buybox_widget.tokens.eth_name') : t('buybox_widget.tokens.bnb_name')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xs">${token.price.toLocaleString()}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BuyBox;
