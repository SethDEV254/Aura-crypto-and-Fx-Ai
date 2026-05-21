# AURA CRYPTO & FX AI - User Manual

## System Overview

AURA is an institutional-grade market analysis terminal that provides real-time cryptocurrency and forex market analysis using advanced technical indicators, Smart Money Concepts (SMC), and institutional liquidity analysis.

**Version:** 2.8.5  
**Developed by:** @ STARICO  
**System Design:** ANTIGRAVITY

---

## Quick Start

### 1. Launch the Application

Open `index.html` in your web browser or visit:
- **Production:** https://aura-market-analysis.vercel.app

### 2. Select Your Trading Pair

Choose from the left panel:
- **Cryptocurrencies:** BTC/USD, ETH/USD, SOL/USD
- **Forex & Commodities:** XAU/USD (Gold), EUR/USD, GBP/USD, USD/JPY

### 3. Configure Your Analysis

- **Trading Mode:** Scalping, Intraday, or Swing
- **Timeframe:** 5M, 15M, 1H, 4H, or 1D

### 4. Run Analysis

Click **"ACTIVATE SCAN"** to generate a comprehensive market analysis including:
- Entry/Exit levels
- Stop Loss placement
- Take Profit targets
- Confidence metrics
- Risk-to-Reward ratio

---

## Core Features

### Real-Time Ticker Tape

The header displays live price movements for all tracked assets with:
- Current price
- Percentage change
- Visual indicators (green/red pulses)

### Multi-Timeframe Matrix

View confluence across 5 timeframes simultaneously:
- **Bullish** (green up arrow)
- **Bearish** (red down arrow)

### Smart Money Concepts (SMC)

Track institutional trading patterns:
- **Order Blocks (OB):** Institutional accumulation/distribution zones
- **Fair Value Gaps (FVG):** Imbalance zones for price discovery
- **Liquidity Sweeps:** Stop-hunt activity detection
- **RSI/MACD/Vol:** Technical indicator status

### Market Structure Analysis

The system identifies:
- Swing highs/lows
- Liquidity pools
- Structural breaks
- Confluence zones

### Risk Management Calculator

Configure your position sizing:
1. Enter account balance
2. Set risk percentage (recommended: 1-2%)
3. View calculated position size and suggested leverage

---

## Premium Features

Unlock additional capabilities with premium subscription:

### Swing Trading Mode
- Extended timeframe analysis
- Macro trend identification
- Institutional zone detection

### Premium Assets
- XAU/USD (Gold)
- GBP/USD (Pound)
- USD/JPY (Yen)

### Advanced Analytics
- Extended historical data
- Enhanced confluence scoring
- Priority inference processing

---

## Admin Console

Access system configuration (requires authentication):

1. Click **"SYSTEM: ANTIGRAVITY"** in the footer
2. Enter admin credentials
3. Access the following tabs:

#### Engine Overrides
- **Forced Bias:** Override algorithmic bias (Bullish/Bearish/Auto)
- **Confidence Multiplier:** Adjust confidence scoring (1.0x default)
- **Forced Volatility:** Override volatility calculations

#### System Status
- Monitor live system health
- Force reconnection to exchange APIs
- View latency metrics

#### Ticker Control
- Override real-time prices
- Apply manual price adjustments

#### Subscriptions
- Manage user premium status
- View active subscriptions
- Process payment records

---

## Data Sources

### Cryptocurrency Data
- **Primary:** Binance WebSocket streams
- **Fallback:** Binance REST API
- **Symbols:** BTC, ETH, SOL

### Forex & Commodities
- **High-fidelity simulation engine**
- Deterministic candle generation
- Real-time price ticking

### News & Sentiment
- Retail sentiment indices
- Economic calendar events
- FOMC impact filtering

---

## Troubleshooting

### Chart Not Loading
- Check browser console for errors
- Verify TradingView widget connectivity
- Try refreshing the page

### Data Stale
- Click **"FORCE RECONNECT"** in admin panel
- Check exchange API status
- Verify WebSocket connectivity

### Scan Not Completing
- Ensure stable internet connection
- Check browser console for timeout errors
- Verify admin system status is "online"

### Premium Features Locked
- Upgrade subscription in the paywall
- Contact support for billing issues
- Verify account premium status in admin

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Maximize Chart | Click expand icon |
| Switch Timeframe | Click timeframe buttons |
| Run Analysis | Click "ACTIVATE SCAN" |
| Toggle Admin | Click system status in footer |

---

## Support & Contact

For technical support or feature requests:
- Check the admin console for system status
- Review browser console for error messages
- Contact @ STARICO for premium support

---

## Disclaimer

**RISK WARNING:** This system provides market analysis and trading signals. Trading cryptocurrencies and forex involves significant risk. Always:
- Use proper risk management
- Never risk more than you can afford to lose
- Verify signals with your own analysis
- Consider your risk tolerance

*This is not financial advice. Trade at your own risk.*

---

## Changelog

### v2.8.5
- Added smooth mobile scrolling
- Improved responsive layout
- Enhanced chart maximization
- Fixed ticker tape overflow

### v2.8.0
- Initial production release
- Real-time WebSocket integration
- Smart Money Concepts tracking
- Risk management calculator
- Admin console with overrides

---

**System Status:** Online  
**Last Updated:** May 2026
