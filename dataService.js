/**
 * dataService.js
 * Manages all data fetching: Binance REST candles, Binance WebSockets for Crypto prices,
 * and high-fidelity simulated real-time/historical feeds for Forex pairs.
 */

const DataService = (() => {
  let socket = null;
  const tickerCallbacks = {};
  const currentPrices = {
    BTCUSD: { price: 65420.00, change: 2.45, prevPrice: 65420.00 },
    ETHUSD: { price: 3420.50, change: -1.12, prevPrice: 3420.50 },
    SOLUSD: { price: 172.85, change: 5.62, prevPrice: 172.85 },
    XAUUSD: { price: 2385.40, change: 0.88, prevPrice: 2385.40 },
    EURUSD: { price: 1.08450, change: 0.12, prevPrice: 1.08450 },
    GBPUSD: { price: 1.25820, change: -0.05, prevPrice: 1.25820 },
    USDJPY: { price: 155.650, change: 0.35, prevPrice: 155.650 }
  };

  // Maps internal symbols to Binance pair names
  const cryptoSymbolMap = {
    BTCUSD: 'BTCUSDT',
    ETHUSD: 'ETHUSDT',
    SOLUSD: 'SOLUSDT'
  };

  /**
   * Initializes real-time WebSocket connection to Binance for crypto tickers.
   * Runs local tickers for Forex and triggers periodic tick updates.
   */
  function init() {
    initCryptoWebsocket();
    initForexSimulation();
  }

  /**
   * Set up connection to Binance WebSockets
   */
  function initCryptoWebsocket() {
    try {
      const streams = ['btcusdt@ticker', 'ethusdt@ticker', 'solusdt@ticker'].join('/');
      socket = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.s) {
          // Find our internal symbol
          let internalSymbol = null;
          for (const [key, val] of Object.entries(cryptoSymbolMap)) {
            if (val === data.s) {
              internalSymbol = key;
              break;
            }
          }

          if (internalSymbol) {
            const price = parseFloat(data.c);
            const change = parseFloat(data.P);
            
            updatePrice(internalSymbol, price, change);
          }
        }
      };

      socket.onerror = (err) => {
        console.error('Binance WebSocket error:', err);
      };

      socket.onclose = () => {
        console.log('Binance WebSocket closed, reconnecting in 5s...');
        setTimeout(initCryptoWebsocket, 5000);
      };
    } catch (e) {
      console.error('Failed to init crypto websocket:', e);
    }
  }

  /**
   * Set up high-fidelity ticking simulator for Forex and Commodities.
   */
  function initForexSimulation() {
    setInterval(() => {
      const forexSymbols = ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY'];
      
      forexSymbols.forEach(symbol => {
        const current = currentPrices[symbol];
        // Standard random walk
        const volatility = symbol === 'XAUUSD' ? 0.35 : 0.00012; // Gold moves faster
        const direction = Math.random() > 0.49 ? 1 : -1;
        const changeAmt = Math.random() * volatility * direction;
        
        const nextPrice = Math.max(0.001, current.price + changeAmt);
        
        // Slightly fluctuate change percentage
        const nextChange = current.change + (Math.random() > 0.5 ? 0.01 : -0.01) * direction;
        
        updatePrice(symbol, nextPrice, parseFloat(nextChange.toFixed(2)));
      });
    }, 1500 + Math.random() * 1000); // Ticks every 1.5 - 2.5 seconds
  }

  /**
   * Internal helper to update a price tracker and execute any registered callbacks.
   */
  function updatePrice(symbol, price, change) {
    const tracker = currentPrices[symbol];
    if (tracker) {
      tracker.prevPrice = tracker.price;
      tracker.price = price;
      tracker.change = change;

      // Trigger callback if defined
      if (tickerCallbacks[symbol]) {
        tickerCallbacks[symbol]({
          symbol,
          price,
          prevPrice: tracker.prevPrice,
          change,
          direction: price > tracker.prevPrice ? 'up' : price < tracker.prevPrice ? 'down' : 'flat'
        });
      }
    }
  }

  /**
   * Subscribe to real-time tick updates for a specific symbol
   */
  function subscribeTicker(symbol, callback) {
    tickerCallbacks[symbol] = callback;
    // Push current value immediately
    if (currentPrices[symbol]) {
      callback({
        symbol,
        price: currentPrices[symbol].price,
        prevPrice: currentPrices[symbol].prevPrice,
        change: currentPrices[symbol].change,
        direction: 'flat'
      });
    }
  }

  /**
   * Retrieves 100 historical candles.
   * If Crypto: Fetches live data from Binance REST API.
   * If Forex: Generates high-fidelity structured candles programmatically to match chart specs.
   * 
   * @param {string} symbol - e.g. "BTCUSD", "EURUSD"
   * @param {string} interval - e.g. "5m", "15m", "1h", "4h", "1d"
   * @returns {Promise<Array>} List of candles {time, open, high, low, close, volume}
   */
  async function fetchCandles(symbol, interval) {
    if (cryptoSymbolMap[symbol]) {
      return fetchCryptoCandles(cryptoSymbolMap[symbol], interval);
    } else {
      return generateForexCandles(symbol, interval);
    }
  }

  /**
   * Fetches actual candles from Binance REST endpoint.
   */
  async function fetchCryptoCandles(binanceSymbol, interval) {
    try {
      // Map timeframe buttons to Binance interval codes
      const binanceInterval = interval.toLowerCase(); // 5m, 15m, 1h, 4h, 1d are identical
      const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${binanceInterval}&limit=100`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      
      const data = await response.json();
      return data.map(k => ({
        time: parseInt(k[0]),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5])
      }));
    } catch (e) {
      console.warn(`Failed to fetch crypto candles from Binance for ${binanceSymbol}, falling back to mock generator:`, e);
      return generateFallbackCandles(binanceSymbol, interval);
    }
  }

  /**
   * Generates highly realistic and consistent historical candle data for Forex.
   * It uses a deterministic seed based on symbol, timeframe, and day to keep the chart consistent,
   * while shifting candles slowly as time moves forward.
   */
  function generateForexCandles(symbol, interval) {
    return new Promise((resolve) => {
      const candles = [];
      const now = Date.now();
      
      // Timeframe intervals in ms
      const intervalMsMap = {
        '5m': 5 * 60 * 1000,
        '15m': 15 * 60 * 1000,
        '1h': 60 * 60 * 1000,
        '4h': 4 * 60 * 60 * 1000,
        '1d': 24 * 60 * 60 * 1000
      };
      
      const step = intervalMsMap[interval] || 15 * 60 * 1000;
      
      // Determine base quote
      const currentVal = currentPrices[symbol].price;
      
      // Build deterministically structured candles based on symbol-based seed
      let prevClose = currentVal - (currentVal * 0.05); // Start 5% lower
      
      // Create seed based on characters of symbol
      let seed = 0;
      for (let i = 0; i < symbol.length; i++) {
        seed += symbol.charCodeAt(i);
      }

      // Pseudo-random generator with seed
      function seededRandom() {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
      }

      // Determine major macro trend: 1 = Bullish, -1 = Bearish
      const macroTrend = seededRandom() > 0.45 ? 1 : -1;
      
      for (let i = 99; i >= 0; i--) {
        const time = now - (i * step);
        
        // Volatility multiplier
        let volMultiplier = 0.0015; // 0.15% average candle size
        if (symbol === 'XAUUSD') volMultiplier = 0.003; // Gold has higher range
        if (interval === '1h') volMultiplier *= 2;
        if (interval === '4h') volMultiplier *= 4;
        if (interval === '1d') volMultiplier *= 10;
        
        // Generate candle bodies
        const drift = macroTrend * (seededRandom() * 0.2); // slight bias
        const magnitude = (seededRandom() - 0.5 + drift) * volMultiplier;
        
        const open = prevClose;
        const close = open * (1 + magnitude);
        
        // Wicks
        const maxBody = Math.max(open, close);
        const minBody = Math.min(open, close);
        
        const highWick = maxBody * (1 + seededRandom() * volMultiplier * 0.5);
        const lowWick = minBody * (1 - seededRandom() * volMultiplier * 0.5);
        
        // Standard FVG or Order Block pattern injecting occasionally
        let high = highWick;
        let low = lowWick;
        
        // Create an institutional impulse (Fvg/Order Block) at candle 70, 71, 72 to analyze
        if (i === 30 || i === 50 || i === 75) {
          const impulseDir = macroTrend;
          const size = volMultiplier * 3 * impulseDir;
          low = impulseDir > 0 ? open * 0.995 : open * (1 + size);
          high = impulseDir > 0 ? open * (1 + size) : open * 1.005;
        }

        const volBase = symbol === 'XAUUSD' ? 5000 : 100000;
        const volume = Math.floor(seededRandom() * volBase + volBase * 0.2);

        candles.push({
          time,
          open,
          high,
          low,
          close,
          volume
        });
        
        prevClose = close;
      }
      
      // Make sure the last candle close lines up with our current real-time price!
      const lastCandle = candles[99];
      const diff = currentVal - lastCandle.close;
      candles[99].close = currentVal;
      if (currentVal > lastCandle.open) {
        candles[99].high = Math.max(candles[99].high, currentVal);
      } else {
        candles[99].low = Math.min(candles[99].low, currentVal);
      }
      
      resolve(candles);
    });
  }

  /**
   * Fallback mock candle generator for Crypto when Binance REST is blocked.
   */
  function generateFallbackCandles(binanceSymbol, interval) {
    // Normalizes to standard symbol and forwards to forex mock
    const stdSymbol = binanceSymbol.replace('USDT', 'USD');
    return generateForexCandles(stdSymbol, interval);
  }

  function getLatestPrice(symbol) {
    return currentPrices[symbol] ? currentPrices[symbol].price : null;
  }

  return {
    init,
    subscribeTicker,
    fetchCandles,
    getLatestPrice,
    updatePrice
  };
})();
