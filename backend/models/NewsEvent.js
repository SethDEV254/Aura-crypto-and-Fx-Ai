const mongoose = require('mongoose');

const NewsEventSchema = new mongoose.Schema({
  type: { type: String, required: true },
  description: { type: String, required: true },
  impact: { type: String, enum: ['low', 'medium', 'high', 'extreme'], required: true },
  scheduledFor: { type: Date, required: true },
  filtered: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NewsEvent', NewsEventSchema);
