const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isPremium: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

module.exports = mongoose.model('User', UserSchema);
