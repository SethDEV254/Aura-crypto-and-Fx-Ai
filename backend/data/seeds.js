const mongoose = require('mongoose');
const dotenv = require('dotenv');
const NewsEvent = require('../models/NewsEvent');

dotenv.config();

const newsEvents = [
  { type: 'FOMC', description: 'Federal Funds Rate decision', impact: 'extreme', scheduledFor: new Date(Date.now() + 86400000 * 2), filtered: true },
  { type: 'CPI', description: 'US Consumer Inflation YoY', impact: 'high', scheduledFor: new Date(Date.now() + 86400000 * 5), filtered: true },
  { type: 'NFP', description: 'Non-Farm Payrolls', impact: 'high', scheduledFor: new Date(Date.now() + 86400000 * 10), filtered: true },
  { type: 'GDP', description: 'GDP Growth Rate', impact: 'high', scheduledFor: new Date(Date.now() + 86400000 * 15), filtered: true },
  { type: 'PCE', description: 'Personal Consumption Expenditures', impact: 'medium', scheduledFor: new Date(Date.now() + 86400000 * 20), filtered: true }
];

async function seedNewsEvents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing events
    await NewsEvent.deleteMany({});
    console.log('Cleared existing news events');

    // Insert new events
    await NewsEvent.insertMany(newsEvents);
    console.log('Seeded news events successfully');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding:', err);
    process.exit(1);
  }
}

seedNewsEvents();
