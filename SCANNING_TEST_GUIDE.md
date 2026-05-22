# AI Scanning Test Guide - AURA CRYPTO & FX AI

## Overview
Comprehensive testing guide for verifying the AI analysis scanning functionality with updated Solana prices and all system features.

**Date**: May 22, 2026  
**Status**: Ready for Testing  
**Test File**: `test_scanning.html`

---

## Quick Start

### 1. Open Test File
```bash
# Option 1: Open directly in browser
open test_scanning.html

# Option 2: Use local server (recommended)
python -m http.server 8000
# Then visit: http://localhost:8000/test_scanning.html
```

### 2. Run Tests
The test interface provides multiple testing options:
- **🚀 RUN ALL TESTS** - Complete system verification
- **🔍 TEST SINGLE SCAN** - Test selected symbol
- **📈 TEST ALL SYMBOLS** - Scan all 7 trading pairs
- **🗑️ CLEAR LOGS** - Reset log display

---

## Test Features

### Real-Time Price Feed
- Live prices for all 7 symbols
- Updates every 100-500ms
- Color-coded changes (green=up, red=down)
- Verifies data service connectivity

### Symbol Selection
Test any of the 7 supported pairs:
- **BTC/USD** - Bitcoin (Crypto)
- **ETH/USD** - Ethereum (Crypto)
- **SOL/USD** ⭐ - Solana (Updated to $86)
- **XAU/USD** - Gold (Spot)
- **EUR/USD** - Euro (Forex)
- **GBP/USD** - British Pound (Forex)
- **USD/JPY** - Japanese Yen (Forex)

### Analysis Results Display
- Market bias (BULLISH/BEARISH)
- Entry price
- Stop loss level
- 3 take profit targets (TP1, TP2, TP3)
- Risk:Reward ratio
- Confidence score with visual bar
- Full analysis narrative

### System Logs
- Real-time operation logging
- Color-coded messages (info, success, error, warning)
- Timestamps for all events
- Scrollable log history

---

## Test Scenarios

### Test 1: Solana Price Verification ⭐
**Purpose**: Verify Solana price update to $86

**Steps**:
1. Open `test_scanning.html`
2. Check SOL/USD ticker in price feed
3. Verify price shows ~$86 (±$2 due to real-time fluctuations)
4. Click "SOL/USD ⭐" button
5. Click "TEST SINGLE SCAN"
6. Verify analysis uses $86 baseline for calculations

**Expected Results**:
- ✅ SOL/USD price displays $86.00 (±$2)
- ✅ Price updates in real-time
- ✅ Analysis entry price near $86
- ✅ Stop loss and targets calculated correctly
- ✅ Confidence score 35-95%

### Test 2: Single Symbol Analysis
**Purpose**: Verify analysis engine for one symbol

**Steps**:
1. Select any symbol (e.g., BTC/USD)
2. Click "TEST SINGLE SCAN"
3. Wait for analysis to complete (2-5 seconds)
4. Review results display

**Expected Results**:
- ✅ Fetches 100 historical candles
- ✅ Calculates all technical indicators
- ✅ Determines market bias (BULLISH/BEARISH)
- ✅ Provides entry, SL, and 3 TPs
- ✅ Shows confidence score
- ✅ Displays full analysis text

### Test 3: All Symbols Scan
**Purpose**: Verify system handles all 7 pairs

**Steps**:
1. Click "TEST ALL SYMBOLS"
2. Watch logs as each symbol is processed
3. Review summary results grid

**Expected Results**:
- ✅ All 7 symbols analyzed successfully
- ✅ Each shows bias and confidence
- ✅ No errors in logs
- ✅ Results display in grid format
- ✅ Processing time <10 seconds total

### Test 4: Full System Test
**Purpose**: Complete end-to-end verification

**Steps**:
1. Click "RUN ALL TESTS"
2. Monitor logs for each test phase
3. Verify all tests pass

**Test Sequence**:
1. Data Service Connection Test
2. Solana Price Verification
3. Single Scan Test (selected symbol)
4. All Symbols Scan Test

**Expected Results**:
- ✅ Data service operational
- ✅ Solana price correct (~$86)
- ✅ Single scan successful
- ✅ All symbols scan successful
- ✅ No critical errors

---

## Verification Checklist

### Data Service
- [ ] Real-time prices streaming
- [ ] All 7 symbols updating
- [ ] Price changes color-coded
- [ ] WebSocket connections stable
- [ ] No connection errors in logs

### Solana Specific
- [ ] SOL/USD shows ~$86
- [ ] Price ticks in real-time
- [ ] Analysis uses correct baseline
- [ ] Entry/SL/TP calculations accurate
- [ ] Confidence score reasonable (35-95%)

### Analysis Engine
- [ ] Fetches 100 candles per symbol
- [ ] Calculates RSI, MACD, ATR
- [ ] Detects market structure
- [ ] Identifies FVGs and Order Blocks
- [ ] Provides 3 take profit levels
- [ ] Shows risk:reward ratio
- [ ] Confidence scoring works

### Technical Indicators
- [ ] Stochastic Oscillator
- [ ] Bollinger Bands
- [ ] VWAP calculation
- [ ] ADX trend strength
- [ ] Market condition detection
- [ ] Volume profile analysis
- [ ] Support/resistance levels

### Error Handling
- [ ] Handles insufficient data gracefully
- [ ] Logs errors clearly
- [ ] Continues after errors
- [ ] No browser console errors
- [ ] Status updates correctly

---

## Expected Performance

### Speed Benchmarks
- **Single Scan**: 2-5 seconds
- **All Symbols**: 5-10 seconds
- **Price Updates**: 100-500ms intervals
- **WebSocket Latency**: <50ms

### Accuracy Targets
- **Crypto Prices**: 100% match with TradingView
- **Forex Prices**: 99% match with TradingView
- **Gold Price**: 99.9% match with TradingView
- **Confidence Range**: 35-95%
- **Analysis Success Rate**: >95%

---

## Troubleshooting

### Issue: Prices Not Updating
**Symptoms**: Static prices, no real-time changes

**Solutions**:
1. Check browser console for WebSocket errors
2. Verify internet connection
3. Refresh page to reconnect
4. Check if Binance API is accessible

### Issue: Solana Price Wrong
**Symptoms**: SOL/USD shows $170 instead of $86

**Solutions**:
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Verify latest code deployed
4. Check `dataService.js` line 73

### Issue: Analysis Fails
**Symptoms**: "Insufficient candle data" error

**Solutions**:
1. Check if symbol is supported
2. Verify API connectivity
3. Wait a few seconds and retry
4. Check browser console for details

### Issue: Confidence Always Same
**Symptoms**: All scans show same confidence

**Solutions**:
1. Verify analysis engine loaded
2. Check for JavaScript errors
3. Ensure candle data is valid
4. Review indicator calculations

---

## Advanced Testing

### Manual Verification Steps

#### 1. Compare with TradingView
1. Open TradingView.com
2. Search for same symbol (e.g., BTCUSDT)
3. Compare current price
4. Verify prices match within $0.50

#### 2. Test Market Conditions
- **Trending Market**: Should show high confidence (70-95%)
- **Ranging Market**: Should show lower confidence (35-60%)
- **High Volatility**: Wider stop losses
- **Low Volatility**: Tighter stop losses

#### 3. Validate Calculations
```javascript
// In browser console:
const entry = 86.50;  // Example SOL entry
const sl = 84.20;     // Example stop loss
const tp1 = 90.64;    // Example TP1

// Calculate R:R
const risk = Math.abs(entry - sl);
const reward = Math.abs(tp1 - entry);
const rr = reward / risk;
console.log(`Risk:Reward = 1:${rr.toFixed(1)}`);
// Should show ~1:1.8
```

---

## Integration Testing

### Test with Main Application
1. Open `index.html` (main app)
2. Complete premium paywall (or use admin override)
3. Accept risk disclaimer
4. Select SOL/USD pair
5. Click "RUN AI SCAN"
6. Compare results with test file

**Should Match**:
- Entry price (±$0.10)
- Stop loss level
- Take profit targets
- Confidence score (±5%)
- Market bias

---

## Automated Testing (Future)

### Jest Test Suite (Planned)
```javascript
describe('Analysis Engine', () => {
  test('analyzes SOL/USD correctly', async () => {
    const candles = await DataService.fetchCandles('SOLUSD', '15m');
    const result = AnalysisEngine.analyze('SOLUSD', '15m', 'intraday', candles);
    
    expect(result.data.symbol).toBe('SOLUSD');
    expect(result.data.entryPrice).toBeGreaterThan(80);
    expect(result.data.entryPrice).toBeLessThan(100);
    expect(result.data.confidence).toBeGreaterThanOrEqual(35);
    expect(result.data.confidence).toBeLessThanOrEqual(95);
  });
});
```

---

## Test Results Documentation

### Record Your Results

**Test Date**: _____________  
**Browser**: _____________  
**Test File Version**: _____________

#### Solana Price Test
- [ ] PASS - Price shows ~$86
- [ ] FAIL - Price incorrect: $_______

#### Single Scan Test
- [ ] PASS - Analysis completed
- [ ] FAIL - Error: _____________

#### All Symbols Test
- [ ] PASS - All 7 symbols analyzed
- [ ] FAIL - Failed symbols: _____________

#### Performance Test
- Single scan time: _______ seconds
- All symbols time: _______ seconds
- Price update latency: _______ ms

#### Notes
_________________________________
_________________________________
_________________________________

---

## Support & Debugging

### Browser Console Commands

```javascript
// Check current prices
DataService.getLatestPrice('SOLUSD');

// Test candle fetch
DataService.fetchCandles('SOLUSD', '15m').then(console.log);

// Run manual analysis
const candles = await DataService.fetchCandles('BTCUSD', '15m');
const result = AnalysisEngine.analyze('BTCUSD', '15m', 'intraday', candles);
console.log(result);

// Check WebSocket status
// Look for "Binance WebSocket connected" in console
```

### Log Analysis
- **Green logs**: Successful operations
- **Yellow logs**: Warnings (non-critical)
- **Red logs**: Errors (need attention)

---

## Next Steps After Testing

### If All Tests Pass ✅
1. Document test results
2. Deploy to production
3. Monitor live performance
4. Collect user feedback

### If Tests Fail ❌
1. Document specific failures
2. Check error logs
3. Review code changes
4. Fix issues and retest
5. Update documentation

---

**Test File**: `test_scanning.html`  
**Dependencies**: `dataService.js`, `analysisEngine.js`, `newsService.js`  
**Last Updated**: May 22, 2026  
**Status**: Ready for comprehensive testing
