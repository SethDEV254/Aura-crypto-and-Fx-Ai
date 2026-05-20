/**
 * newsService.js
 * Generates and manages financial sentiment indices, live calendar warnings (FOMC, CPI, NFP),
 * and dynamic news streams tailored to Crypto and Forex assets.
 */

const NewsService = (() => {

  const calendarEvents = [
    { type: 'FOMC', desc: 'Federal Funds Rate decision', impact: 'extreme', filtered: true },
    { type: 'CPI', desc: 'US Consumer Inflation YoY', impact: 'high', filtered: true },
    { type: 'NFP', desc: 'Non-Farm Employment Change', impact: 'high', filtered: true },
    { type: 'ECB', desc: 'ECB Monetary Policy Statement', impact: 'medium', filtered: true }
  ];

  // News headlines catalog mapped by category
  const newsCatalog = {
    crypto: [
      { headline: "SEC approves Options Trading on Spot Bitcoin ETFs, boosting structural liquidity.", impact: "HIGH", sentiment: "Bullish" },
      { headline: "Whale transaction trackers report massive $1.2B accumulation at core support levels.", impact: "HIGH", sentiment: "Bullish" },
      { headline: "On-chain transaction fees touch multi-month lows as network scale expands.", impact: "MEDIUM", sentiment: "Bullish" },
      { headline: "Global computing capacity hit a record 712 EH/s ahead of miner revisions.", impact: "MEDIUM", sentiment: "Bullish" },
      { headline: "Crypto regulatory shifts in East Asia trigger temporary minor leverage washouts.", impact: "MEDIUM", sentiment: "Bearish" },
      { headline: "Derivative liquidity heatmaps indicate highly congested short liquidations above $66.5k.", impact: "HIGH", sentiment: "Bullish" }
    ],
    forex: [
      { headline: "Fed Chairman hints at extended rate pauses amid resilient GDP prints.", impact: "HIGH", sentiment: "Bearish" },
      { headline: "European Central Bank expands liquidity reserves to shield regional bonds.", impact: "MEDIUM", sentiment: "Bullish" },
      { headline: "Bank of England raises inflation warnings as retail earnings climb.", impact: "HIGH", sentiment: "Bullish" },
      { headline: "US dollar index (DXY) stabilizes at 104.80 following regional treasury demand.", impact: "MEDIUM", sentiment: "Bearish" },
      { headline: "Safe-haven asset pools show strong institutional capital flows into Gold and Treasuries.", impact: "HIGH", sentiment: "Bullish" },
      { headline: "Flash PMI statistics indicate moderate industrial cooling across manufacturing clusters.", impact: "MEDIUM", sentiment: "Bearish" }
    ]
  };

  /**
   * Retrieves calendar alerts list
   */
  function getCalendarAlerts(symbol) {
    // If Gold or Forex, show FOMC, CPI, NFP. If Crypto, show FOMC and CPI.
    const isCrypto = ['BTCUSD', 'ETHUSD', 'SOLUSD'].includes(symbol);
    if (isCrypto) {
      return calendarEvents.filter(e => e.type !== 'ECB');
    }
    return calendarEvents;
  }

  /**
   * Generates a dynamic retail sentiment ratio based on the active pair
   */
  function getSentimentIndices(symbol) {
    let seed = 0;
    for (let i = 0; i < symbol.length; i++) {
      seed += symbol.charCodeAt(i);
    }
    
    // Deterministic base percentage between 48% and 78%
    const x = Math.sin(seed) * 10000;
    const baseBullPct = Math.round(52 + (x - Math.floor(x)) * 20);
    const bearPct = 100 - baseBullPct;
    
    return {
      bullishPct: baseBullPct,
      bearishPct: bearPct
    };
  }

  /**
   * Retrieves a dynamic subset of headlines related to selected pair
   */
  function getNewsHeadlines(symbol) {
    const isCrypto = ['BTCUSD', 'ETHUSD', 'SOLUSD'].includes(symbol);
    const catalog = isCrypto ? newsCatalog.crypto : newsCatalog.forex;
    
    // Shuffle slightly based on current minutes to make it feel fresh but consistent
    const currentMin = new Date().getMinutes();
    const result = [...catalog];
    
    // Deterministic sort based on minutes
    result.sort((a, b) => {
      const charCodeA = a.headline.charCodeAt(0);
      const charCodeB = b.headline.charCodeAt(0);
      return ((charCodeA + currentMin) % 3) - ((charCodeB + currentMin) % 3);
    });
    
    return result.slice(0, 3); // Take top 3
  }

  /**
   * Simulates a sudden FOMC interest rate decision spike event.
   * Prepends a critical alert into the live calendar feed.
   */
  function triggerFOMCSpike() {
    const spikeEvent = {
      type: 'FOMC',
      desc: '⚠ EMERGENCY RATE DECISION — 50bps Hike',
      impact: 'extreme',
      filtered: false
    };
    // Prepend so it appears at the top of the calendar
    calendarEvents.unshift(spikeEvent);
    return spikeEvent;
  }

  return {
    getCalendarAlerts,
    getSentimentIndices,
    getNewsHeadlines,
    triggerFOMCSpike
  };
})();
