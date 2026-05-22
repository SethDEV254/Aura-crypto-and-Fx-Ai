require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Define Schemas
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isPremium: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

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

const PaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gateway: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, default: 'pending' },
  txId: String,
  description: String,
  createdAt: { type: Date, default: Date.now }
});

const NewsEventSchema = new mongoose.Schema({
  type: { type: String, required: true },
  description: { type: String, required: true },
  impact: { type: String, enum: ['low', 'medium', 'high', 'extreme'], required: true },
  scheduledFor: { type: Date, required: true },
  filtered: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', UserSchema);
const Analysis = mongoose.model('Analysis', AnalysisSchema);
const Payment = mongoose.model('Payment', PaymentSchema);
const NewsEvent = mongoose.model('NewsEvent', NewsEventSchema);

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// User routes
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully', user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    user.lastLogin = new Date();
    await user.save();
    res.json({ message: 'Login successful', user: { id: user._id, username: user.username, email: user.email, isPremium: user.isPremium } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/users/:id/premium', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ isPremium: user.isPremium });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/users/:id/premium', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.isPremium = true;
    await user.save();
    res.json({ message: 'Premium activated', isPremium: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Analysis routes
app.post('/api/analyses', async (req, res) => {
  try {
    const analysis = new Analysis(req.body);
    await analysis.save();
    res.status(201).json({ message: 'Analysis saved', analysis });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/analyses/user/:userId', async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(50);
    res.json({ analyses });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/analyses/:id', async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) return res.status(404).json({ error: 'Analysis not found' });
    res.json({ analysis });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Payment routes
app.post('/api/payments', async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    res.status(201).json({ message: 'Payment recorded', payment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/payments/user/:userId', async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ payments });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// News events routes
app.get('/api/news-events', async (req, res) => {
  try {
    const events = await NewsEvent.find().sort({ scheduledFor: 1 });
    res.json({ events });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
