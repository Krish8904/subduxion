// seedChannel.js
// Usage: node seedChannel.js

import mongoose from "mongoose";
import dotenv from "dotenv";
import Channel from "./models/masters/Channel.js"

dotenv.config();

const seedData = [
  { name: "Direct Sales" },
  { name: "Online Store" },
  { name: "Distributors" },
  { name: "Retailers" },
  { name: "Marketplace" },
  { name: "B2B Platform" },
  { name: "Franchise" },
  { name: "Agent Network" },
];

async function seedChannel() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await Channel.deleteMany({});
    console.log("🗑️  Cleared existing Channel records");

    const inserted = await Channel.insertMany(
      seedData.map((d) => ({ ...d, active: true }))
    );
    console.log(`✅ Inserted ${inserted.length} Channel records`);
    inserted.forEach((doc) => console.log(`   • ${doc.name}`));

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seedChannel();