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
    <div className="bg-gray-50 border-4 border-pepe-black rounded-[2rem] p-6 sm:p-8 space-y-6">
      <div className="flex items-center space-x-3 space-x-reverse mb-4">
        <Calculator className="text-pepe-pink" size={32} strokeWidth={3} />
        <h4 className="text-2xl font-black uppercase italic">{t('calculator.title')}</h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-gray-400 ml-2">{t('calculator.input_amount')}</label>
          <input 
            type="number" 
            value={inputs.amount}
            onChange={(e) => setInputs({...inputs, amount: e.target.value})}
            className="w-full bg-white border-4 border-pepe-black rounded-2xl px-4 py-3 font-black focus:ring-4 ring-pepe-yellow/20 outline-none transition-all"
            placeholder="e.g. 1000"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-gray-400 ml-2">{t('calculator.buy_price')}</label>
          <input 
            type="number" 
            value={inputs.buyPrice}
            onChange={(e) => setInputs({...inputs, buyPrice: e.target.value})}
            className="w-full bg-white border-4 border-pepe-black rounded-2xl px-4 py-3 font-black focus:ring-4 ring-pepe-yellow/20 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-gray-400 ml-2">{t('calculator.sell_price')}</label>
          <input 
            type="number" 
            value={inputs.sellPrice}
            onChange={(e) => setInputs({...inputs, sellPrice: e.target.value})}
            className="w-full bg-white border-4 border-pepe-black rounded-2xl px-4 py-3 font-black focus:ring-4 ring-pepe-yellow/20 outline-none transition-all"
            placeholder="e.g. 0.001"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-gray-400 ml-2">{t('calculator.trading_fees')}</label>
          <input 
            type="number" 
            value={inputs.fees}
            onChange={(e) => setInputs({...inputs, fees: e.target.value})}
            className="w-full bg-white border-4 border-pepe-black rounded-2xl px-4 py-3 font-black focus:ring-4 ring-pepe-yellow/20 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={handleCalculate}
          className="flex-1 bg-pepe-pink text-white border-4 border-pepe-black rounded-2xl py-4 font-black uppercase italic shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
        >
          {t('calculator.calculate')}
        </button>
        <button 
          onClick={handleReset}
          className="bg-white border-4 border-pepe-black rounded-2xl px-6 font-black uppercase shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
        >
          <RotateCcw size={24} strokeWidth={3} />
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-4 border-red-500 p-4 rounded-2xl text-red-600 font-black flex items-center">
          <Info className="mr-3" /> {error}
        </div>
      )}

      {results && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-pepe-black text-white p-6 rounded-[2rem] border-4 border-pepe-black shadow-[8px_8px_0_0_#FF69B4] space-y-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400">{t('calculator.results.tokens')}</p>
              <p className="text-xl font-black text-pepe-yellow">{parseFloat(results.tokensBought).toLocaleString()} $PWIFE</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-gray-400">{t('calculator.results.roi')}</p>
              <p className={`text-xl font-black ${results.isProfit ? 'text-pepe-green' : 'text-red-500'}`}>
                {results.roi}%
              </p>
            </div>
          </div>

          <div className="border-t-2 border-white/10 pt-4">
            <p className="text-xs font-black uppercase text-gray-400 mb-1">{t('calculator.results.profit')}</p>
            <div className="flex items-center justify-between">
              <span className={`text-3xl font-black italic ${results.isProfit ? 'text-pepe-green' : 'text-red-500'}`}>
                ${parseFloat(results.profit).toLocaleString()}
              </span>
              {results.isProfit ? <TrendingUp size={40} className="text-pepe-green" /> : <TrendingDown size={40} className="text-red-500" />}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProfitCalculator;
