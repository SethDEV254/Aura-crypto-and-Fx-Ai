# Force Display Test - Show Scan Results

## Issue
Scan completes but results don't display. Confidence % not showing.

## Quick Fix - Run in Browser Console

### Step 1: Open Console
1. Press F12
2. Go to Console tab

### Step 2: Force Show Results
Paste this code and press Enter:

```javascript
// Force show results panel
const resultsOutput = document.getElementById('results-output-state');
if (resultsOutput) {
  resultsOutput.classList.remove('hidden');
  console.log('✅ Results panel forced visible');
  console.log('Panel display:', window.getComputedStyle(resultsOutput).display);
} else {
  console.error('❌ Results panel not found!');
}
```

### Step 3: Check Confidence Display
```javascript
// Check confidence element
const confEl = document.getElementById('output-confidence-val');
if (confEl) {
  console.log('Confidence element:', confEl);
  console.log('Confidence text:', confEl.innerText);
  console.log('Confidence display:', window.getComputedStyle(confEl).display);
} else {
  console.error('❌ Confidence element not found!');
}
```

### Step 4: Manual Scan with Forced Display
```javascript
// Run scan and force display
(async () => {
  try {
    console.log('Starting manual scan...');
    
    // Fetch candles
    const candles = await DataService.fetchCandles('BTCUSD', '15m');
    console.log(`Fetched ${candles.length} candles`);
    
    // Run analysis
    const result = AnalysisEngine.analyze('BTCUSD', '15m', 'intraday', candles);
    console.log('Analysis result:', result.data);
    console.log('Confidence:', result.data.confidence + '%');
    
    // Force set confidence display
    const confEl = document.getElementById('output-confidence-val');
    if (confEl) {
      confEl.innerText = result.data.confidence + '%';
      console.log('✅ Confidence set to:', confEl.innerText);
    }
    
    // Force show results
    const resultsOutput = document.getElementById('results-output-state');
    const resultsLoading = document.getElementById('results-loading-state');
    const resultsIdle = document.getElementById('results-idle-state');
    
    if (resultsLoading) resultsLoading.classList.add('hidden');
    if (resultsIdle) resultsIdle.classList.add('hidden');
    if (resultsOutput) {
      resultsOutput.classList.remove('hidden');
      console.log('✅ Results panel shown');
    }
    
    console.log('✅ Manual scan complete!');
    
  } catch (err) {
    console.error('❌ Manual scan failed:', err);
  }
})();
```

## Permanent Fix

If the manual test works, the issue is in the render function. Add this to app.js after line 850:

```javascript
// Force display after render
setTimeout(() => {
  const resultsOutput = document.getElementById('results-output-state');
  if (resultsOutput && resultsOutput.classList.contains('hidden')) {
    console.warn('[RENDER] Results still hidden, forcing display...');
    resultsOutput.classList.remove('hidden');
  }
}, 100);
```

## Check Console Logs

After running a scan, look for these logs:

```
[RENDER] Starting render with report: {...}
[RENDER] Confidence value: 75%
[RENDER] Setting confidence display to: 75%
[RENDER] Confidence element text: 75%
[RENDER] Hiding loading state...
[RENDER] Showing output state...
[RENDER] Output state classes: results-active-layout
[RENDER] Output state display: block
[RENDER] ✅ Render complete! Results should be visible.
```

If you see `display: none` instead of `display: block`, there's a CSS issue.

## CSS Override Test

If results still don't show, force CSS:

```javascript
// Force CSS display
const resultsOutput = document.getElementById('results-output-state');
if (resultsOutput) {
  resultsOutput.style.display = 'block';
  resultsOutput.style.visibility = 'visible';
  resultsOutput.style.opacity = '1';
  console.log('✅ CSS forced');
}
```

## Report Back

After running these tests, tell me:

1. **Does force show work?** (Step 2)
2. **Does confidence display?** (Step 3)
3. **Does manual scan work?** (Step 4)
4. **What do console logs show?**

This will tell me exactly what's broken!

---

**Latest Commit**: cd65565  
**Status**: Debugging active  
**Action**: Run tests above and report results
