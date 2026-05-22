/**
 * app.js
 * Core application controller. Developed by @ STARICO // System Design: ANTIGRAVITY.
 * Orchestrates UI interactions, coordinates tickers, mounts TradingView charts,
 * runs scanner workflows, and drives metrics calculators.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    selectedSymbol: 'BTCUSD',
    selectedType: 'crypto',
    selectedTimeframe: '15m',
    selectedMode: 'intraday',
    tvWidget: null,
    activeSetup: null, // Holds the current active analysis report data
    adminConfig: {
      forcedBias: 'auto',
      confidenceMult: 1.0,
      forcedVol: 'auto',
      systemStatus: 'online'
    },
    isOfflineMode: false,
    latencyOverride: null,
    isPremiumActive: false,
    activeUsersCount: 1284,
    premiumMrr: 12840,
    paymentLogs: [
      { time: '02:05:12', gateway: 'M-Pesa', desc: 'Subscription auto-renew standard check', status: 'completed' },
      { time: '01:54:30', gateway: 'Crypto', desc: 'TXID 0x3b89...f9a1 validated', status: 'completed' },
      { time: '01:12:05', gateway: 'PayPal', desc: 'Express API payment hand-off', status: 'completed' }
    ]
  };

  // DOM Elements Selector Cache
  const els = {
    logoArea: document.querySelector('.logo-area'),
    currentTime: document.getElementById('current-time'),
    latencyVal: document.getElementById('latency-val'),
    terminalCommandLine: document.getElementById('terminal-command-line'),
    
    // Ticker tape elements
    tickerBTC: document.getElementById('ticker-BTC'),
    tickerETH: document.getElementById('ticker-ETH'),
    tickerXAU: document.getElementById('ticker-XAU'),
    tickerEUR: document.getElementById('ticker-EUR'),
    tickerGBP: document.getElementById('ticker-GBP'),

    // Control tabs
    modeScalping: document.getElementById('mode-scalping'),
    modeIntraday: document.getElementById('mode-intraday'),
    modeSwing: document.getElementById('mode-swing'),
    tfBtns: document.querySelectorAll('.tf-btn'),
    assetRows: document.querySelectorAll('.asset-row'),

    // Main Scanning Area
    activePairTitle: document.getElementById('active-pair-title'),
    runAnalysisBtn: document.getElementById('run-analysis-btn'),
    resultsIdleState: document.getElementById('results-idle-state'),
    resultsLoadingState: document.getElementById('results-loading-state'),
    resultsOutputState: document.getElementById('results-output-state'),
    loadingStatusText: document.getElementById('loading-status-text'),
    scanProgressBar: document.getElementById('scan-progress-bar'),

    // Main Output slots
    outputPairBadge: document.getElementById('output-pair-badge'),
    outputTfBadge: document.getElementById('output-tf-badge'),
    outputModeBadge: document.getElementById('output-mode-badge'),
    outputBiasBadge: document.getElementById('output-bias-badge'),
    outputBiasText: document.getElementById('output-bias-text'),
    outputEntryPrice: document.getElementById('output-entry-price'),
    outputSlPrice: document.getElementById('output-sl-price'),
    outputSlDetails: document.getElementById('output-sl-details'),
    outputTp1Price: document.getElementById('output-tp1-price'),
    outputTp2Price: document.getElementById('output-tp2-price'),
    outputTp3Price: document.getElementById('output-tp3-price'),
    outputTp1Pct: document.getElementById('output-tp1-pct'),
    outputTp2Pct: document.getElementById('output-tp2-pct'),
    outputTp3Pct: document.getElementById('output-tp3-pct'),
    outputConfidenceVal: document.getElementById('output-confidence-val'),
    radialProgressFill: document.getElementById('radial-progress-fill'),
    outputRrVal: document.getElementById('output-rr-val'),
    outputSuccessProbability: document.getElementById('output-success-probability'),
    outputLeverageRisk: document.getElementById('output-leverage-risk'),
    outputVolStatus: document.getElementById('output-vol-status'),
    outputNewsFiltered: document.getElementById('output-news-filtered'),
    outputStructureText: document.getElementById('output-structure-text'),
    outputAnalysisNarrative: document.getElementById('output-analysis-narrative'),

    // Metrics panel slots
    mtf5m: document.getElementById('mtf-5m'),
    mtf15m: document.getElementById('mtf-15m'),
    mtf1h: document.getElementById('mtf-1h'),
    mtf4h: document.getElementById('mtf-4h'),
    mtf1d: document.getElementById('mtf-1d'),
    
    smcObRange: document.getElementById('smc-ob-range'),
    smcObStatus: document.getElementById('smc-ob-status'),
    smcFvgRange: document.getElementById('smc-fvg-range'),
    smcFvgStatus: document.getElementById('smc-fvg-status'),
    smcLiqLevel: document.getElementById('smc-liq-level'),
    smcLiqStatus: document.getElementById('smc-liq-status'),
    smcRsiVal: document.getElementById('smc-rsi-val'),
    smcMacdVal: document.getElementById('smc-macd-val'),
    smcVolumeVal: document.getElementById('smc-volume-val'),
    
    sentimentBullPct: document.getElementById('sentiment-bull-pct'),
    sentimentBearPct: document.getElementById('sentiment-bear-pct'),
    calendarAlertsList: document.getElementById('calendar-alerts-list'),

    // Calculator inputs & results
    calcBalance: document.getElementById('calc-balance'),
    calcRiskPct: document.getElementById('calc-risk-pct'),
    calcResRiskAmt: document.getElementById('calc-res-risk-amt'),
    calcResPosSize: document.getElementById('calc-res-pos-size'),
    calcResLev: document.getElementById('calc-res-lev'),
    
    // Maximize chart elements
    maximizeChartBtn: document.getElementById('maximize-chart-btn'),
    chartContainerWrapper: document.querySelector('.chart-container-wrapper'),

    // Admin panel elements
    adminTrigger: document.getElementById('admin-trigger'),
    adminPanel: document.getElementById('admin-panel'),
    closeAdminBtn: document.getElementById('close-admin-btn'),
    adminNavBtns: document.querySelectorAll('.admin-nav-btn'),
    adminTabContents: document.querySelectorAll('.admin-tab-content'),
    adminForceBias: document.getElementById('admin-force-bias'),
    adminConfidenceMult: document.getElementById('admin-confidence-mult'),
    confidenceMultVal: document.getElementById('confidence-mult-val'),
    adminForceVol: document.getElementById('admin-force-vol'),
    adminSystemStatus: document.getElementById('admin-system-status'),
    adminTriggerFomc: document.getElementById('admin-trigger-fomc'),
    adminBtcPrice: document.getElementById('admin-btc-price'),
    adminGoldPrice: document.getElementById('admin-gold-price'),
    adminApplyPrices: document.getElementById('admin-apply-prices'),
    saveAdminBtn: document.getElementById('save-admin-btn'),

    // Admin login elements
    adminLogin: document.getElementById('admin-login'),
    adminUsername: document.getElementById('admin-username'),
    adminPassword: document.getElementById('admin-password'),
    adminLoginBtn: document.getElementById('admin-login-btn'),
    loginError: document.getElementById('login-error'),
    loginErrorText: document.getElementById('login-error-text'),

    // Premium Subscription paywall & controls
    premiumUpgradeBtn: document.getElementById('premium-upgrade-btn'),
    premiumPaywall: document.getElementById('premium-paywall'),
    closePremiumBtn: document.getElementById('close-premium-btn'),
    payTabBtns: document.querySelectorAll('.pay-tab-btn'),
    gatewayContents: document.querySelectorAll('.gateway-content'),
    mpesaPhone: document.getElementById('mpesa-phone'),
    mpesaSubmitBtn: document.getElementById('mpesa-submit-btn'),
    mpesaStatusBox: document.getElementById('mpesa-status-box'),
    paypalSubmitBtn: document.getElementById('paypal-submit-btn'),
    paypalStatusBox: document.getElementById('paypal-status-box'),
    copyWalletBtn: document.getElementById('copy-wallet-btn'),
    cryptoWalletAddr: document.getElementById('crypto-wallet-addr'),
    cryptoTxid: document.getElementById('crypto-txid'),
    cryptoSubmitBtn: document.getElementById('crypto-submit-btn'),
    cryptoStatusBox: document.getElementById('crypto-status-box'),
    adminPremiumToggle: document.getElementById('admin-premium-toggle'),
    adminMetricsUsers: document.getElementById('admin-metrics-users'),
    adminMetricsMrr: document.getElementById('admin-metrics-mrr'),
    adminPaymentLogs: document.getElementById('admin-payment-logs'),

    // Risk Disclaimer Modal
    riskDisclaimerModal: document.getElementById('risk-disclaimer-modal'),
    disclaimerAcceptCheckbox: document.getElementById('disclaimer-accept-checkbox'),
    disclaimerAcceptBtn: document.getElementById('disclaimer-accept-btn')
  };

  // TradingView Symbol Mapping
  const tvSymbolMap = {
    BTCUSD: 'BINANCE:BTCUSDT',
    ETHUSD: 'BINANCE:ETHUSDT',
    SOLUSD: 'BINANCE:SOLUSDT',
    XAUUSD: 'OANDA:XAUUSD',
    EURUSD: 'FX:EURUSD',
    GBPUSD: 'FX:GBPUSD',
    USDJPY: 'FX:USDJPY'
  };

  // Timeframe API to TV mapping
  const tvTfMap = {
    '5m': '5',
    '15m': '15',
    '1h': '60',
    '4h': '240',
    '1d': 'D'
  };

  // Decimal precision tracker
  const decimalPrecision = {
    BTCUSD: 0, ETHUSD: 1, SOLUSD: 2, XAUUSD: 2, EURUSD: 5, GBPUSD: 5, USDJPY: 3
  };

  /* ==========================================================================
     Initialization & Event Listeners
     ========================================================================== */

  // Check Premium Status on Load - MANDATORY PAYWALL FOR NEW USERS
  checkPremiumStatusOnLoad();

  // Check Risk Disclaimer Acceptance - DISABLED for immediate access
  // checkRiskDisclaimerStatus();

  // Initialize Services
  DataService.init();
  updateTime();
  setInterval(updateTime, 1000);
  
  // Simulated Ping
  setInterval(() => {
    const ping = Math.floor(25 + Math.random() * 20);
    els.latencyVal.innerText = `${ping}ms`;
  }, 4000);

  // Load Initial Ticker Subscriptions
  setupTickerSubscribers();

  // Load Initial Chart
  mountTradingViewChart(state.selectedSymbol, state.selectedTimeframe);

  // Bind Event Listeners
  bindEvents();

  // Bind Admin Panel Event Listeners
  bindAdminEvents();

  // Bind Premium paywall Event Listeners
  bindPremiumEvents();

  // Populate mock data initially
  updateAdminSubStats();
  renderAdminPaymentLogs();

  // Update Sentiment and Event widget initially
  syncNewsSentimentWidget(state.selectedSymbol);

  // Dynamic Auto-Scan on startup (triggered 1 second after chart frame loads)
  setTimeout(() => {
    // Only trigger scan if premium is active
    if (state.isPremiumActive) {
      triggerAIScanWorkflow();
    }
  }, 1000);

  /**
   * Subscribes to DataService ticks to update DOM price blocks
   */
  function setupTickerSubscribers() {
    const symbols = ['BTCUSD', 'ETHUSD', 'XAUUSD', 'EURUSD', 'GBPUSD', 'SOLUSD', 'USDJPY'];
    
    symbols.forEach(sym => {
      // Subscribes callback
      DataService.subscribeTicker(sym, (tick) => {
        // 1. Update header tape elements if available
        updateHeaderTape(tick);
        
        // 2. Update assets list picker values
        updateAssetPickerListPrice(tick);

        // 3. If the ticked symbol matches our active scanning pair, update the active indicators
        if (sym === state.selectedSymbol) {
          updateRealtimeIndicators(tick);
        }
      });
    });
  }

  /**
   * Bind event listeners for UI buttons and fields
   */
  function bindEvents() {
    // Mode Buttons
    [els.modeScalping, els.modeIntraday, els.modeSwing].forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetMode = e.currentTarget.dataset.mode;
        if (targetMode === 'swing' && !state.isPremiumActive) {
          openPremiumPaywall('Swing Trading Mode');
          return;
        }
        document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
        const activeTab = e.currentTarget;
        activeTab.classList.add('active');
        state.selectedMode = activeTab.dataset.mode;
        
        els.terminalCommandLine.innerText = `AURA CRYPTO & FX AI v2.8.5: Configured trading mode to [${state.selectedMode.toUpperCase()}]. Recalculating setups.`;
        
        // Automatically switch typical TF based on mode to help user
        if (state.selectedMode === 'scalping') {
          switchTimeframe('5m');
        } else if (state.selectedMode === 'swing') {
          switchTimeframe('4h');
        } else {
          switchTimeframe('15m');
        }
      });
    });

    // Timeframe Buttons
    els.tfBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        els.tfBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        switchTimeframe(e.target.dataset.tf);
      });
    });

    // Asset Selection Rows
    els.assetRows.forEach(row => {
      row.addEventListener('click', (e) => {
        const targetSymbol = e.currentTarget.dataset.symbol;
        const targetType = e.currentTarget.dataset.type;
        const premiumSymbols = ['XAUUSD', 'GBPUSD', 'USDJPY'];
        if (premiumSymbols.includes(targetSymbol) && !state.isPremiumActive) {
          openPremiumPaywall(`${targetSymbol} Asset Pair`);
          return;
        }
        els.assetRows.forEach(r => r.classList.remove('active'));
        const activeRow = e.currentTarget;
        activeRow.classList.add('active');
        
        const nextSymbol = activeRow.dataset.symbol;
        const nextType = activeRow.dataset.type;
        
        switchAsset(nextSymbol, nextType);
      });
    });

    // Run AI Scan Button
    els.runAnalysisBtn.addEventListener('click', () => {
      triggerAIScanWorkflow();
    });

    // Calculator inputs
    [els.calcBalance, els.calcRiskPct].forEach(input => {
      input.addEventListener('input', () => {
        runDynamicRiskCalculator();
      });
    });

    // Maximize/Restore Live Chart Trigger
    if (els.maximizeChartBtn) {
      els.maximizeChartBtn.addEventListener('click', () => {
        const isMax = els.chartContainerWrapper.classList.toggle('maximized');
        if (isMax) {
          els.maximizeChartBtn.innerHTML = '<i class="fa-solid fa-compress"></i>';
          els.maximizeChartBtn.title = "Restore Chart Workspace";
          els.terminalCommandLine.innerText = `AURA CRYPTO & FX AI v2.8.5: Live TradingView workspace maximized for deep technical analysis.`;
        } else {
          els.maximizeChartBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';
          els.maximizeChartBtn.title = "Maximize Chart Workspace";
          els.terminalCommandLine.innerText = `AURA CRYPTO & FX AI v2.8.5: TradingView workspace restored to standard layout.`;
        }
      });
    }
  }

  /* ==========================================================================
     UI Dynamic State Update Handlers
     ========================================================================== */

  function updateTime() {
    const now = new Date();
    const utcStr = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    els.currentTime.innerText = utcStr;
  }

  /**
   * Refreshes header currency prices with micro pulsing animation.
   */
  function updateHeaderTape(tick) {
    let elementId = null;
    if (tick.symbol === 'BTCUSD') elementId = els.tickerBTC;
    else if (tick.symbol === 'ETHUSD') elementId = els.tickerETH;
    else if (tick.symbol === 'XAUUSD') elementId = els.tickerXAU;
    else if (tick.symbol === 'EURUSD') elementId = els.tickerEUR;
    else if (tick.symbol === 'GBPUSD') elementId = els.tickerGBP;

    if (elementId) {
      const priceText = elementId.querySelector('.ticker-price');
      const changeText = elementId.querySelector('.ticker-change');
      
      const prevPrice = tick.prevPrice;
      const price = tick.price;
      const precision = decimalPrecision[tick.symbol];

      priceText.innerText = price.toFixed(precision);
      changeText.innerText = `${tick.change > 0 ? '+' : ''}${tick.change.toFixed(2)}%`;
      
      // Apply blink pulse styles
      if (price > prevPrice) {
        priceText.className = 'ticker-price text-neon-green';
        elementId.classList.add('price-pulse-up');
        setTimeout(() => elementId.classList.remove('price-pulse-up'), 500);
      } else if (price < prevPrice) {
        priceText.className = 'ticker-price text-neon-red';
        elementId.classList.add('price-pulse-down');
        setTimeout(() => elementId.classList.remove('price-pulse-down'), 500);
      }
      
      // Toggle percentage colors
      changeText.className = `ticker-change ${tick.change >= 0 ? 'bull' : 'bear'}`;
    }
  }

  /**
   * Refreshes sidebar currency rates
   */
  function updateAssetPickerListPrice(tick) {
    const listPriceEl = document.getElementById(`list-price-${tick.symbol}`);
    const listChangeEl = document.getElementById(`list-change-${tick.symbol}`);
    
    if (listPriceEl && listChangeEl) {
      const precision = decimalPrecision[tick.symbol];
      listPriceEl.innerText = tick.price.toFixed(precision);
      
      listChangeEl.innerText = `${tick.change > 0 ? '+' : ''}${tick.change.toFixed(2)}%`;
      listChangeEl.className = `asset-pct ${tick.change >= 0 ? 'bull' : 'bear'}`;
    }
  }

  /**
   * Ticking update for active signals or simple real-time metrics
   */
  function updateRealtimeIndicators(tick) {
    // If we have an active setup loaded, dynamically update the raw entry price or distance to SL slightly
    if (state.activeSetup && state.activeSetup.symbol === tick.symbol) {
      // If price breaks Stop Loss, we print alert. If price ticks towards targets, simulate
      const current = tick.price;
      const sl = state.activeSetup.stopLoss;
      const entry = state.activeSetup.entryPrice;
      const bias = state.activeSetup.bias;
      
      let broken = false;
      if (bias === 'BULLISH' && current <= sl) broken = true;
      if (bias === 'BEARISH' && current >= sl) broken = true;
      
      if (broken) {
        els.terminalCommandLine.innerText = `[VOLATILITY ALERT]: Price crossed Stop Loss barrier (${sl}) on ${tick.symbol}! Preserving capital parameters.`;
      }
    }
  }

  /**
   * Changes active timeframe and triggers chart sync
   */
  function switchTimeframe(tf) {
    state.selectedTimeframe = tf;
    els.activePairTitle.innerHTML = `<i class="fa-solid fa-chart-line text-neon-green"></i> ${state.selectedSymbol} (${state.selectedTimeframe.toUpperCase()} Chart)`;
    els.terminalCommandLine.innerText = `AURA CRYPTO & FX AI v2.8.5: Selected timeframe altered to [${tf.toUpperCase()}]. Historical buffer recalibrated.`;
    
    // Sync chart
    if (state.tvWidget) {
      try {
        state.tvWidget.setSymbol(tvSymbolMap[state.selectedSymbol], tvTfMap[tf]);
      } catch (e) {
        console.warn("Failed to set symbol on widget:", e);
      }
    }
    
    // Auto-update multi-timeframe matrices biases deterministically
    syncTimeframeMatrix(state.selectedSymbol);
    
    // Auto-trigger scan
    triggerAIScanWorkflow();
  }

  /**
   * Changes active currency asset
   */
  function switchAsset(symbol, type) {
    state.selectedSymbol = symbol;
    state.selectedType = type;
    
    els.activePairTitle.innerHTML = `<i class="fa-solid fa-chart-line text-neon-green"></i> ${symbol} (${state.selectedTimeframe.toUpperCase()} Chart)`;
    els.terminalCommandLine.innerText = `AURA CRYPTO & FX AI v2.8.5: Asset workspace shifted to [${symbol}]. Live exchange stream connected.`;
    
    // Reload TV Chart symbol
    if (state.tvWidget) {
      try {
        state.tvWidget.setSymbol(tvSymbolMap[symbol], tvTfMap[state.selectedTimeframe]);
      } catch (e) {
        mountTradingViewChart(symbol, state.selectedTimeframe);
      }
    } else {
      mountTradingViewChart(symbol, state.selectedTimeframe);
    }

    // Refresh sentiment & news lists
    syncNewsSentimentWidget(symbol);
    
    // Sync timeframe grid confluences
    syncTimeframeMatrix(symbol);
    
    // Auto-trigger scan on asset swap
    triggerAIScanWorkflow();
  }

  /* ==========================================================================
     TradingView Widget Mounting
     ========================================================================== */

  function mountTradingViewChart(symbol, timeframe) {
    const tvSymbol = tvSymbolMap[symbol] || 'BINANCE:BTCUSDT';
    const tvInterval = tvTfMap[timeframe] || '15';
    
    try {
      state.tvWidget = new TradingView.widget({
        "autosize": true,
        "symbol": tvSymbol,
        "interval": tvInterval,
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "toolbar_bg": "#0d111d",
        "enable_publishing": false,
        "hide_side_toolbar": false,
        "allow_symbol_change": false,
        "container_id": "tradingview-chart-container",
        "studies": [
          "RSI@tv-basicstudies",
          "MACD@tv-basicstudies"
        ],
        "loading_screen": {
          "backgroundColor": "#06080e",
          "foregroundColor": "#00f0ff"
        }
      });
    } catch (e) {
      console.error("Failed to load TradingView chart widget script. Using placeholder.", e);
      document.getElementById('tradingview-chart-container').innerHTML = `
        <div style="display:flex; justify-content:center; align-items:center; height:100%; font-family:var(--font-mono); font-size:12px; color:var(--text-muted); padding:20px; text-align:center;">
          <i class="fa-solid fa-triangle-exclamation" style="margin-right:8px; color:var(--neon-amber);"></i> 
          TRADINGVIEW ADVANCED PLUG-IN SECURING STREAM...
        </div>
      `;
    }
  }

  /* ==========================================================================
     Sidebar Widgets Matrices Synchronizers
     ========================================================================== */

  /**
   * Refreshes timeframe grid color biases deterministically based on active pair
   */
  function syncTimeframeMatrix(symbol) {
    let seed = 0;
    for (let i = 0; i < symbol.length; i++) {
      seed += symbol.charCodeAt(i);
    }

    const tfs = ['5m', '15m', '1h', '4h', '1d'];
    tfs.forEach((tf, index) => {
      // Deterministic calculation
      const val = Math.sin(seed + index) * 1000;
      const isBullish = (val - Math.floor(val)) > 0.46;
      
      const el = document.getElementById(`mtf-${tf}`);
      if (el) {
        if (isBullish) {
          el.className = 'mtf-status bull';
          el.innerHTML = `<i class="fa-solid fa-circle-arrow-up"></i> BULLISH`;
        } else {
          el.className = 'mtf-status bear';
          el.innerHTML = `<i class="fa-solid fa-circle-arrow-down"></i> BEARISH`;
        }
      }
    });
  }

  /**
   * Syncs news headlines, retail sentiment metrics, and FOMC impact alerts
   */
  function syncNewsSentimentWidget(symbol) {
    // 1. Retail sentiment bar
    const sentiment = NewsService.getSentimentIndices(symbol);
    els.sentimentBullPct.style.width = `${sentiment.bullishPct}%`;
    els.sentimentBullPct.innerText = `${sentiment.bullishPct}%`;
    els.sentimentBearPct.style.width = `${sentiment.bearishPct}%`;
    els.sentimentBearPct.innerText = `${sentiment.bearishPct}%`;

    // 2. High impact economic calendar
    const calendar = NewsService.getCalendarAlerts(symbol);
    els.calendarAlertsList.innerHTML = '';
    
    calendar.forEach(event => {
      const card = document.createElement('div');
      card.className = `event-alert ${event.impact === 'extreme' ? 'impact-high' : 'impact-medium'}`;
      card.innerHTML = `
        <div class="evt-title">
          <span class="evt-badge">${event.type}</span>
          <span>${event.desc}</span>
        </div>
        <div class="evt-footer">
          <span>Impact: <strong class="${event.impact === 'extreme' ? 'red-text' : 'amber-text'}">${event.impact.toUpperCase()}</strong></span>
          <span>Filtered: <strong class="green-text">${event.filtered ? 'YES' : 'NO'}</strong></span>
        </div>
      `;
      els.calendarAlertsList.appendChild(card);
    });
  }

  /* ==========================================================================
     AI Scanning Trigger Workflow & UI Renderer
     ========================================================================== */

  async function triggerAIScanWorkflow() {
    // Disclaimer check removed - allow immediate scanning
    // Users can access disclaimer info in documentation
    
    // Swap UI state to loader
    els.resultsIdleState.classList.add('hidden');
    els.resultsOutputState.classList.add('hidden');
    els.resultsLoadingState.classList.remove('hidden');
    els.scanProgressBar.style.width = '0%';
    
    // Smooth scroll the scanning console into view so the progress is immediately visible
    setTimeout(() => {
      els.resultsLoadingState.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
    
    els.runAnalysisBtn.disabled = true;
    els.runAnalysisBtn.classList.add('scanning-active');

    // Steps logging sequence
    const steps = [
      { pct: 0, text: "INITIALIZING QUANTUM INFERENCE CORES..." },
      { pct: 15, text: "CONNECTING TO EXCHANGE API DATA CHANNELS..." },
      { pct: 30, text: "RETRIEVING HISTORICAL CANDLE DATA BUFFER..." },
      { pct: 45, text: "COMPUTING FRACTAL SWINGS & INDICATORS (RSI, MACD, EMA 50)..." },
      { pct: 65, text: "SCANNING STRUCTURE FOR LIQUIDITY POOLS & SWEEPS..." },
      { pct: 80, text: "LOCATING FAIR VALUE GAPS (FVG) & ORDER BLOCKS (OB)..." },
      { pct: 92, text: "INTEGRATING CAPITAL PRESERVATION AND RISK FILTERS..." },
      { pct: 100, text: "QUANTUM TRADE SIGNAL COMPILED." }
    ];

    // Play logs step by step in the UI
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      // Update text
      els.loadingStatusText.innerText = step.text;
      els.terminalCommandLine.innerText = `AURA CRYPTO & FX AI: [SCANNER INFERENCE PROCESS] ${step.text}`;
      
      // Animate progress bar fill
      els.scanProgressBar.style.width = `${step.pct}%`;
      
      // Wait dynamic speed
      const delay = 350 + Math.random() * 250;
      await new Promise(r => setTimeout(r, delay));
    }

    // Now execute core mathematical indicator calculation on client-side!
    try {
      console.log(`[SCAN] Starting analysis for ${state.selectedSymbol} on ${state.selectedTimeframe}`);
      console.log(`[SCAN] Mode: ${state.selectedMode}, Admin Config:`, state.adminConfig);
      
      // 1. Fetch live historical candles
      console.log(`[SCAN] Fetching candles...`);
      const candles = await DataService.fetchCandles(state.selectedSymbol, state.selectedTimeframe);
      console.log(`[SCAN] Fetched ${candles ? candles.length : 0} candles`);
      
      // Validate candles
      if (!candles || candles.length < 50) {
        throw new Error(`Insufficient candle data: only ${candles ? candles.length : 0} candles received`);
      }
      
      // Log first and last candle for verification
      console.log(`[SCAN] First candle:`, candles[0]);
      console.log(`[SCAN] Last candle:`, candles[candles.length - 1]);
      
      // 2. Perform algorithmic scan
      console.log(`[SCAN] Running AnalysisEngine.analyze...`);
      const report = AnalysisEngine.analyze(state.selectedSymbol, state.selectedTimeframe, state.selectedMode, candles, state.adminConfig);
      console.log(`[SCAN] Analysis complete!`);
      console.log(`[SCAN] Report data:`, report.data);
      console.log(`[SCAN] Confidence: ${report.data.confidence}%`);
      console.log(`[SCAN] Bias: ${report.data.bias}`);
      console.log(`[SCAN] Entry: ${report.data.entryPrice}`);
      
      // Save data locally
      state.activeSetup = report.data;
      console.log(`[SCAN] Active setup saved to state`);

      // 3. Render setup outputs in UI slots
      console.log(`[SCAN] Rendering report to UI...`);
      renderAIScanReport(report);
      console.log(`[SCAN] Report rendered successfully`);
      
      // 4. Trigger dynamic calculator updates based on computed entry & SL
      console.log(`[SCAN] Running risk calculator...`);
      runDynamicRiskCalculator();
      console.log(`[SCAN] ✅ Scan workflow complete!`);

    } catch (e) {
      console.error("[SCAN] ❌ ERROR:", e);
      console.error("[SCAN] Error message:", e.message);
      console.error("[SCAN] Error stack:", e.stack);
      els.terminalCommandLine.innerText = `AURA CRYPTO & FX AI ERROR: ${e.message || 'Analysis failed'}. Please try again.`;
      
      // Show error in UI
      els.loadingStatusText.innerText = `ERROR: ${e.message || 'Analysis failed'}`;
      els.loadingStatusText.style.color = 'var(--neon-red)';
      
      // Alert user with more details
      alert(`Scan Error: ${e.message}\n\nCheck browser console (F12) for details.`);
      
      // Revert to idle after 3 seconds
      setTimeout(() => {
        els.resultsLoadingState.classList.add('hidden');
        els.resultsIdleState.classList.remove('hidden');
        els.loadingStatusText.style.color = '';
      }, 3000);
    }

    // Enable button
    els.runAnalysisBtn.disabled = false;
    els.runAnalysisBtn.classList.remove('scanning-active');
  }

  /**
   * Renders the computed mathematical values and SMC properties to DOM slots
   */
  function renderAIScanReport(report) {
    console.log(`[RENDER] Starting render with report:`, report);
    const d = report.data;
    
    // Validate data
    if (!d || typeof d.confidence === 'undefined') {
      console.error('[RENDER] ❌ Invalid report data:', d);
      throw new Error('Invalid analysis report data');
    }
    
    console.log(`[RENDER] Confidence value: ${d.confidence}%`);

    // Badges & Bias
    els.outputPairBadge.innerText = `PAIR: ${d.symbol.substring(0, 3)}/${d.symbol.substring(3)}`;
    els.outputTfBadge.innerText = `TIMEFRAME: ${d.timeframe.toUpperCase()}`;
    els.outputModeBadge.innerText = `MODE: ${d.mode.toUpperCase()}`;
    
    // Bias style
    els.outputBiasText.innerText = d.bias;
    els.outputBiasBadge.className = `bias-indicator-badge ${d.bias === 'BULLISH' ? 'bullish' : 'bearish'}`;
    els.outputBiasBadge.innerHTML = d.bias === 'BULLISH' 
      ? `<i class="fa-solid fa-arrow-trend-up"></i> <span>BULLISH</span>`
      : `<i class="fa-solid fa-arrow-trend-down"></i> <span>BEARISH</span>`;

    // Numerical Levels
    const precision = decimalPrecision[d.symbol];
    els.outputEntryPrice.innerText = d.entryPrice.toFixed(precision);
    els.outputSlPrice.innerText = d.stopLoss.toFixed(precision);
    
    els.outputTp1Price.innerText = d.tp1.toFixed(precision);
    els.outputTp2Price.innerText = d.tp2.toFixed(precision);
    els.outputTp3Price.innerText = d.tp3.toFixed(precision);

    // Calculate percentage distances from entry for TP visual tags
    const getPctDist = (tpVal) => {
      const diff = Math.abs(tpVal - d.entryPrice);
      return ((diff / d.entryPrice) * 100).toFixed(2);
    };

    els.outputTp1Pct.innerText = `+${getPctDist(d.tp1)}%`;
    els.outputTp2Pct.innerText = `+${getPctDist(d.tp2)}%`;
    els.outputTp3Pct.innerText = `+${getPctDist(d.tp3)}%`;

    // SL context details
    const slDistPct = ((Math.abs(d.entryPrice - d.stopLoss) / d.entryPrice) * 100).toFixed(2);
    els.outputSlDetails.innerText = `Dynamic ATR Stop (SL size: ${slDistPct}%)`;

    // Radial Confidence Meter
    console.log(`[RENDER] Setting confidence display to: ${d.confidence}%`);
    els.outputConfidenceVal.innerText = `${d.confidence}%`;
    els.radialProgressFill.style.strokeDasharray = `${d.confidence}, 100`;
    console.log(`[RENDER] Confidence element text:`, els.outputConfidenceVal.innerText);
    console.log(`[RENDER] Radial progress dasharray:`, els.radialProgressFill.style.strokeDasharray);
    
    // Color code confidence circle
    els.radialProgressFill.style.stroke = d.bias === 'BULLISH' ? 'var(--neon-bull)' : 'var(--neon-bear)';
    els.radialProgressFill.style.filter = d.bias === 'BULLISH' ? 'drop-shadow(0 0 5px var(--neon-bull))' : 'drop-shadow(0 0 5px var(--neon-bear))';

    els.outputRrVal.innerText = d.rrRatio;
    
    // Success odds
    els.outputSuccessProbability.innerText = `${d.successProbability} (${d.successProbPct}%)`;
    els.outputSuccessProbability.className = `sub-met-val ${d.successProbPct > 70 ? 'font-green' : 'font-amber'}`;
    
    els.outputLeverageRisk.innerText = d.suggestedLeverage;
    els.outputVolStatus.innerText = d.volStatus;
    els.outputNewsFiltered.innerText = d.newsFiltered || 'FILTERED';
    
    // Structure Assessment - Sleek typewriter streaming effect
    typeText(els.outputStructureText, d.structureAssessment, 6);
    
    // SMC Sidebar Panel Sync
    els.smcObRange.innerText = d.smc.obRange;
    els.smcObStatus.innerText = d.smc.obStatus;
    els.smcObStatus.className = `smc-status ${d.bias === 'BULLISH' ? 'active-bull' : 'active-bear'}`;
    
    els.smcFvgRange.innerText = d.smc.fvgRange;
    els.smcFvgStatus.className = `smc-status ${d.smc.fvgStatus === 'OPEN GAP' ? 'active-gap' : 'swept'}`;
    els.smcFvgStatus.innerText = d.smc.fvgStatus;
    
    els.smcLiqLevel.innerText = d.smc.liqStatus === 'SWEPT' ? `${d.smc.liqLevel} pool swept` : 'Clearing pools';
    els.smcLiqStatus.innerText = d.smc.liqStatus;
    els.smcLiqStatus.className = `smc-status ${d.smc.liqStatus === 'SWEPT' ? 'swept' : 'active-bull'}`;

    // Technical Oscillators panel sync
    els.smcRsiVal.innerText = d.indicators.rsi;
    els.smcRsiVal.className = d.indicators.rsi > 70 ? 'text-neon-red' : d.indicators.rsi < 30 ? 'text-neon-green' : 'text-neon-cyan';
    
    els.smcMacdVal.innerText = d.indicators.macd;
    els.smcMacdVal.className = parseFloat(d.indicators.macd) > 0 ? 'text-neon-green' : 'text-neon-red';
    
    els.smcVolumeVal.innerText = formatVolume(d.indicators.volume);

    // Dynamic Confluence Narratives Injection - Bullet-by-Bullet Typing
    let narrativeHtml = '';
    d.narrativeHighlights.forEach(highlight => {
      narrativeHtml += `
        <div class="narrative-bullet">
          <i class="fa-solid fa-chevron-right"></i>
          <span>${highlight.text}</span>
        </div>
      `;
    });
    typeText(els.outputAnalysisNarrative, narrativeHtml, 4);

    // Output final formatted string details to visual console
    els.terminalCommandLine.innerText = `AURA CRYPTO & FX AI: Deep scan confluences validated for [${d.symbol}]. Setup compiled with ${d.confidence}% probability.`;

    // Swap states
    els.resultsLoadingState.classList.add('hidden');
    els.resultsOutputState.classList.remove('hidden');

    // Smooth scroll active results card into view to highlight the finished setup
    setTimeout(() => {
      els.resultsOutputState.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  }

  /* ==========================================================================
     Prop Trading Risk & Position Size Calculator
     ========================================================================== */

  function runDynamicRiskCalculator() {
    const balance = parseFloat(els.calcBalance.value) || 0;
    const riskPct = parseFloat(els.calcRiskPct.value) || 0;
    
    // Compute cash amount risked
    const riskAmt = balance * (riskPct / 100);
    els.calcResRiskAmt.innerText = `$${riskAmt.toFixed(2)}`;

    // If we have an active setup loaded, compute precise lot sizes based on entry/SL
    if (state.activeSetup) {
      const entry = state.activeSetup.entryPrice;
      const sl = state.activeSetup.stopLoss;
      const dist = Math.abs(entry - sl);
      const symbol = state.activeSetup.symbol;
      
      let finalPositionSize = 0;
      let pipValMultiplier = 1;
      
      if (state.selectedType === 'crypto') {
        // Contract-based calculations for crypto
        // Units size = Cash risked / distance in absolute USD
        finalPositionSize = riskAmt / dist;
        els.calcResPosSize.innerText = `${finalPositionSize.toFixed(4)} Units`;
        
        // Suggest leverage: (Units * Entry) / Account Size
        const suggestedLev = (finalPositionSize * entry) / balance;
        els.calcResLev.innerText = `${Math.max(1, Math.round(suggestedLev))}x`;
      } else {
        // Forex PIP-based calculations (Standard Lot sizes)
        // EURUSD: 1 Pip = 0.00010 (contract size = 100,000)
        // USDJPY: 1 Pip = 0.010 (contract size = 100,000)
        // Gold: 1 Pip = 0.10 (contract size = 100)
        let pipSize = 0.00010;
        let contractSize = 100000;
        
        if (symbol === 'USDJPY') {
          pipSize = 0.010;
        } else if (symbol === 'XAUUSD') {
          pipSize = 0.10;
          contractSize = 100;
        }

        const pipsRisked = dist / pipSize;
        
        // Position lot size = Cash risked / (Pips risked * Pip value of 1 Standard Lot)
        // 1 Pip value of standard lot (100k) EURUSD is $10. Gold (100 oz) is $10. USDJPY is ~$9.3.
        // For simplicity of calculation: Standard Lot Pip value = $10 (except JPY which scales slightly)
        let standardLotPipValue = 10;
        if (symbol === 'USDJPY') {
          standardLotPipValue = 9.4; // Average value
        }

        finalPositionSize = riskAmt / (pipsRisked * standardLotPipValue);
        
        if (symbol === 'XAUUSD') {
          els.calcResPosSize.innerText = `${finalPositionSize.toFixed(2)} Lots (Ounces: ${(finalPositionSize * 100).toFixed(0)})`;
        } else {
          els.calcResPosSize.innerText = `${finalPositionSize.toFixed(2)} Standard Lots`;
        }

        const leverageUsed = (finalPositionSize * contractSize * entry) / balance;
        els.calcResLev.innerText = `${Math.max(1, Math.round(leverageUsed))}x`;
      }
    } else {
      els.calcResPosSize.innerText = "--.--";
      els.calcResLev.innerText = "--x";
    }
  }

  /* ==========================================================================
     Format Helper Functions
     ========================================================================== */

  function formatVolume(val) {
    if (val >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
    if (val >= 1e3) return `${(val / 1e3).toFixed(1)}K`;
    return Math.round(val).toString();
  }

  /**
   * Reusable HTML-safe character streaming visualizer
   */
  function typeText(element, htmlContent, speed = 8) {
    if (element.typeTimer) {
      clearInterval(element.typeTimer);
    }
    
    element.innerHTML = '';
    let i = 0;
    
    // Parse complete HTML chunks to avoid broken open tag glitches
    // This allows typing tags cleanly
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Flatten children/nodes array to type them sequentially
    const textNodes = [];
    function collectNodes(node, container) {
      if (node.nodeType === Node.TEXT_NODE) {
        textNodes.push({ type: 'text', value: node.nodeValue, parent: container });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const newEl = document.createElement(node.tagName);
        // Copy attributes
        for (let attr of node.attributes) {
          newEl.setAttribute(attr.name, attr.value);
        }
        container.appendChild(newEl);
        
        for (let child of node.childNodes) {
          collectNodes(child, newEl);
        }
      }
    }
    
    const outputContainer = document.createDocumentFragment();
    collectNodes(tempDiv, outputContainer);
    
    // Prepare targeted elements
    element.appendChild(outputContainer);
    
    // Hide all text contents initially
    const elementsToType = [];
    const textWalk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    let textNode;
    while (textNode = textWalk.nextNode()) {
      elementsToType.push({
        node: textNode,
        originalValue: textNode.nodeValue
      });
      textNode.nodeValue = ''; // Clear out text
    }

    let nodeIndex = 0;
    let charIndex = 0;

    const timer = setInterval(() => {
      if (nodeIndex < elementsToType.length) {
        const item = elementsToType[nodeIndex];
        if (charIndex < item.originalValue.length) {
          item.node.nodeValue = item.originalValue.substring(0, charIndex + 1);
          charIndex++;
        } else {
          nodeIndex++;
          charIndex = 0;
        }
      } else {
        clearInterval(timer);
      }
    }, speed);
    
    element.typeTimer = timer;
  }

  /* ==========================================================================
     Admin Backend Panel Controller
     ========================================================================== */

  function bindAdminEvents() {
    // --- Helpers ---
    function closeAdminOverlays() {
      if (els.adminLogin) els.adminLogin.classList.add('hidden');
      if (els.adminPanel) els.adminPanel.classList.add('hidden');
      if (els.adminUsername) els.adminUsername.value = '';
      if (els.adminPassword) els.adminPassword.value = '';
      if (els.loginError) els.loginError.classList.add('hidden');
      els.terminalCommandLine.innerText = `AURA SYSTEM: Console session terminated. Standard operations active.`;
    }

    function handleLoginAuthentication() {
      const username = els.adminUsername.value.trim();
      const password = els.adminPassword.value;

      if (username === 'admin' && password === 'Dollarpath') {
        // Success transitions
        if (els.adminLogin) els.adminLogin.classList.add('hidden');
        if (els.adminPanel) els.adminPanel.classList.remove('hidden');
        els.terminalCommandLine.innerText = `AURA SYSTEM: Administrative credentials approved. Zero-trust session active.`;
        
        // Clean fields
        if (els.adminUsername) els.adminUsername.value = '';
        if (els.adminPassword) els.adminPassword.value = '';
        if (els.loginError) els.loginError.classList.add('hidden');
        
        // Sync premium toggle and stats
        if (els.adminPremiumToggle) {
          els.adminPremiumToggle.value = state.isPremiumActive ? 'active' : 'inactive';
        }
        updateAdminSubStats();
        renderAdminPaymentLogs();
      } else {
        // Failure transitions
        if (els.loginError) els.loginError.classList.remove('hidden');
        if (els.adminPassword) {
          els.adminPassword.value = '';
          els.adminPassword.focus();
        }
        els.terminalCommandLine.innerText = `⚠ SECURITY ALERT: Failed login attempt. Access restricted.`;

        // Shake animation
        if (els.adminLogin) {
          const modal = els.adminLogin.querySelector('.admin-login-modal');
          if (modal) {
            modal.classList.remove('shake');
            void modal.offsetWidth; // Force DOM reflow
            modal.classList.add('shake');
            setTimeout(() => {
              modal.classList.remove('shake');
            }, 400);
          }
        }
      }
    }

    // --- Modal Trigger / Open ---
    if (els.adminTrigger) {
      els.adminTrigger.addEventListener('click', () => {
        if (state.isOfflineMode) return;
        
        // Clear login input values & state
        if (els.adminUsername) els.adminUsername.value = '';
        if (els.adminPassword) els.adminPassword.value = '';
        if (els.loginError) els.loginError.classList.add('hidden');
        
        // Show login modal
        if (els.adminLogin) {
          els.adminLogin.classList.remove('hidden');
          if (els.adminUsername) els.adminUsername.focus();
        }
        els.terminalCommandLine.innerText = `AURA SYSTEM: Zero-trust secure console access requested. Enter authentication key.`;
      });
    }

    // Secret brand logo triple-tap handler
    let logoClicks = 0;
    let logoClickTimeout;
    if (els.logoArea) {
      els.logoArea.style.cursor = 'pointer'; // Ensure pointer indicator is present on hover
      els.logoArea.addEventListener('click', () => {
        logoClicks++;
        clearTimeout(logoClickTimeout);
        
        if (logoClicks === 3) {
          logoClicks = 0;
          if (state.isOfflineMode) return;
          
          // Clear login input values & state
          if (els.adminUsername) els.adminUsername.value = '';
          if (els.adminPassword) els.adminPassword.value = '';
          if (els.loginError) els.loginError.classList.add('hidden');
          
          // Show login modal
          if (els.adminLogin) {
            els.adminLogin.classList.remove('hidden');
            if (els.adminUsername) els.adminUsername.focus();
          }
          els.terminalCommandLine.innerText = `AURA SYSTEM: Secret gateway override initiated. Secure passcode challenge loaded.`;
        } else {
          logoClickTimeout = setTimeout(() => {
            logoClicks = 0;
          }, 1000); // Reset count if user stops tapping for > 1 second
        }
      });
    }

    // --- Authenticate Actions ---
    if (els.adminLoginBtn) {
      els.adminLoginBtn.addEventListener('click', handleLoginAuthentication);
    }

    [els.adminUsername, els.adminPassword].forEach(input => {
      if (input) {
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            handleLoginAuthentication();
          }
        });
      }
    });

    // --- Modal Closers ---
    if (els.closeAdminBtn) {
      els.closeAdminBtn.addEventListener('click', closeAdminOverlays);
    }

    // Close on backdrop click (for both modals)
    if (els.adminLogin) {
      els.adminLogin.addEventListener('click', (e) => {
        if (e.target === els.adminLogin) {
          closeAdminOverlays();
        }
      });
    }

    if (els.adminPanel) {
      els.adminPanel.addEventListener('click', (e) => {
        if (e.target === els.adminPanel) {
          closeAdminOverlays();
        }
      });
    }

    // Global escape key handler to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const isLoginOpen = els.adminLogin && !els.adminLogin.classList.contains('hidden');
        const isPanelOpen = els.adminPanel && !els.adminPanel.classList.contains('hidden');
        if (isLoginOpen || isPanelOpen) {
          closeAdminOverlays();
        }
      }
    });

    // --- Tab Switching ---
    els.adminNavBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;

        // Toggle nav button active states
        els.adminNavBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Toggle tab content visibility
        els.adminTabContents.forEach(tab => tab.classList.remove('active'));
        const activeTab = document.getElementById(`tab-${targetTab}`);
        if (activeTab) activeTab.classList.add('active');

        if (targetTab === 'subscriptions') {
          updateAdminSubStats();
          renderAdminPaymentLogs();
        }
      });
    });

    // --- Premium Toggle control in Admin panel ---
    if (els.adminPremiumToggle) {
      els.adminPremiumToggle.addEventListener('change', () => {
        const value = els.adminPremiumToggle.value;
        if (value === 'active' && !state.isPremiumActive) {
          unlockPremiumFeatures('Admin Override');
        } else if (value === 'inactive' && state.isPremiumActive) {
          lockPremiumFeatures();
        }
      });
    }

    // --- Live Confidence Slider ---
    if (els.adminConfidenceMult) {
      els.adminConfidenceMult.addEventListener('input', () => {
        const val = parseFloat(els.adminConfidenceMult.value).toFixed(1);
        els.confidenceMultVal.innerText = `${val}x`;
      });
    }

    // --- Apply Configuration Button ---
    if (els.saveAdminBtn) {
      els.saveAdminBtn.addEventListener('click', () => {
        // Read all form values into state
        state.adminConfig.forcedBias = els.adminForceBias.value;
        state.adminConfig.confidenceMult = parseFloat(els.adminConfidenceMult.value);
        state.adminConfig.forcedVol = els.adminForceVol.value;
        state.adminConfig.systemStatus = els.adminSystemStatus.value;

        // Handle system status changes
        applySystemStatus(state.adminConfig.systemStatus);

        // Close admin panel
        els.adminPanel.classList.add('hidden');

        // Visual confirmation flash
        flashTerminalConfirmation('CONFIG APPLIED');

        // Terminal feedback
        const biasLabel = state.adminConfig.forcedBias === 'auto' ? 'ALGORITHMIC' : state.adminConfig.forcedBias.toUpperCase();
        els.terminalCommandLine.innerText = `AURA ADMIN: Configuration applied — Bias: ${biasLabel} | Confidence: ${state.adminConfig.confidenceMult}x | Vol: ${state.adminConfig.forcedVol.toUpperCase()}`;

        // Re-trigger scan with new overrides
        if (!state.isOfflineMode) {
          triggerAIScanWorkflow();
        }
      });
    }

    // --- Custom Price Overrides ---
    if (els.adminApplyPrices) {
      els.adminApplyPrices.addEventListener('click', () => {
        const btcPrice = parseFloat(els.adminBtcPrice.value);
        const goldPrice = parseFloat(els.adminGoldPrice.value);
        let pushed = [];

        if (!isNaN(btcPrice) && btcPrice > 0) {
          DataService.updatePrice('BTCUSD', btcPrice, 0);
          pushed.push(`BTC → $${btcPrice.toLocaleString()}`);
        }

        if (!isNaN(goldPrice) && goldPrice > 0) {
          DataService.updatePrice('XAUUSD', goldPrice, 0);
          pushed.push(`GOLD → $${goldPrice.toFixed(2)}`);
        }

        if (pushed.length > 0) {
          flashTerminalConfirmation('PRICES PUSHED');
          els.terminalCommandLine.innerText = `AURA ADMIN: Custom price override pushed — ${pushed.join(' | ')}`;
        } else {
          els.terminalCommandLine.innerText = `AURA ADMIN: No valid price values provided. Enter numeric values.`;
        }
      });
    }

    // --- FOMC Spike Trigger ---
    if (els.adminTriggerFomc) {
      els.adminTriggerFomc.addEventListener('click', () => {
        // Inject FOMC into calendar
        NewsService.triggerFOMCSpike();

        // Refresh the news/sentiment widget
        syncNewsSentimentWidget(state.selectedSymbol);

        // Simulate violent price spike (BTC drops ~3%, Gold spikes ~2%)
        const btcCurrent = DataService.getLatestPrice('BTCUSD');
        const goldCurrent = DataService.getLatestPrice('XAUUSD');
        if (btcCurrent) DataService.updatePrice('BTCUSD', btcCurrent * 0.97, -3.2);
        if (goldCurrent) DataService.updatePrice('XAUUSD', goldCurrent * 1.02, 2.1);

        // Emergency dashboard flash
        triggerFOMCFlashSequence();

        // Terminal alert
        els.terminalCommandLine.innerText = `⚠ AURA ALERT: FOMC EMERGENCY RATE DECISION DETECTED — Market impact: EXTREME. Auto-scanning disrupted positions...`;

        // Close admin and retrigger scan
        els.adminPanel.classList.add('hidden');
        setTimeout(() => {
          triggerAIScanWorkflow();
        }, 1500);
      });
    }
  }

  /* ==========================================================================
     Admin Helper Functions
     ========================================================================== */

  /**
   * Applies system-wide status overrides (online, high latency, offline)
   */
  function applySystemStatus(status) {
    // Remove any existing overlays
    const existingOverlay = document.getElementById('offline-overlay');
    if (existingOverlay) existingOverlay.remove();

    // Reset offline mode
    state.isOfflineMode = false;
    state.latencyOverride = null;

    if (status === 'latency') {
      state.latencyOverride = true;
      // Override the ping interval to show high latency
      els.latencyVal.innerText = '847ms';
      els.latencyVal.style.color = 'var(--neon-bear)';
      els.terminalCommandLine.innerText = `AURA SYSTEM: ⚠ HIGH LATENCY DETECTED — Network degradation simulated. Response times elevated.`;

      // Continuously override latency display
      if (window._adminLatencyInterval) clearInterval(window._adminLatencyInterval);
      window._adminLatencyInterval = setInterval(() => {
        if (!state.latencyOverride) {
          clearInterval(window._adminLatencyInterval);
          els.latencyVal.style.color = '';
          return;
        }
        const highPing = Math.floor(650 + Math.random() * 400);
        els.latencyVal.innerText = `${highPing}ms`;
        els.latencyVal.style.color = highPing > 800 ? 'var(--neon-bear)' : 'var(--neon-amber)';
      }, 2000);

    } else if (status === 'offline') {
      state.isOfflineMode = true;
      els.latencyVal.innerText = 'OFFLINE';
      els.latencyVal.style.color = 'var(--neon-bear)';

      // Create a dramatic offline overlay
      const overlay = document.createElement('div');
      overlay.id = 'offline-overlay';
      overlay.innerHTML = `
        <div class="offline-content">
          <div class="offline-icon"><i class="fa-solid fa-wifi" style="font-size:36px; color:var(--neon-bear);"></i></div>
          <div class="offline-title">SYSTEM DISCONNECTED</div>
          <div class="offline-sub">Attempting to re-establish secure connection to exchange APIs...</div>
          <div class="offline-spinner"><i class="fa-solid fa-circle-notch fa-spin" style="color:var(--neon-cyan); font-size:20px;"></i></div>
          <button id="reconnect-btn" class="admin-action-btn" style="margin-top:15px;"><i class="fa-solid fa-plug"></i> FORCE RECONNECT</button>
        </div>
      `;
      document.body.appendChild(overlay);

      // Reconnect button handler
      document.getElementById('reconnect-btn').addEventListener('click', () => {
        state.isOfflineMode = false;
        state.latencyOverride = null;
        overlay.remove();
        els.latencyVal.style.color = '';
        els.adminSystemStatus.value = 'online';
        state.adminConfig.systemStatus = 'online';
        els.terminalCommandLine.innerText = `AURA SYSTEM: Connection re-established. All exchange data streams restored.`;
      });

    } else {
      // Online — clear all overrides
      if (window._adminLatencyInterval) clearInterval(window._adminLatencyInterval);
      els.latencyVal.style.color = '';
    }
  }

  /**
   * Flashes a neon confirmation badge over the terminal command line
   */
  function flashTerminalConfirmation(label) {
    const badge = document.createElement('span');
    badge.className = 'admin-flash-badge';
    badge.innerText = `✓ ${label}`;
    badge.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.8);
      background: linear-gradient(135deg, rgba(166,77,255,0.95), rgba(123,44,191,0.95));
      color: #fff;
      font-family: var(--font-mono);
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 2px;
      padding: 14px 32px;
      border-radius: 8px;
      box-shadow: 0 0 40px rgba(166,77,255,0.6), 0 0 80px rgba(166,77,255,0.2);
      z-index: 99999;
      pointer-events: none;
      opacity: 0;
      animation: adminFlashIn 0.8s cubic-bezier(0.4,0,0.2,1) forwards;
    `;
    document.body.appendChild(badge);
    setTimeout(() => badge.remove(), 1200);
  }

  /**
   * Creates a dramatic red border flash sequence to simulate FOMC market impact
   */
  function triggerFOMCFlashSequence() {
    const container = document.getElementById('terminal-container');
    if (!container) return;

    let flashes = 0;
    const maxFlashes = 6;
    const flashInterval = setInterval(() => {
      if (flashes >= maxFlashes) {
        clearInterval(flashInterval);
        container.style.boxShadow = '';
        container.style.borderColor = '';
        return;
      }
      if (flashes % 2 === 0) {
        container.style.boxShadow = '0 0 30px rgba(255,51,102,0.6), inset 0 0 20px rgba(255,51,102,0.1)';
        container.style.borderColor = 'rgba(255,51,102,0.6)';
      } else {
        container.style.boxShadow = '';
        container.style.borderColor = '';
      }
      flashes++;
    }, 200);
  }

  /* ==========================================================================
     Premium Paywall & Checkout Manager
     ========================================================================== */

  function bindPremiumEvents() {
    if (els.premiumUpgradeBtn) {
      els.premiumUpgradeBtn.addEventListener('click', () => {
        if (state.isPremiumActive) return;
        openPremiumPaywall('Premium Upgrade');
      });
    }

    if (els.closePremiumBtn) {
      els.closePremiumBtn.addEventListener('click', closePremiumPaywall);
    }

    if (els.premiumPaywall) {
      els.premiumPaywall.addEventListener('click', handlePaywallOutsideClick);
    }

    // Payment tab switcher
    els.payTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const gateway = btn.dataset.gateway;
        els.payTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        els.gatewayContents.forEach(content => {
          content.classList.remove('active');
        });
        const activeGateway = document.getElementById(`pay-${gateway}`);
        if (activeGateway) activeGateway.classList.add('active');
      });
    });

    // M-Pesa Payment Simulation
    if (els.mpesaSubmitBtn) {
      els.mpesaSubmitBtn.addEventListener('click', () => {
        const phone = els.mpesaPhone.value.trim();
        if (!phone) {
          showPaymentStatus('mpesa', 'Please enter a Safaricom phone number', 'error');
          return;
        }
        showPaymentStatus('mpesa', '<i class="fa-solid fa-spinner fa-spin"></i> Sending STK push prompt to ' + phone + '...', 'info');
        els.mpesaSubmitBtn.disabled = true;

        // Log payment initiate
        addPaymentAuditLog('M-Pesa', `STK push sent to ${phone}`, 'pending');

        setTimeout(() => {
          showPaymentStatus('mpesa', '<i class="fa-solid fa-spinner fa-spin"></i> Awaiting M-Pesa PIN input from subscriber...', 'info');
          setTimeout(() => {
            unlockPremiumFeatures('M-Pesa');
            showPaymentStatus('mpesa', '<i class="fa-solid fa-circle-check"></i> Payment successfully processed! Welcome to Premium.', 'success');
            els.mpesaSubmitBtn.disabled = false;
            els.mpesaPhone.value = '';
          }, 2500);
        }, 2000);
      });
    }

    // PayPal Payment Simulation
    if (els.paypalSubmitBtn) {
      els.paypalSubmitBtn.addEventListener('click', () => {
        showPaymentStatus('paypal', '<i class="fa-solid fa-spinner fa-spin"></i> Launching PayPal express checkout overlay...', 'info');
        els.paypalSubmitBtn.disabled = true;

        addPaymentAuditLog('PayPal', 'Secure checkout session initiated', 'pending');

        setTimeout(() => {
          showPaymentStatus('paypal', '<i class="fa-solid fa-spinner fa-spin"></i> Verifying auth token with PayPal servers...', 'info');
          setTimeout(() => {
            unlockPremiumFeatures('PayPal');
            showPaymentStatus('paypal', '<i class="fa-solid fa-circle-check"></i> Account approved. Premium unlocked successfully.', 'success');
            els.paypalSubmitBtn.disabled = false;
          }, 2000);
        }, 1500);
      });
    }

    // Crypto Payment Copy & Verification
    if (els.copyWalletBtn) {
      els.copyWalletBtn.addEventListener('click', () => {
        if (els.cryptoWalletAddr) {
          els.cryptoWalletAddr.select();
          els.cryptoWalletAddr.setSelectionRange(0, 99999);
          navigator.clipboard.writeText(els.cryptoWalletAddr.value).then(() => {
            const originalText = els.copyWalletBtn.innerHTML;
            els.copyWalletBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
            setTimeout(() => {
              els.copyWalletBtn.innerHTML = originalText;
            }, 2000);
          }).catch(err => {
            console.error('Clipboard copy failed:', err);
          });
        }
      });
    }

    if (els.cryptoSubmitBtn) {
      els.cryptoSubmitBtn.addEventListener('click', () => {
        const txid = els.cryptoTxid.value.trim();
        if (!txid) {
          showPaymentStatus('crypto', 'Please enter a transaction hash / TXID', 'error');
          return;
        }
        showPaymentStatus('crypto', '<i class="fa-solid fa-spinner fa-spin"></i> Locating TXID on blockchain nodes...', 'info');
        els.cryptoSubmitBtn.disabled = true;

        addPaymentAuditLog('Crypto', `TXID lookup: ${txid.substring(0, 15)}...`, 'pending');

        setTimeout(() => {
          showPaymentStatus('crypto', '<i class="fa-solid fa-spinner fa-spin"></i> Verifying transaction confirmations (2/3)...', 'info');
          setTimeout(() => {
            unlockPremiumFeatures('Crypto', txid);
            showPaymentStatus('crypto', '<i class="fa-solid fa-circle-check"></i> USDT Transaction confirmed! Premium access enabled.', 'success');
            els.cryptoSubmitBtn.disabled = false;
            els.cryptoTxid.value = '';
          }, 2000);
        }, 2000);
      });
    }
  }

  function openPremiumPaywall(source = 'Premium Feature') {
    if (els.premiumPaywall) {
      els.premiumPaywall.classList.remove('hidden');
      showPaymentStatus('mpesa', '', 'clear');
      showPaymentStatus('paypal', '', 'clear');
      showPaymentStatus('crypto', '', 'clear');
      
      const firstTab = els.payTabBtns[0];
      if (firstTab) firstTab.click();

      els.terminalCommandLine.innerText = `AURA SECURITY: Access to [${source.toUpperCase()}] is locked behind Premium subscription.`;
    }
  }

  function closePremiumPaywall() {
    if (els.premiumPaywall) {
      els.premiumPaywall.classList.add('hidden');
    }
  }

  /**
   * Check if user has premium access on page load
   * If not, show mandatory paywall immediately
   */
  function checkPremiumStatusOnLoad() {
    // Check localStorage for premium status
    const premiumStatus = localStorage.getItem('auraPremiumStatus');
    const premiumExpiry = localStorage.getItem('auraPremiumExpiry');
    
    if (premiumStatus === 'active' && premiumExpiry) {
      const expiryDate = new Date(premiumExpiry);
      const now = new Date();
      
      // Check if premium hasn't expired
      if (expiryDate > now) {
        state.isPremiumActive = true;
        updatePremiumUI();
        return;
      }
    }
    
    // No valid premium - show mandatory paywall
    state.isPremiumActive = false;
    
    // Show paywall after a brief delay to let the page render
    setTimeout(() => {
      openMandatoryPremiumPaywall();
    }, 500);
  }

  /**
   * Opens premium paywall that cannot be closed without payment
   */
  function openMandatoryPremiumPaywall() {
    if (els.premiumPaywall) {
      els.premiumPaywall.classList.remove('hidden');
      els.premiumPaywall.classList.add('mandatory-paywall');
      
      // Hide the close button for mandatory paywall
      if (els.closePremiumBtn) {
        els.closePremiumBtn.style.display = 'none';
      }
      
      // Prevent closing by clicking outside
      els.premiumPaywall.removeEventListener('click', handlePaywallOutsideClick);
      
      showPaymentStatus('mpesa', '', 'clear');
      showPaymentStatus('paypal', '', 'clear');
      showPaymentStatus('crypto', '', 'clear');
      
      const firstTab = els.payTabBtns[0];
      if (firstTab) firstTab.click();

      els.terminalCommandLine.innerText = `AURA SECURITY: Premium subscription required to access the platform. Please complete payment to continue.`;
      
      // Add welcome message to paywall
      const premiumModal = document.querySelector('.premium-modal');
      if (premiumModal && !document.querySelector('.welcome-premium-msg')) {
        const welcomeMsg = document.createElement('div');
        welcomeMsg.className = 'welcome-premium-msg';
        welcomeMsg.style.cssText = 'padding: 15px; margin: 15px 0; background: rgba(0, 240, 255, 0.1); border-left: 3px solid var(--neon-cyan); border-radius: 4px;';
        welcomeMsg.innerHTML = `
          <h4 style="margin: 0 0 8px 0; color: var(--neon-cyan); font-size: 14px;">
            <i class="fa-solid fa-star"></i> Welcome to AURA CRYPTO & FX AI
          </h4>
          <p style="margin: 0; font-size: 12px; color: var(--text-muted);">
            Premium subscription required for full platform access. Choose your payment method below to unlock all features.
          </p>
        `;
        const premiumHeader = premiumModal.querySelector('.premium-header');
        if (premiumHeader) {
          premiumHeader.after(welcomeMsg);
        }
      }
    }
  }

  /**
   * Update UI to reflect premium status
   */
  function updatePremiumUI() {
    if (state.isPremiumActive) {
      // Update Header Button UI
      if (els.premiumUpgradeBtn) {
        els.premiumUpgradeBtn.innerHTML = '<i class="fa-solid fa-crown" style="color:var(--neon-bull);"></i> PREMIUM ACTIVE';
        els.premiumUpgradeBtn.classList.add('premium-active-badge');
        els.premiumUpgradeBtn.style.background = 'linear-gradient(135deg, rgba(0, 255, 170, 0.15) 0%, rgba(0, 240, 255, 0.15) 100%)';
        els.premiumUpgradeBtn.style.borderColor = 'var(--neon-bull)';
      }

      // Hide locks
      document.querySelectorAll('.premium-lock').forEach(lock => {
        lock.style.display = 'none';
      });
      
      // Show close button if it was hidden
      if (els.closePremiumBtn) {
        els.closePremiumBtn.style.display = '';
      }
      
      // Remove mandatory class
      if (els.premiumPaywall) {
        els.premiumPaywall.classList.remove('mandatory-paywall');
      }
    }
  }

  function handlePaywallOutsideClick(e) {
    if (e.target === els.premiumPaywall && !els.premiumPaywall.classList.contains('mandatory-paywall')) {
      closePremiumPaywall();
    }
  }

  function showPaymentStatus(gateway, htmlContent, type = 'info') {
    const statusBox = document.getElementById(`pay-${gateway}`).querySelector('.payment-status-message');
    if (!statusBox) return;

    if (type === 'clear') {
      statusBox.classList.add('hidden');
      statusBox.className = 'payment-status-message hidden';
      statusBox.innerHTML = '';
      return;
    }

    statusBox.classList.remove('hidden');
    statusBox.innerHTML = htmlContent;

    if (type === 'success') {
      statusBox.className = 'payment-status-message success-msg';
    } else if (type === 'error') {
      statusBox.className = 'payment-status-message error-msg';
    } else {
      statusBox.className = 'payment-status-message';
    }
  }

  function unlockPremiumFeatures(gateway, details = '') {
    state.isPremiumActive = true;
    
    // Save premium status to localStorage (30 days expiry)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    localStorage.setItem('auraPremiumStatus', 'active');
    localStorage.setItem('auraPremiumExpiry', expiryDate.toISOString());
    localStorage.setItem('auraPremiumGateway', gateway);
    
    // Update premium stats
    state.activeUsersCount += 1;
    state.premiumMrr += 30; // $29.99 subscription rounded
    updateAdminSubStats();

    // Log transaction success
    addPaymentAuditLog(gateway, `Subscription activated ${details ? '(' + details.substring(0,8) + '...)' : ''}`, 'completed');

    // Update UI
    updatePremiumUI();

    // Close paywall modal after delay
    setTimeout(() => {
      closePremiumPaywall();
      flashTerminalConfirmation('PREMIUM ENABLED');
      els.terminalCommandLine.innerText = `AURA ACCOUNT: Premium tier unlocked successfully via ${gateway}. Full platform access enabled.`;
    }, 2000);

    // Sync admin premium toggle select element if exists
    if (els.adminPremiumToggle) {
      els.adminPremiumToggle.value = 'active';
    }
  }

  function lockPremiumFeatures() {
    state.isPremiumActive = false;
    
    // Clear premium status from localStorage
    localStorage.removeItem('auraPremiumStatus');
    localStorage.removeItem('auraPremiumExpiry');
    localStorage.removeItem('auraPremiumGateway');

    // Log transaction revocation
    addPaymentAuditLog('System', 'Premium subscription tier revoked/deactivated', 'failed');

    // Update Header Button UI
    if (els.premiumUpgradeBtn) {
      els.premiumUpgradeBtn.innerHTML = '<i class="fa-solid fa-crown"></i> GO PREMIUM';
      els.premiumUpgradeBtn.classList.remove('premium-active-badge');
      els.premiumUpgradeBtn.style.background = '';
      els.premiumUpgradeBtn.style.borderColor = '';
    }

    // Show locks
    document.querySelectorAll('.premium-lock').forEach(lock => {
      lock.style.display = '';
    });

    // Reset state to non-premium items
    if (state.selectedMode === 'swing') {
      state.selectedMode = 'intraday';
      // Toggle mode tabs active states
      document.querySelectorAll('.mode-tab').forEach(t => {
        t.classList.remove('active');
        if (t.id === 'mode-intraday') t.classList.add('active');
      });
      switchTimeframe('15m');
    }

    const premiumSymbols = ['XAUUSD', 'GBPUSD', 'USDJPY'];
    if (premiumSymbols.includes(state.selectedSymbol)) {
      // Revert to BTCUSD
      els.assetRows.forEach(r => {
        r.classList.remove('active');
        if (r.dataset.symbol === 'BTCUSD') r.classList.add('active');
      });
      switchAsset('BTCUSD', 'crypto');
    }
    
    // Show mandatory paywall again
    openMandatoryPremiumPaywall();

    flashTerminalConfirmation('PREMIUM REVOKED');
    els.terminalCommandLine.innerText = `AURA ACCOUNT: Premium access revoked. Standard free features active.`;

    if (els.adminPremiumToggle) {
      els.adminPremiumToggle.value = 'inactive';
    }
  }

  function addPaymentAuditLog(gateway, desc, status) {
    const time = new Date().toUTCString().substring(17, 25); // HH:MM:SS
    const logItem = { time, gateway, desc, status };
    state.paymentLogs.unshift(logItem);
    if (state.paymentLogs.length > 25) {
      state.paymentLogs.pop();
    }
    renderAdminPaymentLogs();
  }

  function renderAdminPaymentLogs() {
    if (!els.adminPaymentLogs) return;
    els.adminPaymentLogs.innerHTML = state.paymentLogs.map(log => `
      <div class="payment-log-row">
        <span class="log-time">[${log.time}]</span>
        <span class="log-desc"><strong>${log.gateway.toUpperCase()}:</strong> ${log.desc}</span>
        <span class="log-status ${log.status}">${log.status.toUpperCase()}</span>
      </div>
    `).join('');
  }

  function updateAdminSubStats() {
    if (els.adminMetricsUsers) {
      els.adminMetricsUsers.innerText = state.activeUsersCount.toLocaleString();
    }
    if (els.adminMetricsMrr) {
      els.adminMetricsMrr.innerText = `$${state.premiumMrr.toLocaleString()}`;
    }
  }

  /* ==========================================================================
     Risk Disclaimer Modal Functions
     ========================================================================== */

  /**
   * Check if user has accepted the risk disclaimer
   * If not, show disclaimer modal before first analysis
   */
  function checkRiskDisclaimerStatus() {
    const disclaimerAccepted = localStorage.getItem('auraRiskDisclaimerAccepted');
    
    if (disclaimerAccepted === 'true') {
      // User has already accepted, no need to show again
      return;
    }
    
    // Bind disclaimer events
    bindDisclaimerEvents();
  }

  /**
   * Bind event listeners for disclaimer modal
   */
  function bindDisclaimerEvents() {
    // Enable/disable accept button based on checkbox
    if (els.disclaimerAcceptCheckbox) {
      els.disclaimerAcceptCheckbox.addEventListener('change', (e) => {
        if (els.disclaimerAcceptBtn) {
          els.disclaimerAcceptBtn.disabled = !e.target.checked;
        }
      });
    }

    // Handle accept button click
    if (els.disclaimerAcceptBtn) {
      els.disclaimerAcceptBtn.addEventListener('click', () => {
        acceptRiskDisclaimer();
      });
    }
  }

  /**
   * Show the risk disclaimer modal
   */
  function showRiskDisclaimerModal() {
    if (els.riskDisclaimerModal) {
      els.riskDisclaimerModal.classList.remove('hidden');
      els.terminalCommandLine.innerText = `AURA LEGAL: Please read and accept the risk disclaimer before running analysis.`;
      
      // Reset checkbox and button state
      if (els.disclaimerAcceptCheckbox) {
        els.disclaimerAcceptCheckbox.checked = false;
      }
      if (els.disclaimerAcceptBtn) {
        els.disclaimerAcceptBtn.disabled = true;
      }
      
      // Scroll to top of disclaimer content
      const scrollContent = els.riskDisclaimerModal.querySelector('.disclaimer-scroll-content');
      if (scrollContent) {
        scrollContent.scrollTop = 0;
      }
    }
  }

  /**
   * Accept the risk disclaimer and save to localStorage
   */
  function acceptRiskDisclaimer() {
    // Save acceptance to localStorage
    localStorage.setItem('auraRiskDisclaimerAccepted', 'true');
    localStorage.setItem('auraRiskDisclaimerDate', new Date().toISOString());
    
    // Hide modal
    if (els.riskDisclaimerModal) {
      els.riskDisclaimerModal.classList.add('hidden');
    }
    
    // Show confirmation
    els.terminalCommandLine.innerText = `AURA LEGAL: Risk disclaimer accepted. You may now proceed with analysis.`;
    flashTerminalConfirmation('DISCLAIMER ACCEPTED');
    
    // Automatically trigger the scan that was attempted
    setTimeout(() => {
      triggerAIScanWorkflow();
    }, 500);
  }

  /**
   * Check Risk Disclaimer before running analysis
   */
  function checkRiskDisclaimerBeforeScan() {
    const disclaimerAccepted = localStorage.getItem('auraRiskDisclaimerAccepted');
    
    if (disclaimerAccepted !== 'true') {
      // Show disclaimer modal first
      showRiskDisclaimerModal();
      return false;
    }
    return true;
  }

})();
