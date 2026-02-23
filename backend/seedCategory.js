// seedCategory.js
// Usage: node seedCategory.js

import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "./models/masters/Category.js";
dotenv.config();

const seedData = [
  { name: "Electronics" },
  { name: "Fashion & Apparel" },
  { name: "Food & Beverages" },
  { name: "Home & Garden" },
  { name: "Beauty & Personal Care" },
  { name: "Sports & Outdoors" },
  { name: "Automotive" },
  { name: "Books & Media" },
  { name: "Toys & Games" },
  { name: "Industrial Equipment" },
];

async function seedCategory() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await Category.deleteMany({});
    console.log("🗑️  Cleared existing Category records");

    const inserted = await Category.insertMany(
      seedData.map((d) => ({ ...d, active: true }))
    );
    console.log(`✅ Inserted ${inserted.length} Category records`);
    inserted.forEach((doc) => console.log(`   • ${doc.name}`));

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seedCategory();