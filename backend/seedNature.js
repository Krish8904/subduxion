import mongoose from "mongoose";
import dotenv from "dotenv";
import NatureOfBusiness from "./models/masters/NatureOfBusiness.js";

dotenv.config();

const seedData = [
  { name: "Manufacturing" },
  { name: "Retail" },
  { name: "Wholesale" },
  { name: "E-commerce" },
  { name: "Services" },
  { name: "Technology" },
  { name: "Healthcare" },
  { name: "Education" },
  { name: "Finance" },
  { name: "Real Estate" },
];

async function seedNature() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await NatureOfBusiness.deleteMany({});
    console.log("🗑️  Cleared existing Nature of Business records");

    const inserted = await NatureOfBusiness.insertMany(
      seedData.map((d) => ({ ...d, active: true }))
    );
    console.log(`✅ Inserted ${inserted.length} Nature of Business records`);
    inserted.forEach((doc) => console.log(`   • ${doc.name}`));

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seedNature();