const mongoose = require('mongoose');

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

module.exports = mongoose.model('Payment', PaymentSchema);
