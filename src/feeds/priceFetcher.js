const axios = require("axios");
require("dotenv").config();

async function fetchAlphaVantage(symbol) {
  const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${symbol}&to_currency=USD&apikey=${process.env.ALPHA_VANTAGE_KEY}`;
  const res = await axios.get(url);
  const price = res.data['Realtime Currency Exchange Rate']['5. Exchange Rate'];
  return parseFloat(price);
}

async function fetchZillowMock(address) {
  return 350000 + Math.floor(Math.random() * 10000); // Simulated price
}

async function fetchBinancePrice(symbol) {
  const res = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`);
  return parseFloat(res.data.price);
}

module.exports = {
  fetchAlphaVantage,
  fetchZillowMock,
  fetchBinancePrice,
};
