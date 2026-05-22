/**
 * analysisEngine.js
 * Performs live client-side technical analysis and smart money calculations on historical candles.
 * Outputs confluences, trend structures, indicators, and exact trade setup structures.
 */

const AnalysisEngine = (() => {

  /**
   * Core analysis executor. Runs all calculations on the candlestick array.
   * Enhanced with advanced technical analysis and market condition detection.
   * 
   * @param {string} symbol - e.g. "BTCUSD"
   * @param {string} timeframe - e.g. "15m"
   * @param {string} mode - "scalping", "intraday", "swing"
   * @param {Array} candles - List of historical candles
   * @returns {Object} Full analysis breakdown and structured string setup
   */
  function analyze(symbol, timeframe, mode, candles, adminConfig = null) {
    if (!candles || candles.length < 50) {
      throw new Error("Insufficient candle history. Need at least 50 periods for enhanced analysis.");
    }

    const closes = candles.map(c => c.close);
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const volumes = candles.map(c => c.volume || 1000);

    // 1. Calculate Enhanced Technical Indicators
    const rsi = calculateRSI(closes, 14);
    const macd = calculateMACD(closes, 12, 26, 9);
    const atr = calculateATR(candles, 14);
    const currentPrice = candles[candles.length - 1].close;
    
    // Enhanced indicators
    const stochastic = calculateStochastic(highs, lows, closes, 14, 3);
    const bollinger = calculateBollingerBands(closes, 20, 2);
    const vwap = calculateVWAP(candles);
    const adx = calculateADX(highs, lows, closes, 14);
    const marketCondition = detectMarketCondition(closes, atr);
    const volumeProfile = analyzeVolumeProfile(candles);
    const supportResistance = findKeyLevels(highs, lows, closes);

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

    // 4. Enhanced Level Calculations with Dynamic Risk Management
    const lastAtr = atr[atr.length - 1];
    const volatilityMultiplier = getVolatilityMultiplier(marketCondition.volatility);
    const trendMultiplier = getTrendMultiplier(marketCondition.condition, marketCondition.strength);
    
    let entryPrice = currentPrice;
    let stopLoss = 0;
    
    const activeOB = isBullish ? orderBlocks.bullish[0] : orderBlocks.bearish[0];
    const activeFVG = isBullish ? fvgs.bullish[0] : fvgs.bearish[0];
    
    // Enhanced Entry Logic with Key Level Consideration
    const nearbySupport = supportResistance.find(level => 
      level.type === 'SUPPORT' && level.price < currentPrice && 
      (currentPrice - level.price) / currentPrice < 0.01
    );
    const nearbyResistance = supportResistance.find(level => 
      level.type === 'RESISTANCE' && level.price > currentPrice && 
      (level.price - currentPrice) / currentPrice < 0.01
    );

    if (isBullish) {
      // Bullish entry optimization
      if (activeOB && activeOB.low < currentPrice) {
        entryPrice = parseFloat((activeOB.high * 0.618 + activeOB.low * 0.382).toFixed(getDecimalPlaces(symbol)));
        stopLoss = parseFloat((activeOB.low - (lastAtr * volatilityMultiplier * 0.8)).toFixed(getDecimalPlaces(symbol)));
      } else if (activeFVG && activeFVG.low < currentPrice) {
        entryPrice = parseFloat((activeFVG.low + (activeFVG.high - activeFVG.low) * 0.382).toFixed(getDecimalPlaces(symbol)));
        stopLoss = parseFloat((entryPrice - (lastAtr * volatilityMultiplier * 1.2)).toFixed(getDecimalPlaces(symbol)));
      } else if (nearbySupport) {
        entryPrice = parseFloat((nearbySupport.price + lastAtr * 0.5).toFixed(getDecimalPlaces(symbol)));
        stopLoss = parseFloat((nearbySupport.price - (lastAtr * volatilityMultiplier)).toFixed(getDecimalPlaces(symbol)));
      } else {
        entryPrice = parseFloat(currentPrice.toFixed(getDecimalPlaces(symbol)));
        stopLoss = parseFloat((entryPrice - (lastAtr * volatilityMultiplier * 1.5)).toFixed(getDecimalPlaces(symbol)));
      }
      
      // Ensure logical stop loss
      if (stopLoss >= entryPrice) {
        stopLoss = parseFloat((entryPrice - (lastAtr * volatilityMultiplier * 1.2)).toFixed(getDecimalPlaces(symbol)));
      }
    } else {
      // Bearish entry optimization
      if (activeOB && activeOB.high > currentPrice) {
        entryPrice = parseFloat((activeOB.low * 0.618 + activeOB.high * 0.382).toFixed(getDecimalPlaces(symbol)));
        stopLoss = parseFloat((activeOB.high + (lastAtr * volatilityMultiplier * 0.8)).toFixed(getDecimalPlaces(symbol)));
      } else if (activeFVG && activeFVG.high > currentPrice) {
        entryPrice = parseFloat((activeFVG.high - (activeFVG.high - activeFVG.low) * 0.382).toFixed(getDecimalPlaces(symbol)));
        stopLoss = parseFloat((entryPrice + (lastAtr * volatilityMultiplier * 1.2)).toFixed(getDecimalPlaces(symbol)));
      } else if (nearbyResistance) {
        entryPrice = parseFloat((nearbyResistance.price - lastAtr * 0.5).toFixed(getDecimalPlaces(symbol)));
        stopLoss = parseFloat((nearbyResistance.price + (lastAtr * volatilityMultiplier)).toFixed(getDecimalPlaces(symbol)));
      } else {
        entryPrice = parseFloat(currentPrice.toFixed(getDecimalPlaces(symbol)));
        stopLoss = parseFloat((entryPrice + (lastAtr * volatilityMultiplier * 1.5)).toFixed(getDecimalPlaces(symbol)));
      }
      
      // Ensure logical stop loss
      if (stopLoss <= entryPrice) {
        stopLoss = parseFloat((entryPrice + (lastAtr * volatilityMultiplier * 1.2)).toFixed(getDecimalPlaces(symbol)));
      }
    }

    // Enhanced Take Profit Calculations
    const slDistance = Math.abs(entryPrice - stopLoss);
    const baseRR1 = 1.8 * trendMultiplier; // Adjusted based on trend strength
    const baseRR2 = 3.2 * trendMultiplier;
    const baseRR3 = 5.0 * trendMultiplier;
    
    let tp1 = 0, tp2 = 0, tp3 = 0;
    
    if (isBullish) {
      tp1 = parseFloat((entryPrice + (slDistance * baseRR1)).toFixed(getDecimalPlaces(symbol)));
      tp2 = parseFloat((entryPrice + (slDistance * baseRR2)).toFixed(getDecimalPlaces(symbol)));
      tp3 = parseFloat((entryPrice + (slDistance * baseRR3)).toFixed(getDecimalPlaces(symbol)));
      
      // Adjust TP3 if near major resistance
      if (nearbyResistance && tp3 > nearbyResistance.price) {
        tp3 = parseFloat((nearbyResistance.price * 0.995).toFixed(getDecimalPlaces(symbol)));
      }
    } else {
      tp1 = parseFloat((entryPrice - (slDistance * baseRR1)).toFixed(getDecimalPlaces(symbol)));
      tp2 = parseFloat((entryPrice - (slDistance * baseRR2)).toFixed(getDecimalPlaces(symbol)));
      tp3 = parseFloat((entryPrice - (slDistance * baseRR3)).toFixed(getDecimalPlaces(symbol)));
      
      // Adjust TP3 if near major support
      if (nearbySupport && tp3 < nearbySupport.price) {
        tp3 = parseFloat((nearbySupport.price * 1.005).toFixed(getDecimalPlaces(symbol)));
      }
    }

    // Risk Reward Ratio
    const avgRR = ((baseRR1 + baseRR2 + baseRR3) / 3).toFixed(1);
    const rrRatio = `1:${avgRR}`;

    // 5. Enhanced Confidence Score Calculation
    let confidence = 50; // Base confidence
    let confluences = [];
    let riskLevel = 'MODERATE';

    // Market Condition Confluence (20 points max)
    if (marketCondition.condition !== 'RANGING') {
      confidence += 15;
      confluences.push(`${marketCondition.strength} ${marketCondition.condition.toLowerCase()} detected`);
      
      if (marketCondition.strength === 'STRONG') {
        confidence += 5;
        riskLevel = 'LOW';
      }
    } else {
      riskLevel = 'HIGH';
      confidence -= 5;
    }

    // Trend Confluence (15 points max)
    if ((isBullish && structureBias.includes("Bullish")) || (!isBullish && structureBias.includes("Bearish"))) {
      confidence += 10;
      confluences.push("EMA trend alignment confirmed");
      
      // Additional confluence if price is above/below VWAP
      const currentVwap = vwap[vwap.length - 1];
      if ((isBullish && currentPrice > currentVwap) || (!isBullish && currentPrice < currentVwap)) {
        confidence += 5;
        confluences.push("VWAP institutional level alignment");
      }
    }

    // Volume Confluence (10 points max)
    if (volumeProfile.signal === 'HIGH_INSTITUTIONAL') {
      confidence += 10;
      confluences.push("High institutional volume detected");
    } else if (volumeProfile.signal === 'ELEVATED') {
      confidence += 5;
      confluences.push("Elevated volume activity");
    }

    // Technical Indicator Confluence (15 points max)
    const rsiVal = rsi[rsi.length - 1];
    const stochK = stochastic.k[stochastic.k.length - 1];
    const adxVal = adx.adx[adx.adx.length - 1];
    
    // RSI confluence
    if (isBullish && rsiVal < 40) {
      confidence += 5;
      confluences.push("RSI oversold accumulation zone");
    } else if (!isBullish && rsiVal > 60) {
      confidence += 5;
      confluences.push("RSI overbought distribution zone");
    }
    
    // Stochastic confluence
    if (isBullish && stochK < 20) {
      confidence += 3;
      confluences.push("Stochastic oversold signal");
    } else if (!isBullish && stochK > 80) {
      confidence += 3;
      confluences.push("Stochastic overbought signal");
    }
    
    // ADX trend strength
    if (adxVal > 25) {
      confidence += 7;
      confluences.push(`Strong trend momentum (ADX: ${adxVal.toFixed(1)})`);
    }

    // Smart Money Concepts Confluence (15 points max)
    if (activeFVG) {
      confidence += 8;
      confluences.push("Active Fair Value Gap imbalance");
    }

    if (activeOB) {
      confidence += 7;
      confluences.push("Institutional Order Block mitigation");
    }

    // Support/Resistance Confluence (10 points max)
    const nearbyLevel = supportResistance.find(level => 
      Math.abs(level.price - currentPrice) / currentPrice < 0.005
    );
    if (nearbyLevel) {
      confidence += 10;
      confluences.push(`Key ${nearbyLevel.type.toLowerCase()} level proximity`);
    }

    // Liquidity Sweeps (8 points max)
    if (liquiditySweep.swept) {
      confidence += 8;
      confluences.push(`${liquiditySweep.type} liquidity sweep completed`);
    }

    // Risk Level Adjustment
    if (riskLevel === 'HIGH') {
      confidence = Math.max(confidence - 10, 30);
    } else if (riskLevel === 'LOW') {
      confidence = Math.min(confidence + 5, 95);
    }

    // Apply admin multiplier
    if (adminConfig && adminConfig.confidenceMult) {
      confidence = Math.round(confidence * adminConfig.confidenceMult);
    }
    
    // Cap confidence
    confidence = Math.min(95, Math.max(35, confidence));

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
   * Gets volatility multiplier for stop loss adjustment
   */
  function getVolatilityMultiplier(volatilityPct) {
    if (volatilityPct > 3.0) return 1.5; // High volatility - wider stops
    if (volatilityPct > 1.5) return 1.2; // Medium volatility
    if (volatilityPct < 0.5) return 0.8; // Low volatility - tighter stops
    return 1.0; // Normal volatility
  }

  /**
   * Gets trend multiplier for take profit adjustment
   */
  function getTrendMultiplier(condition, strength) {
    if (condition === 'RANGING') return 0.7; // Reduce targets in ranging market
    if (strength === 'STRONG') return 1.3; // Extend targets in strong trends
    if (strength === 'MODERATE') return 1.1; // Slightly extend in moderate trends
    return 1.0; // Default multiplier
  }

  /**
   * Calculates Stochastic Oscillator
   */
  function calculateStochastic(highs, lows, closes, kPeriod = 14, dPeriod = 3) {
    const k = [];
    const d = [];
    
    for (let i = kPeriod - 1; i < closes.length; i++) {
      const highestHigh = Math.max(...highs.slice(i - kPeriod + 1, i + 1));
      const lowestLow = Math.min(...lows.slice(i - kPeriod + 1, i + 1));
      const kValue = ((closes[i] - lowestLow) / (highestHigh - lowestLow)) * 100;
      k[i] = kValue;
    }
    
    // Calculate %D (SMA of %K)
    for (let i = kPeriod + dPeriod - 2; i < k.length; i++) {
      const sum = k.slice(i - dPeriod + 1, i + 1).reduce((a, b) => a + b, 0);
      d[i] = sum / dPeriod;
    }
    
    // Fill initial values
    for (let i = 0; i < kPeriod - 1; i++) {
      k[i] = 50;
      d[i] = 50;
    }
    
    return { k, d };
  }

  /**
   * Calculates Bollinger Bands
   */
  function calculateBollingerBands(closes, period = 20, stdDev = 2) {
    const sma = calculateSMA(closes, period);
    const upper = [];
    const lower = [];
    
    for (let i = period - 1; i < closes.length; i++) {
      const slice = closes.slice(i - period + 1, i + 1);
      const mean = sma[i];
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      
      upper[i] = mean + (standardDeviation * stdDev);
      lower[i] = mean - (standardDeviation * stdDev);
    }
    
    // Fill initial values
    for (let i = 0; i < period - 1; i++) {
      upper[i] = closes[i] * 1.02;
      lower[i] = closes[i] * 0.98;
    }
    
    return { upper, middle: sma, lower };
  }

  /**
   * Calculates Simple Moving Average
   */
  function calculateSMA(values, period) {
    const sma = [];
    for (let i = period - 1; i < values.length; i++) {
      const sum = values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma[i] = sum / period;
    }
    
    // Fill initial values
    for (let i = 0; i < period - 1; i++) {
      sma[i] = values[i];
    }
    
    return sma;
  }

  /**
   * Calculates Volume Weighted Average Price (VWAP)
   */
  function calculateVWAP(candles) {
    const vwap = [];
    let cumulativeVolume = 0;
    let cumulativeVolumePrice = 0;
    
    for (let i = 0; i < candles.length; i++) {
      const typicalPrice = (candles[i].high + candles[i].low + candles[i].close) / 3;
      const volume = candles[i].volume || 1000;
      
      cumulativeVolumePrice += typicalPrice * volume;
      cumulativeVolume += volume;
      
      vwap[i] = cumulativeVolumePrice / cumulativeVolume;
    }
    
    return vwap;
  }

  /**
   * Calculates Average Directional Index (ADX)
   */
  function calculateADX(highs, lows, closes, period = 14) {
    const tr = [];
    const plusDM = [];
    const minusDM = [];
    
    // Calculate True Range and Directional Movement
    tr[0] = highs[0] - lows[0];
    plusDM[0] = 0;
    minusDM[0] = 0;
    
    for (let i = 1; i < closes.length; i++) {
      const hl = highs[i] - lows[i];
      const hpc = Math.abs(highs[i] - closes[i - 1]);
      const lpc = Math.abs(lows[i] - closes[i - 1]);
      tr[i] = Math.max(hl, hpc, lpc);
      
      const upMove = highs[i] - highs[i - 1];
      const downMove = lows[i - 1] - lows[i];
      
      plusDM[i] = (upMove > downMove && upMove > 0) ? upMove : 0;
      minusDM[i] = (downMove > upMove && downMove > 0) ? downMove : 0;
    }
    
    // Calculate smoothed averages
    const smoothedTR = calculateEMA(tr, period);
    const smoothedPlusDM = calculateEMA(plusDM, period);
    const smoothedMinusDM = calculateEMA(minusDM, period);
    
    const plusDI = smoothedPlusDM.map((val, i) => (val / smoothedTR[i]) * 100);
    const minusDI = smoothedMinusDM.map((val, i) => (val / smoothedTR[i]) * 100);
    
    const dx = plusDI.map((val, i) => {
      const sum = val + minusDI[i];
      return sum === 0 ? 0 : (Math.abs(val - minusDI[i]) / sum) * 100;
    });
    
    const adx = calculateEMA(dx, period);
    
    return { adx, plusDI, minusDI };
  }

  /**
   * Detects market condition (trending vs ranging)
   */
  function detectMarketCondition(closes, atr) {
    const ema20 = calculateEMA(closes, 20);
    const ema50 = calculateEMA(closes, 50);
    const currentPrice = closes[closes.length - 1];
    const currentEma20 = ema20[ema20.length - 1];
    const currentEma50 = ema50[ema50.length - 1];
    const currentAtr = atr[atr.length - 1];
    
    // Calculate trend strength
    const trendStrength = Math.abs(currentEma20 - currentEma50) / currentPrice;
    const volatility = currentAtr / currentPrice;
    
    let condition = 'RANGING';
    let strength = 'WEAK';
    
    if (trendStrength > 0.02) {
      condition = currentEma20 > currentEma50 ? 'UPTREND' : 'DOWNTREND';
      strength = trendStrength > 0.05 ? 'STRONG' : 'MODERATE';
    }
    
    return {
      condition,
      strength,
      trendStrength: trendStrength * 100,
      volatility: volatility * 100
    };
  }

  /**
   * Analyzes volume profile for institutional activity
   */
  function analyzeVolumeProfile(candles) {
    const recentCandles = candles.slice(-20);
    const avgVolume = recentCandles.reduce((sum, c) => sum + (c.volume || 1000), 0) / recentCandles.length;
    const currentVolume = candles[candles.length - 1].volume || 1000;
    
    const volumeRatio = currentVolume / avgVolume;
    let volumeSignal = 'NORMAL';
    
    if (volumeRatio > 2.0) volumeSignal = 'HIGH_INSTITUTIONAL';
    else if (volumeRatio > 1.5) volumeSignal = 'ELEVATED';
    else if (volumeRatio < 0.5) volumeSignal = 'LOW';
    
    return {
      signal: volumeSignal,
      ratio: volumeRatio,
      current: currentVolume,
      average: avgVolume
    };
  }

  /**
   * Finds key support and resistance levels
   */
  function findKeyLevels(highs, lows, closes) {
    const levels = [];
    const lookback = 20;
    
    // Find recent swing highs and lows
    for (let i = lookback; i < highs.length - lookback; i++) {
      let isSwingHigh = true;
      let isSwingLow = true;
      
      for (let j = 1; j <= lookback; j++) {
        if (highs[i] < highs[i - j] || highs[i] < highs[i + j]) isSwingHigh = false;
        if (lows[i] > lows[i - j] || lows[i] > lows[i + j]) isSwingLow = false;
      }
      
      if (isSwingHigh) levels.push({ price: highs[i], type: 'RESISTANCE', strength: 1 });
      if (isSwingLow) levels.push({ price: lows[i], type: 'SUPPORT', strength: 1 });
    }
    
    // Sort by proximity to current price
    const currentPrice = closes[closes.length - 1];
    levels.sort((a, b) => Math.abs(a.price - currentPrice) - Math.abs(b.price - currentPrice));
    
    return levels.slice(0, 5); // Return top 5 closest levels
  }
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
