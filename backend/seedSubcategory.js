import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "./models/masters/Category.js";
import Subcategory from "./models/masters/SubCategory.js"

dotenv.config();

// categoryName → subcategory names
const seedData = {
  "Electronics": [
    "Mobile Phones",
    "Laptops & Computers",
    "Tablets",
    "Smart Watches",
    "Headphones & Earbuds",
    "Cameras",
    "Gaming Consoles",
    "Home Appliances",
  ],
  "Fashion & Apparel": [
    "Men's Clothing",
    "Women's Clothing",
    "Kids' Clothing",
    "Footwear",
    "Accessories",
    "Jewelry",
    "Bags & Luggage",
    "Ethnic Wear",
  ],
  "Food & Beverages": [
    "Organic Foods",
    "Beverages",
    "Snacks",
    "Dairy Products",
    "Frozen Foods",
    "Bakery Items",
    "Health Foods",
    "Gourmet Foods",
  ],
  "Home & Garden": [
    "Furniture",
    "Home Decor",
    "Kitchen & Dining",
    "Bedding & Bath",
    "Lighting",
    "Garden Tools",
    "Plants & Seeds",
    "Storage & Organization",
  ],
  "Beauty & Personal Care": [
    "Skincare",
    "Makeup",
    "Hair Care",
    "Fragrances",
    "Bath & Body",
    "Nail Care",
    "Men's Grooming",
    "Beauty Tools",
  ],
  "Sports & Outdoors": [
    "Fitness Equipment",
    "Camping Gear",
    "Cycling",
    "Yoga & Pilates",
    "Team Sports",
    "Water Sports",
    "Winter Sports",
    "Outdoor Recreation",
  ],
  "Automotive": [
    "Car Accessories",
    "Motorcycle Parts",
    "Car Care",
    "Tires & Wheels",
    "Tools & Equipment",
    "Audio & Electronics",
    "Interior Accessories",
    "Performance Parts",
  ],
  "Books & Media": [
    "Fiction Books",
    "Non-Fiction Books",
    "Educational Books",
    "E-Books",
    "Magazines",
    "Music CDs",
    "Movies & TV",
    "Video Games",
  ],
  "Toys & Games": [
    "Action Figures",
    "Board Games",
    "Educational Toys",
    "Dolls & Plush",
    "Building Blocks",
    "Outdoor Toys",
    "Puzzles",
    "RC Toys",
  ],
  "Industrial Equipment": [
    "Manufacturing Machinery",
    "Construction Equipment",
    "Material Handling",
    "Power Tools",
    "Safety Equipment",
    "Testing Equipment",
    "Packaging Equipment",
    "Electrical Equipment",
  ],
};

async function seedSubcategory() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Fetch all categories to map name → ObjectId
    const categories = await Category.find({ active: true });
    if (categories.length === 0) {
      console.error("❌ No categories found. Run seedCategory.js first!");
      process.exit(1);
    }

    const catMap = {};
    categories.forEach((c) => { catMap[c.name] = c._id; });

    await Subcategory.deleteMany({});
    console.log("🗑️  Cleared existing Subcategory records");

    const docs = [];
    for (const [catName, subs] of Object.entries(seedData)) {
      const catId = catMap[catName];
      if (!catId) {
        console.warn(`⚠️  Category "${catName}" not found in DB — skipping`);
        continue;
      }
      subs.forEach((name) => docs.push({ name, category: catId, active: true }));
    }

    const inserted = await Subcategory.insertMany(docs);
    console.log(`✅ Inserted ${inserted.length} Subcategory records\n`);

    // Summary per category
    for (const [catName, subs] of Object.entries(seedData)) {
      if (catMap[catName]) {
        console.log(`   📁 ${catName}: ${subs.length} subcategories`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seedSubcategory();