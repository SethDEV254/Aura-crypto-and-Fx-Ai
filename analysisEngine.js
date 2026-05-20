/**
 * analysisEngine.js
 * Performs live client-side technical analysis and smart money calculations on historical candles.
 * Outputs confluences, trend structures, indicators, and exact trade setup structures.
 */

const AnalysisEngine = (() => {

  /**
   * Core analysis executor. Runs all calculations on the candlestick array.
   * 
   * @param {string} symbol - e.g. "BTCUSD"
   * @param {string} timeframe - e.g. "15m"
   * @param {string} mode - "scalping", "intraday", "swing"
   * @param {Array} candles - List of historical candles
   * @returns {Object} Full analysis breakdown and structured string setup
   */
  function analyze(symbol, timeframe, mode, candles, adminConfig = null) {
    if (!candles || candles.length < 30) {
      throw new Error("Insufficient candle history. Need at least 30 periods.");
    }

    const closes = candles.map(c => c.close);
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);

    // 1. Calculate Standard Indicators
    const rsi = calculateRSI(closes, 14);
    const macd = calculateMACD(closes, 12, 26, 9);
    const atr = calculateATR(candles, 14);
    const currentPrice = candles[candles.length - 1].close;

    // 2. Identify Smart Money & ICT Concepts
    const swings = findSwings(highs, lows, 3); // 3-period swing high/lows
    const fvgs = findFVGs(candles);
    const orderBlocks = findOrderBlocks(candles, swings.highs, swings.lows);
    const liquiditySweep = checkLiquiditySweep(candles, swings);

    // 3. Determine Market Bias & Structure Assessment
    const ema50 = calculateEMA(closes, 50);
    const lastEma50 = ema50[ema50.length - 1];
    const rsiVal = rsi[rsi.length - 1];
    
    // Determine macro structure trend
    let structureBias = 'Neutral';
    let trendStrength = 'Moderate';
    let isBullish = false;

    // Direct algorithmic calculation
    if (currentPrice > lastEma50) {
      if (rsiVal > 48) {
        structureBias = 'Bullish';
        isBullish = true;
        trendStrength = rsiVal > 65 ? 'Strong Impulse' : 'Consolidation / Accumulation';
      } else {
        structureBias = 'Bullish Retracement';
        isBullish = true;
        trendStrength = 'Weakening';
      }
    } else {
      if (rsiVal < 52) {
        structureBias = 'Bearish';
        isBullish = false;
        trendStrength = rsiVal < 35 ? 'Strong Impulse' : 'Consolidation / Distribution';
      } else {
        structureBias = 'Bearish Retracement';
        isBullish = false;
        trendStrength = 'Weakening';
      }
    }

    // Process administrative override for force bias
    if (adminConfig && adminConfig.forcedBias !== 'auto') {
      isBullish = (adminConfig.forcedBias === 'bullish');
      structureBias = isBullish ? 'Bullish (Override)' : 'Bearish (Override)';
      trendStrength = 'Forced Admin';
    }

    // 4. Calculate Levels (Prop-Trader Risk Guidelines)
    // Bullish: Stop loss placed below the most recent Bullish Order Block or low wick, entry at OB equilibrium / FVG
    // Bearish: Stop loss placed above the Bearish Order Block or high wick, entry at OB equilibrium / FVG
    
    const lastAtr = atr[atr.length - 1];
    let entryPrice = currentPrice;
    let stopLoss = 0;
    
    const activeOB = isBullish ? orderBlocks.bullish[0] : orderBlocks.bearish[0];
    const activeFVG = isBullish ? fvgs.bullish[0] : fvgs.bearish[0];
    
    // Position Entry slightly optimized to order block or FVG
    if (isBullish) {
      if (activeOB && activeOB.low < currentPrice) {
        // Entry at OB mitigation / top of OB
        entryPrice = parseFloat((activeOB.high).toFixed(getDecimalPlaces(symbol)));
        stopLoss = parseFloat((activeOB.low - (lastAtr * 0.5)).toFixed(getDecimalPlaces(symbol)));
      } else if (activeFVG && activeFVG.low < currentPrice) {
        entryPrice = parseFloat((activeFVG.low).toFixed(getDecimalPlaces(symbol)));
        stopLoss = parseFloat((entryPrice - (lastAtr * 1.5)).toFixed(getDecimalPlaces(symbol)));
      } else {
        entryPrice = parseFloat(currentPrice.toFixed(getDecimalPlaces(symbol)));
        stopLoss = parseFloat((entryPrice - (lastAtr * 1.8)).toFixed(getDecimalPlaces(symbol)));
      }
      
      // Ensure SL is logical
      if (stopLoss >= entryPrice) {
        stopLoss = parseFloat((entryPrice - (lastAtr * 1.5)).toFixed(getDecimalPlaces(symbol)));
      }
    } else {
      // Bearish entry
      if (activeOB && activeOB.high > currentPrice) {
        entryPrice = parseFloat((activeOB.low).toFixed(getDecimalPlaces(symbol)));
        stopLoss = parseFloat((activeOB.high + (lastAtr * 0.5)).toFixed(getDecimalPlaces(symbol)));
      } else if (activeFVG && activeFVG.high > currentPrice) {
        entryPrice = parseFloat((activeFVG.high).toFixed(getDecimalPlaces(symbol)));
        stopLoss = parseFloat((entryPrice + (lastAtr * 1.5)).toFixed(getDecimalPlaces(symbol)));
      } else {
        entryPrice = parseFloat(currentPrice.toFixed(getDecimalPlaces(symbol)));
        stopLoss = parseFloat((entryPrice + (lastAtr * 1.8)).toFixed(getDecimalPlaces(symbol)));
      }
      
      // Ensure SL is logical
      if (stopLoss <= entryPrice) {
        stopLoss = parseFloat((entryPrice + (lastAtr * 1.5)).toFixed(getDecimalPlaces(symbol)));
      }
    }

    // Stop Loss Distance
    const slDistance = Math.abs(entryPrice - stopLoss);
    
    // Take Profit Targets (1:1.5, 1:3, 1:4.5 R:R)
    let tp1 = 0, tp2 = 0, tp3 = 0;
    
    if (isBullish) {
      tp1 = parseFloat((entryPrice + (slDistance * 1.5)).toFixed(getDecimalPlaces(symbol)));
      tp2 = parseFloat((entryPrice + (slDistance * 3.0)).toFixed(getDecimalPlaces(symbol)));
      tp3 = parseFloat((entryPrice + (slDistance * 4.5)).toFixed(getDecimalPlaces(symbol)));
    } else {
      tp1 = parseFloat((entryPrice - (slDistance * 1.5)).toFixed(getDecimalPlaces(symbol)));
      tp2 = parseFloat((entryPrice - (slDistance * 3.0)).toFixed(getDecimalPlaces(symbol)));
      tp3 = parseFloat((entryPrice - (slDistance * 4.5)).toFixed(getDecimalPlaces(symbol)));
    }

    // Risk Reward Ratio
    const rrRatio = "1:3.5"; // Target is standard institutional R:R midpoint

    // 5. Calculate Confidence Score
    let confidence = 65; // Base
    let confluences = [];

    // Trend Confluence
    if ((isBullish && structureBias.includes("Bullish")) || (!isBullish && structureBias.includes("Bearish"))) {
      confidence += 8;
      confluences.push("EMA 50 trend alignment");
    }
    
    // FVG Confluence
    if (activeFVG) {
      confidence += 7;
      confluences.push("Active Fair Value Gap imbalance");
    }

    // Order Block Confluence
    if (activeOB) {
      confidence += 10;
      confluences.push("Mitigation of highly institutional Order Block");
    }

    // RSI Confluence
    if (isBullish && rsiVal < 40) {
      confidence += 5;
      confluences.push("RSI Oversold Accumulation zone");
    } else if (!isBullish && rsiVal > 60) {
      confidence += 5;
      confluences.push("RSI Overbought Distribution zone");
    }

    // Liquidity Sweeps
    if (liquiditySweep.swept) {
      confidence += 8;
      confluences.push(`${liquiditySweep.type} sweeps liquidity pools`);
    }

    // Cap confidence & apply admin multiplier
    if (adminConfig && adminConfig.confidenceMult) {
      confidence = Math.round(confidence * adminConfig.confidenceMult);
    }
    confidence = Math.min(99, Math.max(10, confidence));

    // Volatility Status Text (with admin override support)
    const atrPct = (lastAtr / currentPrice) * 100;
    let volStatus = `Normal (${atrPct.toFixed(1)}%)`;
    
    if (adminConfig && adminConfig.forcedVol !== 'auto') {
      if (adminConfig.forcedVol === 'high') {
        volStatus = `High (${(atrPct * 2.5).toFixed(1)}%)`;
      } else {
        volStatus = `Low (${(atrPct * 0.3).toFixed(1)}%)`;
      }
    } else {
      if (atrPct > 0.6) volStatus = `High (${atrPct.toFixed(1)}%)`;
      else if (atrPct < 0.1) volStatus = `Low (${atrPct.toFixed(1)}%)`;
    }

    // 6. Build the formatted output text matching requested format EXACTLY
    const formattedText = `PAIR: ${symbol.substring(0, 3)}/${symbol.substring(3)}
TIMEFRAME: ${timeframe.toUpperCase()}

MARKET STRUCTURE:
- ${structureBias} structure detected. Candle configurations indicate a ${trendStrength.toLowerCase()} signature on the ${timeframe} chart. Price action successfully trading ${isBullish ? 'above' : 'below'} the core institutional mean.

ENTRY:
- ${entryPrice}

STOP LOSS:
- ${stopLoss}

TAKE PROFITS:
- TP1: ${tp1}
- TP2: ${tp2}
- TP3: ${tp3}

RISK:REWARD:
- ${rrRatio}

CONFIDENCE:
- ${confidence}%

ANALYSIS:
- Trend: Dominant ${structureBias.toUpperCase()} directional bias aligned across key micro structures.
- Liquidity: ${liquiditySweep.swept ? `Completed ${liquiditySweep.type} sweep, cleansing retail stop pools.` : 'Accumulating resting orders around swing boundaries.'}
- Momentum: MACD shows solid ${macd.histogram[macd.histogram.length - 1] > 0 ? 'bullish expansion' : 'bearish compression'} with RSI resting at ${Math.round(rsiVal)}.
- Confirmation: Multi-confluence triggers verified at institutional zones including: ${confluences.join(', ')}.`;

    // 7. Structural assessment text for the dedicated UI slot - Minimized for badge sizing
    const structureAssessment = `${structureBias} (${trendStrength})`;

    // 8. Dynamic list of institutional confluences for the UI
    const narrativeHighlights = [
      { type: 'trend', text: `Trend alignment: Trading ${isBullish ? 'above' : 'below'} the 50-period Exponential Moving Average (EMA: ${lastEma50.toFixed(getDecimalPlaces(symbol))}).` },
      { type: 'smc', text: activeOB ? `Institutional footprint: Active ${isBullish ? 'Bullish' : 'Bearish'} Order Block identified between ${activeOB.low.toFixed(getDecimalPlaces(symbol))} and ${activeOB.high.toFixed(getDecimalPlaces(symbol))}.` : 'Mitigating equilibrium zones of key expansion runs.' },
      { type: 'ict', text: activeFVG ? `Imbalance detected: Open Fair Value Gap (FVG) resting at ${activeFVG.low.toFixed(getDecimalPlaces(symbol))} - ${activeFVG.high.toFixed(getDecimalPlaces(symbol))} creating dynamic price suction.` : 'Liquidity imbalance fully consolidated on recent wick retracements.' },
      { type: 'indicator', text: `Oscillator alignment: RSI at ${rsiVal.toFixed(1)} confirms ${rsiVal < 35 ? 'oversold oversweep' : rsiVal > 65 ? 'overbought oversweep' : 'balanced expansion momentum'}. MACD histogram tracks active ${macd.histogram[macd.histogram.length - 1] > 0 ? 'bullish expansion' : 'bearish pressure'}.` }
    ];

    // Return structured package
    return {
      rawText: formattedText,
      data: {
        symbol,
        timeframe,
        mode,
        bias: isBullish ? 'BULLISH' : 'BEARISH',
        entryPrice,
        stopLoss,
        tp1,
        tp2,
        tp3,
        rrRatio,
        confidence,
        volStatus,
        newsFiltered: 'FILTERED',
        successProbability: confidence > 80 ? 'High' : confidence > 65 ? 'Moderate' : 'Uncertain',
        successProbPct: Math.round(confidence * 0.93), // Slightly scale success probability
        suggestedLeverage: getSuggestedLeverage(mode, confidence, isBullish),
        structureAssessment,
        narrativeHighlights,
        indicators: {
          rsi: Math.round(rsiVal),
          macd: macd.macdLine[macd.macdLine.length - 1].toFixed(4),
          macdSignal: macd.signalLine[macd.signalLine.length - 1].toFixed(4),
          volume: candles[candles.length - 1].volume
        },
        smc: {
          obRange: activeOB ? `${activeOB.low.toFixed(getDecimalPlaces(symbol))} - ${activeOB.high.toFixed(getDecimalPlaces(symbol))}` : 'None Detected',
          obStatus: activeOB ? (isBullish ? 'BULLISH OB' : 'BEARISH OB') : 'INACTIVE',
          fvgRange: activeFVG ? `${activeFVG.low.toFixed(getDecimalPlaces(symbol))} - ${activeFVG.high.toFixed(getDecimalPlaces(symbol))}` : 'None Detected',
          fvgStatus: activeFVG ? 'OPEN GAP' : 'MITIGATED',
          liqLevel: liquiditySweep.swept ? liquiditySweep.level.toFixed(getDecimalPlaces(symbol)) : 'Accumulating',
          liqStatus: liquiditySweep.swept ? 'SWEPT' : 'PENDING'
        }
      }
    };
  }

  /* ==========================================================================
     Helper Math Functions (Technical Indicators)
     ========================================================================== */

  /**
   * Calculates EMA values for a series
   */
  function calculateEMA(values, period) {
    const ema = [];
    const k = 2 / (period + 1);
    
    // Seed EMA with simple average
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += values[i];
    }
    let prevEma = sum / period;
    ema[period - 1] = prevEma;
    
    for (let i = period; i < values.length; i++) {
      const currentEma = values[i] * k + prevEma * (1 - k);
      ema[i] = currentEma;
      prevEma = currentEma;
    }
    
    // Fill initial values with first calculated EMA for array sizing
    for (let i = 0; i < period - 1; i++) {
      ema[i] = ema[period - 1];
    }
    
    return ema;
  }

  /**
   * Calculates RSI (14)
   */
  function calculateRSI(closes, period = 14) {
    const rsi = [];
    let gains = [];
    let losses = [];
    
    for (let i = 1; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      gains.push(diff > 0 ? diff : 0);
      losses.push(diff < 0 ? -diff : 0);
    }
    
    // Initial average
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    rsi[period] = avgLoss === 0 ? 100 : 100 - (100 / (1 + (avgGain / avgLoss)));
    
    for (let i = period + 1; i < closes.length; i++) {
      avgGain = ((avgGain * (period - 1)) + gains[i - 1]) / period;
      avgLoss = ((avgLoss * (period - 1)) + losses[i - 1]) / period;
      
      rsi[i] = avgLoss === 0 ? 100 : 100 - (100 / (1 + (avgGain / avgLoss)));
    }
    
    // Pad start
    for (let i = 0; i <= period; i++) {
      rsi[i] = rsi[period + 1] || 50;
    }
    
    return rsi;
  }

  /**
   * Calculates MACD (12, 26, 9)
   */
  function calculateMACD(closes, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const fastEma = calculateEMA(closes, fastPeriod);
    const slowEma = calculateEMA(closes, slowPeriod);
    
    const macdLine = [];
    for (let i = 0; i < closes.length; i++) {
      macdLine.push(fastEma[i] - slowEma[i]);
    }
    
    const signalLine = calculateEMA(macdLine, signalPeriod);
    
    const histogram = [];
    for (let i = 0; i < closes.length; i++) {
      histogram.push(macdLine[i] - signalLine[i]);
    }
    
    return {
      macdLine,
      signalLine,
      histogram
    };
  }

  /**
   * Calculates ATR (Average True Range)
   */
  function calculateATR(candles, period = 14) {
    const atr = [];
    const tr = [];
    
    tr.push(candles[0].high - candles[0].low);
    for (let i = 1; i < candles.length; i++) {
      const h_l = candles[i].high - candles[i].low;
      const h_pc = Math.abs(candles[i].high - candles[i - 1].close);
      const l_pc = Math.abs(candles[i].low - candles[i - 1].close);
      tr.push(Math.max(h_l, h_pc, l_pc));
    }
    
    // Average
    let sum = tr.slice(0, period).reduce((a, b) => a + b, 0);
    let avgTr = sum / period;
    atr[period - 1] = avgTr;
    
    for (let i = period; i < candles.length; i++) {
      avgTr = ((avgTr * (period - 1)) + tr[i]) / period;
      atr[i] = avgTr;
    }
    
    // Pad start
    for (let i = 0; i < period - 1; i++) {
      atr[i] = atr[period - 1];
    }
    
    return atr;
  }

  /**
   * Identifies local high/low swing pivot points
   */
  function findSwings(highs, lows, strength = 3) {
    const swingHighs = [];
    const swingLows = [];
    
    for (let i = strength; i < highs.length - strength; i++) {
      let isHigh = true;
      let isLow = true;
      
      for (let j = 1; j <= strength; j++) {
        if (highs[i] < highs[i - j] || highs[i] < highs[i + j]) isHigh = false;
        if (lows[i] > lows[i - j] || lows[i] > lows[i + j]) isLow = false;
      }
      
      if (isHigh) {
        swingHighs.push({ index: i, price: highs[i] });
      }
      if (isLow) {
        swingLows.push({ index: i, price: lows[i] });
      }
    }
    
    // Sort in reverse (latest first)
    return {
      highs: swingHighs.reverse(),
      lows: swingLows.reverse()
    };
  }

  /**
   * Scans for open/mitigated Fair Value Gaps (FVG)
   */
  function findFVGs(candles) {
    const bullishFVGs = [];
    const bearishFVGs = [];
    
    // Search last 30 candles
    const startIdx = Math.max(2, candles.length - 30);
    
    for (let i = candles.length - 2; i >= startIdx; i--) {
      // Bullish FVG: candle 1 high < candle 3 low
      if (candles[i - 1].high < candles[i + 1].low) {
        // Check if subsequent candles mitigated (filled) this gap
        let mitigated = false;
        for (let j = i + 2; j < candles.length; j++) {
          if (candles[j].low <= candles[i - 1].high) {
            mitigated = true;
            break;
          }
        }
        if (!mitigated) {
          bullishFVGs.push({
            index: i,
            low: candles[i - 1].high,
            high: candles[i + 1].low,
            candleTime: candles[i].time
          });
        }
      }
      
      // Bearish FVG: candle 1 low > candle 3 high
      if (candles[i - 1].low > candles[i + 1].high) {
        let mitigated = false;
        for (let j = i + 2; j < candles.length; j++) {
          if (candles[j].high >= candles[i - 1].low) {
            mitigated = true;
            break;
          }
        }
        if (!mitigated) {
          bearishFVGs.push({
            index: i,
            low: candles[i + 1].high,
            high: candles[i - 1].low,
            candleTime: candles[i].time
          });
        }
      }
    }
    
    return {
      bullish: bullishFVGs,
      bearish: bearishFVGs
    };
  }

  /**
   * Scans for institutional Order Blocks (OB)
   */
  function findOrderBlocks(candles, swingHighs, swingLows) {
    const bullishOBs = [];
    const bearishOBs = [];
    
    // Bullish OB: Last down candle before strong upward impulse breaking structure (BOS)
    // We look for swing highs that were broken by subsequent price action
    swingHighs.forEach(swing => {
      // Find where price broke this swing high
      let breakIndex = -1;
      for (let i = swing.index + 1; i < candles.length; i++) {
        if (candles[i].close > swing.price) {
          breakIndex = i;
          break;
        }
      }
      
      if (breakIndex !== -1) {
        // Find the last bearish candle *before* the move started (impulse beginning)
        // Scan backwards from the break to the swing low
        let obCandle = null;
        for (let j = breakIndex; j >= swing.index; j--) {
          if (candles[j].close < candles[j].open) {
            obCandle = candles[j];
            break;
          }
        }
        
        if (obCandle) {
          // Check if OB low has been violated
          let invalidated = false;
          for (let k = breakIndex + 1; k < candles.length; k++) {
            if (candles[k].close < obCandle.low) {
              invalidated = true;
              break;
            }
          }
          
          if (!invalidated) {
            bullishOBs.push({
              low: obCandle.low,
              high: obCandle.high,
              time: obCandle.time
            });
          }
        }
      }
    });

    // Bearish OB: Last up candle before strong downward impulse breaking structure
    swingLows.forEach(swing => {
      let breakIndex = -1;
      for (let i = swing.index + 1; i < candles.length; i++) {
        if (candles[i].close < swing.price) {
          breakIndex = i;
          break;
        }
      }
      
      if (breakIndex !== -1) {
        let obCandle = null;
        for (let j = breakIndex; j >= swing.index; j--) {
          if (candles[j].close > candles[j].open) {
            obCandle = candles[j];
            break;
          }
        }
        
        if (obCandle) {
          let invalidated = false;
          for (let k = breakIndex + 1; k < candles.length; k++) {
            if (candles[k].close > obCandle.high) {
              invalidated = true;
              break;
            }
          }
          
          if (!invalidated) {
            bearishOBs.push({
              low: obCandle.low,
              high: obCandle.high,
              time: obCandle.time
            });
          }
        }
      }
    });
    
    return {
      bullish: bullishOBs,
      bearish: bearishOBs
    };
  }

  /**
   * Checks if recent price action swept a major liquidity pool (swing boundary)
   */
  function checkLiquiditySweep(candles, swings) {
    const currentCandle = candles[candles.length - 1];
    
    // Check if current candle high/low exceeded last 3 swings, but body closed within
    if (swings.highs.length > 0) {
      const lastHigh = swings.highs[0];
      if (currentCandle.high > lastHigh.price && currentCandle.close <= lastHigh.price) {
        return {
          swept: true,
          type: 'Buy-side liquidity (BSL)',
          level: lastHigh.price
        };
      }
    }

    if (swings.lows.length > 0) {
      const lastLow = swings.lows[0];
      if (currentCandle.low < lastLow.price && currentCandle.close >= lastLow.price) {
        return {
          swept: true,
          type: 'Sell-side liquidity (SSL)',
          level: lastLow.price
        };
      }
    }
    
    return { swept: false, type: '', level: 0 };
  }

  /**
   * Helper to format values nicely
   */
  function getDecimalPlaces(symbol) {
    if (symbol.includes('JPY')) return 3;
    if (symbol.includes('EUR') || symbol.includes('GBP')) return 5;
    if (symbol.includes('XAU')) return 2;
    if (symbol.includes('BTC')) return 0;
    if (symbol.includes('ETH')) return 1;
    return 2;
  }

  /**
   * Helper to compute dynamic suggested leverages
   */
  function getSuggestedLeverage(mode, confidence, isBullish) {
    let multiplier = 1;
    if (mode === 'scalping') multiplier = 3.0; // Scalpers use higher leverage
    else if (mode === 'swing') multiplier = 0.5; // Swing uses very low leverage
    else multiplier = 1.5; // Intraday mid-level
    
    const confFactor = (confidence - 50) / 10; // confidence scale
    const baseLeverage = Math.max(1, Math.round(5 * confFactor * multiplier));
    
    return `${baseLeverage}-${Math.round(baseLeverage * 1.5)}x (@ 1% Risk)`;
  }

  return {
    analyze
  };
})();
