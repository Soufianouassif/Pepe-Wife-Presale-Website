import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { calculateProfit } from '../utils/calculator';
import { Calculator, RotateCcw, TrendingUp, TrendingDown, Info } from 'lucide-react';

const ProfitCalculator = ({ t }) => {
  const [inputs, setInputs] = useState({
    amount: '',
    buyPrice: '0.00012', // Default PWIFE price
    sellPrice: '',
    fees: '0'
  });
  
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleCalculate = () => {
    const res = calculateProfit(inputs.amount, inputs.buyPrice, inputs.sellPrice, inputs.fees);
    if (res.error) {
      setError(t(`calculator.results.error`));
      setResults(null);
    } else {
      setResults(res);
      setError(null);
    }
  };

  const handleReset = () => {
    setInputs({
      amount: '',
      buyPrice: '0.00012',
      sellPrice: '',
      fees: '0'
    });
    setResults(null);
    setError(null);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border-4 border-pepe-black rounded-[2.5rem] p-6 sm:p-8 shadow-[12px_12px_0_0_#000] space-y-8 relative overflow-hidden group">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-pepe-pink opacity-5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:opacity-10 transition-opacity" />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-12 h-12 bg-pepe-yellow rounded-2xl border-2 border-pepe-black flex items-center justify-center shadow-[4px_4px_0_0_#000]">
            <Calculator className="text-pepe-black" size={24} strokeWidth={3} />
          </div>
          <div>
            <h4 className="text-xl font-black uppercase italic tracking-tight">{t('calculator.title', 'Profit Estimator')}</h4>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">Calculate your moon potential</p>
          </div>
        </div>
        <button 
          onClick={handleReset}
          className="p-3 bg-gray-50 border-2 border-pepe-black/5 rounded-xl hover:bg-pepe-yellow transition-all group/reset"
        >
          <RotateCcw size={18} className="text-gray-400 group-hover/reset:text-pepe-black transition-colors" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">{t('calculator.input_amount', 'Investment ($)')}</label>
          <div className="bg-gray-50 border-4 border-pepe-black rounded-2xl p-4 flex items-center gap-3 focus-within:ring-4 ring-pepe-yellow/20 transition-all">
            <input 
              type="number" 
              value={inputs.amount}
              onChange={(e) => setInputs({...inputs, amount: e.target.value})}
              className="w-full bg-transparent font-black text-lg outline-none placeholder:text-gray-300"
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">{t('calculator.buy_price', 'Buy Price')}</label>
          <div className="bg-gray-50 border-4 border-pepe-black rounded-2xl p-4 flex items-center gap-3 focus-within:ring-4 ring-pepe-yellow/20 transition-all">
            <input 
              type="number" 
              value={inputs.buyPrice}
              onChange={(e) => setInputs({...inputs, buyPrice: e.target.value})}
              className="w-full bg-transparent font-black text-lg outline-none"
            />
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">{t('calculator.sell_price', 'Sell Price')}</label>
          <div className="bg-gray-50 border-4 border-pepe-black rounded-2xl p-4 flex items-center gap-3 focus-within:ring-4 ring-pepe-yellow/20 transition-all">
            <input 
              type="number" 
              value={inputs.sellPrice}
              onChange={(e) => setInputs({...inputs, sellPrice: e.target.value})}
              className="w-full bg-transparent font-black text-lg outline-none placeholder:text-gray-300"
              placeholder="0.001"
            />
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">{t('calculator.trading_fees', 'Fees %')}</label>
          <div className="bg-gray-50 border-4 border-pepe-black rounded-2xl p-4 flex items-center gap-3 focus-within:ring-4 ring-pepe-yellow/20 transition-all">
            <input 
              type="number" 
              value={inputs.fees}
              onChange={(e) => setInputs({...inputs, fees: e.target.value})}
              className="w-full bg-transparent font-black text-lg outline-none"
            />
          </div>
        </div>
      </div>

      <button 
        onClick={handleCalculate}
        className="w-full bg-pepe-pink text-white border-4 border-pepe-black rounded-2xl py-5 font-black uppercase italic text-lg shadow-[8px_8px_0_0_#000] hover:translate-y-1 active:shadow-none transition-all"
      >
        {t('calculator.calculate', 'Calculate Profit')}
      </button>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 p-4 rounded-2xl text-red-500 font-bold text-sm flex items-center gap-3">
          <Info size={18} /> {error}
        </div>
      )}

      <AnimatePresence>
        {results && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-pepe-black text-white p-8 rounded-[2.5rem] border-4 border-pepe-black shadow-[10px_10px_0_0_#FF69B4] space-y-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -mr-24 -mt-24" />
            
            <div className="grid grid-cols-2 gap-8 relative z-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">{t('calculator.results.tokens', 'Tokens Received')}</p>
                <p className="text-2xl font-black text-pepe-yellow italic">{parseFloat(results.tokensBought).toLocaleString()} $PWIFE</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">{t('calculator.results.roi', 'Return on Investment')}</p>
                <p className={`text-2xl font-black italic ${results.isProfit ? 'text-pepe-green' : 'text-red-500'}`}>
                  {results.isProfit ? '+' : ''}{results.roi}%
                </p>
              </div>
            </div>

            <div className="border-t-2 border-white/10 pt-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">{t('calculator.results.profit', 'Estimated Profit')}</p>
                  <span className={`text-5xl font-black italic tracking-tighter ${results.isProfit ? 'text-pepe-green animate-pulse' : 'text-red-500'}`}>
                    ${parseFloat(results.profit).toLocaleString()}
                  </span>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-4 border-white/10 ${results.isProfit ? 'bg-pepe-green/20' : 'bg-red-500/20'}`}>
                  {results.isProfit ? <TrendingUp size={32} className="text-pepe-green" strokeWidth={3} /> : <TrendingDown size={32} className="text-red-500" strokeWidth={3} />}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfitCalculator;
