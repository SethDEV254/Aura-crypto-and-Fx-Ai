# Troubleshooting Guide - AURA CRYPTO & FX AI

## Quick Diagnosis

### Is the scanning not working? Follow this checklist:

## ✅ Step-by-Step Troubleshooting

### 1. Open Diagnostic Test
```bash
# Open DIAGNOSTIC_TEST.html in your browser
open DIAGNOSTIC_TEST.html
```

This will automatically check:
- File loading status
- Data service initialization
- Price data (including SOL at $86)
- WebSocket connections
- LocalStorage settings

---

## Common Issues & Solutions

### Issue #1: Scan Button Does Nothing ❌

**Symptoms:**
- Click "RUN AI SCAN" button
- Nothing happens
- No loading animation

**Causes:**
1. Premium status not active
2. Risk disclaimer not accepted
3. JavaScript error blocking execution

**Solutions:**

**Solution A: Reset LocalStorage**
```javascript
// Open browser console (F12) and run:
localStorage.setItem('auraPremiumActive', 'true');
localStorage.setItem('auraRiskDisclaimerAccepted', 'true');
location.reload();
```

**Solution B: Use Admin Override**
1. Click the "ANTIGRAVITY" logo in top-left
2. Login with: `admin` / `admin123`
3. Go to "Subscription" tab
4. Toggle "Premium Status Override" to ON
5. Close admin panel
6. Try scanning again

**Solution C: Accept Disclaimer Manually**
1. Refresh the page
2. When disclaimer modal appears, check the box
3. Click "I ACCEPT THE RISKS"
4. Try scanning again

---

### Issue #2: Scan Starts But Fails ❌

**Symptoms:**
- Loading animation appears
- Progress bar moves
- Then shows error message

**Causes:**
1. Insufficient candle data
2. API connection failure
3. Analysis engine error

**Solutions:**

**Check Browser Console:**
1. Press F12 to open developer tools
2. Go to "Console" tab
3. Look for red error messages
4. Common errors and fixes:

```
Error: "Insufficient candle data: only X candles received"
Fix: Wait 5 seconds and try again. API may be rate-limited.

Error: "Failed to fetch"
Fix: Check internet connection. Try different browser.

Error: "AnalysisEngine is not defined"
Fix: Hard refresh (Ctrl+Shift+R). Clear cache.
```

**Test Candle Fetching:**
```javascript
// In browser console:
DataService.fetchCandles('SOLUSD', '15m')
  .then(candles => console.log(`Got ${candles.length} candles`))
  .catch(err => console.error('Fetch failed:', err));
```

---

### Issue #3: Solana Price Shows $170 Instead of $86 ❌

**Symptoms:**
- SOL/USD displays $170.00
- Should show ~$86.00

**Causes:**
1. Browser cache showing old code
2. WebSocket not connected yet
3. Deployment not complete

**Solutions:**

**Solution A: Hard Refresh**
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

**Solution B: Clear Cache**
1. Open browser settings
2. Clear browsing data
3. Select "Cached images and files"
4. Clear data
5. Reload page

**Solution C: Check WebSocket**
```javascript
// In browser console, look for:
"Binance WebSocket connected securely"

// If not connected, check:
DataService.getLatestPrice('SOLUSD');
// Should return ~86
```

**Solution D: Wait for Connection**
- WebSocket takes 2-5 seconds to connect
- Initial price may be $170 (default)
- Should update to ~$86 within 5 seconds

---

### Issue #4: Prices Not Updating in Real-Time ❌

**Symptoms:**
- Prices are static
- No color changes
- No ticking movement

**Causes:**
1. WebSocket connection failed
2. Network firewall blocking WebSocket
3. Browser blocking connections

**Solutions:**

**Check WebSocket Status:**
```javascript
// In browser console:
// Look for these messages:
"Binance WebSocket connected"
"DataService: Initializing secure connections..."

// If you see:
"Binance WebSocket error"
"WebSocket closed"
// Then connection failed
```

**Test Connection:**
1. Open https://www.binance.com in same browser
2. If Binance loads, WebSocket should work
3. If Binance doesn't load, check firewall/VPN

**Alternative: Use Test File**
```bash
# Open test_prices.html
open test_prices.html
# This shows raw price data without UI complexity
```

---

### Issue #5: Analysis Shows Same Results Every Time ❌

**Symptoms:**
- Every scan shows identical entry/SL/TP
- Confidence always same percentage
- Bias never changes

**Causes:**
1. Using cached analysis results
2. Not fetching fresh candle data
3. Analysis engine not recalculating

**Solutions:**

**Force Fresh Analysis:**
```javascript
// In browser console:
// Clear any cached state
state.activeSetup = null;

// Fetch fresh candles
const candles = await DataService.fetchCandles('SOLUSD', '15m');
console.log('Fresh candles:', candles.length);

// Run fresh analysis
const result = AnalysisEngine.analyze('SOLUSD', '15m', 'intraday', candles);
console.log('Fresh result:', result.data.confidence);
```

**Check Candle Timestamps:**
```javascript
// Verify candles are recent
const candles = await DataService.fetchCandles('SOLUSD', '15m');
const lastCandle = candles[candles.length - 1];
const age = Date.now() - lastCandle.time;
console.log(`Last candle age: ${Math.floor(age / 1000)} seconds`);
// Should be < 900 seconds (15 minutes)
```

---

### Issue #6: Premium Paywall Keeps Appearing ❌

**Symptoms:**
- Complete payment
- Paywall appears again on refresh
- Premium status not persisting

**Causes:**
1. LocalStorage not saving
2. Browser in private/incognito mode
3. Cookies disabled

**Solutions:**

**Check Browser Mode:**
- Exit private/incognito mode
- Use normal browser window

**Enable Cookies/Storage:**
1. Browser settings → Privacy
2. Enable cookies and site data
3. Allow localStorage

**Manual Override:**
```javascript
// In browser console:
localStorage.setItem('auraPremiumActive', 'true');
localStorage.setItem('auraPremiumExpiry', Date.now() + (30 * 24 * 60 * 60 * 1000));
location.reload();
```

**Use Admin Panel:**
1. Click "ANTIGRAVITY" logo
2. Login: admin/admin123
3. Toggle premium override ON

---

### Issue #7: Disclaimer Modal Won't Close ❌

**Symptoms:**
- Check disclaimer box
- Click accept button
- Modal doesn't close

**Causes:**
1. JavaScript error
2. Event listener not attached
3. LocalStorage not saving

**Solutions:**

**Force Accept:**
```javascript
// In browser console:
localStorage.setItem('auraRiskDisclaimerAccepted', 'true');
document.getElementById('risk-disclaimer-modal').classList.add('hidden');
```

**Check Console for Errors:**
1. Press F12
2. Look for red errors when clicking accept
3. Report error message

---

## Advanced Troubleshooting

### Check All System Components

**1. Verify Files Loaded:**
```javascript
// In browser console:
console.log('DataService:', typeof DataService);
console.log('AnalysisEngine:', typeof AnalysisEngine);
console.log('NewsService:', typeof NewsService);
// All should show "object"
```

**2. Test Data Service:**
```javascript
// Initialize
DataService.init();

// Wait 3 seconds, then check prices
setTimeout(() => {
  console.log('BTC:', DataService.getLatestPrice('BTCUSD'));
  console.log('SOL:', DataService.getLatestPrice('SOLUSD'));
  console.log('Gold:', DataService.getLatestPrice('XAUUSD'));
}, 3000);
```

**3. Test Analysis Engine:**
```javascript
// Fetch candles
const candles = await DataService.fetchCandles('BTCUSD', '15m');
console.log('Candles:', candles.length);

// Run analysis
const result = AnalysisEngine.analyze('BTCUSD', '15m', 'intraday', candles);
console.log('Analysis:', result.data);
```

**4. Check Network Requests:**
1. Open DevTools (F12)
2. Go to "Network" tab
3. Reload page
4. Look for failed requests (red)
5. Check if Binance API calls succeed

---

## Browser-Specific Issues

### Chrome/Edge
**Issue:** WebSocket blocked by extension
**Fix:** Disable ad blockers, try incognito mode

### Firefox
**Issue:** Enhanced tracking protection blocks WebSocket
**Fix:** Settings → Privacy → Turn off "Strict" mode

### Safari
**Issue:** Cross-origin restrictions
**Fix:** Preferences → Privacy → Uncheck "Prevent cross-site tracking"

---

## Network Issues

### Behind Corporate Firewall
**Symptoms:** WebSocket connections fail
**Fix:** 
- Use mobile hotspot
- Contact IT to whitelist:
  - wss://stream.binance.com
  - api.binance.com
  - api.exchangerate-api.com

### VPN Issues
**Symptoms:** API calls timeout
**Fix:**
- Disable VPN temporarily
- Try different VPN server
- Use VPN that doesn't block financial APIs

---

## Performance Issues

### Slow Scanning (>10 seconds)
**Causes:**
- Slow internet connection
- Too many browser tabs open
- Low device memory

**Solutions:**
- Close other tabs
- Restart browser
- Use faster internet connection

### Browser Freezing
**Causes:**
- Too many calculations
- Memory leak
- Browser extension conflict

**Solutions:**
- Refresh page
- Disable extensions
- Use different browser

---

## Verification Commands

### Complete System Check
```javascript
// Run this in browser console for full diagnostic:

console.log('=== SYSTEM CHECK ===');

// 1. Files
console.log('DataService:', typeof DataService !== 'undefined' ? '✅' : '❌');
console.log('AnalysisEngine:', typeof AnalysisEngine !== 'undefined' ? '✅' : '❌');

// 2. LocalStorage
console.log('Premium:', localStorage.getItem('auraPremiumActive') === 'true' ? '✅' : '❌');
console.log('Disclaimer:', localStorage.getItem('auraRiskDisclaimerAccepted') === 'true' ? '✅' : '❌');

// 3. Prices
setTimeout(() => {
  const sol = DataService.getLatestPrice('SOLUSD');
  console.log('SOL Price:', sol ? `$${sol.toFixed(2)}` : '❌');
  console.log('SOL Correct:', (sol >= 80 && sol <= 100) ? '✅' : '❌');
}, 3000);

// 4. Candles
DataService.fetchCandles('SOLUSD', '15m')
  .then(c => console.log('Candles:', c.length >= 50 ? `✅ (${c.length})` : `❌ (${c.length})`))
  .catch(e => console.log('Candles: ❌', e.message));

console.log('=== END CHECK ===');
```

---

## Still Not Working?

### Create Bug Report

If none of the above solutions work, gather this information:

**1. Browser Info:**
```javascript
console.log('Browser:', navigator.userAgent);
console.log('Online:', navigator.onLine);
```

**2. Error Messages:**
- Screenshot of browser console errors
- Screenshot of network tab failures

**3. Diagnostic Results:**
- Run DIAGNOSTIC_TEST.html
- Screenshot all test results

**4. Steps to Reproduce:**
1. What you clicked
2. What you expected
3. What actually happened

**5. System Info:**
- Operating system
- Browser version
- Internet connection type

---

## Quick Fixes Summary

| Issue | Quick Fix |
|-------|-----------|
| Scan not working | Reset LocalStorage (see Issue #1) |
| SOL shows $170 | Hard refresh (Ctrl+Shift+R) |
| Prices not updating | Check WebSocket in console |
| Same results every time | Clear cache, refresh |
| Paywall keeps appearing | Use admin override |
| Disclaimer won't close | Force accept via console |

---

## Testing Checklist

After applying fixes, verify:

- [ ] Open main site (index.html)
- [ ] Premium status active (or admin override)
- [ ] Disclaimer accepted
- [ ] SOL/USD shows ~$86
- [ ] Prices update in real-time
- [ ] Click "RUN AI SCAN"
- [ ] Loading animation appears
- [ ] Analysis completes successfully
- [ ] Results display correctly
- [ ] Confidence score 35-95%
- [ ] Entry/SL/TP values reasonable

---

## Support Resources

**Test Files:**
- `DIAGNOSTIC_TEST.html` - Automated system check
- `test_scanning.html` - Interactive scanning test
- `test_prices.html` - Price streaming test

**Documentation:**
- `SCANNING_TEST_GUIDE.md` - Complete testing guide
- `SOLANA_PRICE_UPDATE.md` - Deployment details
- `ENHANCED_SYSTEM_IMPROVEMENTS.md` - Technical specs

**Live Site:**
- Production: https://aura-market-analysis.vercel.app
- GitHub: https://github.com/SethDEV254/Aura-crypto-and-Fx-Ai.git

---

**Last Updated:** May 22, 2026  
**Status:** All systems operational  
**Latest Commit:** 9458277
