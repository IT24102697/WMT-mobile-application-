import React, { createContext, useState, useContext } from 'react';

const CURRENCIES = [
  { code: 'LKR', name: 'Sri Lankan Rupee', flag: '🇱🇰', symbol: 'Rs ' },
  { code: 'USD', name: 'US Dollar',         flag: '🇺🇸', symbol: '$' },
  { code: 'EUR', name: 'Euro',              flag: '🇪🇺', symbol: '€' },
  { code: 'GBP', name: 'British Pound',     flag: '🇬🇧', symbol: '£' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar',   flag: '🇨🇦', symbol: 'C$' },
  { code: 'JPY', name: 'Japanese Yen',      flag: '🇯🇵', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee',      flag: '🇮🇳', symbol: '₹' },
  { code: 'SGD', name: 'Singapore Dollar',  flag: '🇸🇬', symbol: 'S$' },
  { code: 'AED', name: 'UAE Dirham',        flag: '🇦🇪', symbol: 'AED ' },
];

const RATES_FROM_LKR = {
  LKR: 1,
  USD: 0.0033,
  EUR: 0.0030,
  GBP: 0.0026,
  AUD: 0.0051,
  CAD: 0.0045,
  JPY: 0.50,
  INR: 0.275,
  SGD: 0.0044,
  AED: 0.012,
};

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('LKR');

  const formatPrice = (priceInLKR) => {
    if (!priceInLKR && priceInLKR !== 0) return '';
    const rate = RATES_FROM_LKR[currency];
    const converted = parseFloat(priceInLKR) * rate;
    const currencyObj = CURRENCIES.find(c => c.code === currency);
    const symbol = currencyObj ? currencyObj.symbol : '';
    return `${symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      formatPrice,
      CURRENCIES,
      RATES_FROM_LKR
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
