# Debug Guide - Scanning Not Working

## Extensive Logging Added

I've added comprehensive logging throughout the scanning workflow. Follow these steps to identify the exact issue.

---

## Step 1: Open Browser Console

1. Open the site: `index.html` or https://aura-market-analysis.vercel.app
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Keep it open while testing

---

## Step 2: Check Initialization Logs

When the page loads, you should see these logs:

```
[INIT] Verifying DOM elements...
[INIT] runAnalysisBtn: ✅ Found
[INIT] resultsIdleState: ✅ Found
[INIT] resultsLoadingState: ✅ Found
[INIT] resultsOutputState: ✅ Found
```

**If you see ❌ NOT FOUND:**
- The HTML elements are missing
- Hard refresh the page (Ctrl+Shift+R)
- Clear browser cache

---

## Step 3: Click "RUN AI SCAN" Button

When you click the button, you should see:

```
[BUTTON] RUN AI SCAN button clicked!
[BUTTON] Current state: {symbol: "BTCUSD", timeframe: "15m", mode: "intraday", premium: true}
[SCAN] ========================================
[SCAN] triggerAIScanWorkflow() CALLED
[SCAN] ========================================
```

### Scenario A: No Logs Appear
**Problem**: Button click not registered
**Possible Causes**:
1. Button element not found
2. Event listener not attached
3. JavaScript error before button binding

**Solution**:
```javascript
// In console, test button manually:
document.getElementById('run-analysis-btn').click();
```

### Scenario B: Button Log Appears, But No Scan Log
**Problem**: Function not being called
**Possible Causes**:
1. JavaScript error in button handler
2. Function not defined

**Solution**:
```javascript
// In console, call function directly:
triggerAIScanWorkflow();
```

---

## Step 4: Monitor Scan Progress

If scan starts, you'll see detailed logs:

```
[SCAN] Fetching candles...
[SCAN] Fetched 100 candles
[SCAN] First candle: {time: ..., open: ..., high: ..., low: ..., close: ...}
[SCAN] Last candle: {time: ..., open: ..., high: ..., low: ..., close: ...}
[SCAN] Running AnalysisEngine.analyze...
[SCAN] Analysis complete!
[SCAN] Report data: {symbol: "BTCUSD", bias: "BULLISH", ...}
[SCAN] Confidence: 75%
[SCAN] Bias: BULLISH
[SCAN] Entry: 77200
[SCAN] Active setup saved to state
[SCAN] Rendering report to UI...
[SCAN] Report rendered successfully
[SCAN] Running risk calculator...
[SCAN] ✅ Scan workflow complete!
```

### Common Error Points

#### Error 1: Insufficient Candles
```
[SCAN] ❌ ERROR: Error: Insufficient candle data: only 0 candles received
```
**Solution**: Wait 5 seconds and try again. API may be rate-limited.

#### Error 2: DataService Not Defined
```
[SCAN] ❌ ERROR: ReferenceError: DataService is not defined
```
**Solution**: 
- Check if `dataService.js` loaded
- Hard refresh page
- Check Network tab for failed file loads

#### Error 3: AnalysisEngine Not Defined
```
[SCAN] ❌ ERROR: ReferenceError: AnalysisEngine is not defined
```
**Solution**:
- Check if `analysisEngine.js` loaded
- Hard refresh page
- Check Network tab for failed file loads

---

## Step 5: Test Manually in Console

### Test 1: Check if Functions Exist
```javascript
console.log('DataService:', typeof DataService);
console.log('AnalysisEngine:', typeof AnalysisEngine);
console.log('triggerAIScanWorkflow:', typeof triggerAIScanWorkflow);
```

**Expected Output**:
```
DataService: object
AnalysisEngine: object
triggerAIScanWorkflow: function
```

### Test 2: Check Premium Status
```javascript
console.log('Premium Active:', localStorage.getItem('auraPremiumActive'));
```

**If shows 'false' or null**:
```javascript
// Enable premium manually:
localStorage.setItem('auraPremiumActive', 'true');
location.reload();
```

### Test 3: Test Data Service
```javascript
// Check if prices are loading:
setTimeout(() => {
  console.log('BTC:', DataService.getLatestPrice('BTCUSD'));
  console.log('SOL:', DataService.getLatestPrice('SOLUSD'));
}, 3000);
```

### Test 4: Test Candle Fetch
```javascript
// Test fetching candles:
DataService.fetchCandles('BTCUSD', '15m')
  .then(candles => {
    console.log('✅ Candles fetched:', candles.length);
    console.log('First:', candles[0]);
    console.log('Last:', candles[candles.length - 1]);
  })
  .catch(err => {
    console.error('❌ Fetch failed:', err);
  });
```

### Test 5: Test Analysis Engine
```javascript
// Full test:
(async () => {
  try {
    const candles = await DataService.fetchCandles('BTCUSD', '15m');
    console.log('Candles:', candles.length);
    
    const result = AnalysisEngine.analyze('BTCUSD', '15m', 'intraday', candles);
    console.log('✅ Analysis Result:', result.data);
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
})();
```

---

## Step 6: Check Network Tab

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Reload page
4. Look for failed requests (red)

### Critical Files to Check:
- ✅ `app.js` - Should load successfully
- ✅ `dataService.js` - Should load successfully
- ✅ `analysisEngine.js` - Should load successfully
- ✅ `newsService.js` - Should load successfully

### API Calls to Check:
- ✅ Binance WebSocket: `wss://stream.binance.com:9443/ws/...`
- ✅ Binance REST: `https://api.binance.com/api/v3/klines?...`
- ✅ Forex APIs: Various forex API endpoints

---

## Common Issues & Solutions

### Issue 1: Button Does Nothing
**Symptoms**: Click button, nothing happens, no console logs

**Debug Steps**:
1. Check console for JavaScript errors (red text)
2. Verify button exists:
   ```javascript
   console.log(document.getElementById('run-analysis-btn'));
   ```
3. Test button click manually:
   ```javascript
   document.getElementById('run-analysis-btn').click();
   ```

**Solution**: If button not found, HTML file may not have loaded correctly. Hard refresh.

### Issue 2: Scan Starts But Fails Immediately
**Symptoms**: Loading animation appears briefly, then error

**Debug Steps**:
1. Check console for error message
2. Look for `[SCAN] ❌ ERROR:` in logs
3. Read error message carefully

**Common Errors**:
- "Insufficient candle data" → Wait and retry
- "DataService is not defined" → File not loaded
- "Failed to fetch" → Network/API issue

### Issue 3: Scan Hangs on Loading
**Symptoms**: Progress bar moves but never completes

**Debug Steps**:
1. Check console for where it stopped
2. Look for last `[SCAN]` log message
3. Wait 30 seconds to see if it completes

**Solution**: 
- If stuck on "Fetching candles" → API timeout, retry
- If stuck on "Running analysis" → Calculation issue, check console

### Issue 4: Premium Paywall Blocks Everything
**Symptoms**: Can't access any features

**Solution**:
```javascript
// Admin override:
localStorage.setItem('auraPremiumActive', 'true');
location.reload();
```

Or use admin panel:
1. Click "ANTIGRAVITY" logo
2. Login: admin / admin123
3. Toggle premium ON

---

## Step 7: Report Your Findings

After following the steps above, report what you see:

### Template:
```
INITIALIZATION:
- runAnalysisBtn: [✅ Found / ❌ NOT FOUND]
- Other elements: [✅ / ❌]

BUTTON CLICK:
- Button log appears: [YES / NO]
- Scan function called: [YES / NO]

SCAN PROGRESS:
- Candles fetched: [YES / NO / ERROR]
- Number of candles: [___]
- Analysis completed: [YES / NO / ERROR]
- Error message: [___]

CONSOLE ERRORS:
[Copy any red error messages here]

NETWORK ISSUES:
- Failed requests: [List any]
- WebSocket connected: [YES / NO]
```

---

## Quick Fix Commands

### Reset Everything
```javascript
// Clear all storage and reload:
localStorage.clear();
location.reload();
```

### Enable Premium
```javascript
localStorage.setItem('auraPremiumActive', 'true');
location.reload();
```

### Force Scan
```javascript
// Call scan function directly:
triggerAIScanWorkflow();
```

### Check System Status
```javascript
console.log('=== SYSTEM STATUS ===');
console.log('DataService:', typeof DataService);
console.log('AnalysisEngine:', typeof AnalysisEngine);
console.log('Premium:', localStorage.getItem('auraPremiumActive'));
console.log('Button:', document.getElementById('run-analysis-btn') ? 'Found' : 'NOT FOUND');
```

---

## Next Steps

1. **Follow Steps 1-6** above
2. **Copy console output** (especially errors)
3. **Report findings** using the template
4. I'll provide specific fix based on what you find

The extensive logging will show us exactly where the process is failing!

---

**Latest Commit**: 96b49d5  
**Status**: Debugging logs active  
**Action**: Open site, press F12, click scan, report console output
