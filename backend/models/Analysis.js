const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  timeframe: { type: String, required: true },
  mode: { type: String, required: true },
  bias: { type: String, required: true },
  entryPrice: { type: Number, required: true },
  stopLoss: { type: Number, required: true },
  tp1: { type: Number, required: true },
  tp2: { type: Number, required: true },
  tp3: { type: Number, required: true },
  confidence: { type: Number, required: true },
  rrRatio: { type: String, required: true },
  successProbability: { type: Number, required: true },
  smc: {
    obRange: String,
    obStatus: String,
    fvgRange: String,
    fvgStatus: String,
    liqLevel: Number,
    liqStatus: String,
    rsi: Number,
    macd: Number,
    volume: Number
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analysis', AnalysisSchema);
