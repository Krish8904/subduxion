// seedMasters.js — Complete seed with ALL subcategories
// Usage: node seedMasters.js

import mongoose from "mongoose";
import dotenv from "dotenv";
import Master from "./models/Master.js";

dotenv.config();

const seedData = [
  // ═══════════════════════════════════════════════════════════════════════
  // NATURE OF BUSINESS
  // ═══════════════════════════════════════════════════════════════════════
  { type: "natureOfBusiness", name: "Manufacturing" },
  { type: "natureOfBusiness", name: "Retail" },
  { type: "natureOfBusiness", name: "Wholesale" },
  { type: "natureOfBusiness", name: "E-commerce" },
  { type: "natureOfBusiness", name: "Services" },
  { type: "natureOfBusiness", name: "Technology" },
  { type: "natureOfBusiness", name: "Healthcare" },
  { type: "natureOfBusiness", name: "Education" },
  { type: "natureOfBusiness", name: "Finance" },
  { type: "natureOfBusiness", name: "Real Estate" },

  // ═══════════════════════════════════════════════════════════════════════
  // CHANNELS
  // ═══════════════════════════════════════════════════════════════════════
  { type: "channel", name: "Direct Sales" },
  { type: "channel", name: "Online Store" },
  { type: "channel", name: "Distributors" },
  { type: "channel", name: "Retailers" },
  { type: "channel", name: "Marketplace" },
  { type: "channel", name: "B2B Platform" },
  { type: "channel", name: "Franchise" },
  { type: "channel", name: "Agent Network" },

  // ═══════════════════════════════════════════════════════════════════════
  // CATEGORIES
  // ═══════════════════════════════════════════════════════════════════════
  { type: "category", name: "Electronics" },
  { type: "category", name: "Fashion & Apparel" },
  { type: "category", name: "Food & Beverages" },
  { type: "category", name: "Home & Garden" },
  { type: "category", name: "Beauty & Personal Care" },
  { type: "category", name: "Sports & Outdoors" },
  { type: "category", name: "Automotive" },
  { type: "category", name: "Books & Media" },
  { type: "category", name: "Toys & Games" },
  { type: "category", name: "Industrial Equipment" },

  // ═══════════════════════════════════════════════════════════════════════
  // SUBCATEGORIES — Electronics
  // ═══════════════════════════════════════════════════════════════════════
  { type: "subcategory", name: "Mobile Phones", parent: "Electronics" },
  { type: "subcategory", name: "Laptops & Computers", parent: "Electronics" },
  { type: "subcategory", name: "Tablets", parent: "Electronics" },
  { type: "subcategory", name: "Smart Watches", parent: "Electronics" },
  { type: "subcategory", name: "Headphones & Earbuds", parent: "Electronics" },
  { type: "subcategory", name: "Cameras", parent: "Electronics" },
  { type: "subcategory", name: "Gaming Consoles", parent: "Electronics" },
  { type: "subcategory", name: "Home Appliances", parent: "Electronics" },

  // ═══════════════════════════════════════════════════════════════════════
  // SUBCATEGORIES — Fashion & Apparel
  // ═══════════════════════════════════════════════════════════════════════
  { type: "subcategory", name: "Men's Clothing", parent: "Fashion & Apparel" },
  { type: "subcategory", name: "Women's Clothing", parent: "Fashion & Apparel" },
  { type: "subcategory", name: "Kids' Clothing", parent: "Fashion & Apparel" },
  { type: "subcategory", name: "Footwear", parent: "Fashion & Apparel" },
  { type: "subcategory", name: "Accessories", parent: "Fashion & Apparel" },
  { type: "subcategory", name: "Jewelry", parent: "Fashion & Apparel" },
  { type: "subcategory", name: "Bags & Luggage", parent: "Fashion & Apparel" },
  { type: "subcategory", name: "Ethnic Wear", parent: "Fashion & Apparel" },

  // ═══════════════════════════════════════════════════════════════════════
  // SUBCATEGORIES — Food & Beverages
  // ═══════════════════════════════════════════════════════════════════════
  { type: "subcategory", name: "Organic Foods", parent: "Food & Beverages" },
  { type: "subcategory", name: "Beverages", parent: "Food & Beverages" },
  { type: "subcategory", name: "Snacks", parent: "Food & Beverages" },
  { type: "subcategory", name: "Dairy Products", parent: "Food & Beverages" },
  { type: "subcategory", name: "Frozen Foods", parent: "Food & Beverages" },
  { type: "subcategory", name: "Bakery Items", parent: "Food & Beverages" },
  { type: "subcategory", name: "Health Foods", parent: "Food & Beverages" },
  { type: "subcategory", name: "Gourmet Foods", parent: "Food & Beverages" },

  // ═══════════════════════════════════════════════════════════════════════
  // SUBCATEGORIES — Home & Garden
  // ═══════════════════════════════════════════════════════════════════════
  { type: "subcategory", name: "Furniture", parent: "Home & Garden" },
  { type: "subcategory", name: "Home Decor", parent: "Home & Garden" },
  { type: "subcategory", name: "Kitchen & Dining", parent: "Home & Garden" },
  { type: "subcategory", name: "Bedding & Bath", parent: "Home & Garden" },
  { type: "subcategory", name: "Lighting", parent: "Home & Garden" },
  { type: "subcategory", name: "Garden Tools", parent: "Home & Garden" },
  { type: "subcategory", name: "Plants & Seeds", parent: "Home & Garden" },
  { type: "subcategory", name: "Storage & Organization", parent: "Home & Garden" },

  // ═══════════════════════════════════════════════════════════════════════
  // SUBCATEGORIES — Beauty & Personal Care
  // ═══════════════════════════════════════════════════════════════════════
  { type: "subcategory", name: "Skincare", parent: "Beauty & Personal Care" },
  { type: "subcategory", name: "Makeup", parent: "Beauty & Personal Care" },
  { type: "subcategory", name: "Hair Care", parent: "Beauty & Personal Care" },
  { type: "subcategory", name: "Fragrances", parent: "Beauty & Personal Care" },
  { type: "subcategory", name: "Bath & Body", parent: "Beauty & Personal Care" },
  { type: "subcategory", name: "Nail Care", parent: "Beauty & Personal Care" },
  { type: "subcategory", name: "Men's Grooming", parent: "Beauty & Personal Care" },
  { type: "subcategory", name: "Beauty Tools", parent: "Beauty & Personal Care" },

  // ═══════════════════════════════════════════════════════════════════════
  // SUBCATEGORIES — Sports & Outdoors
  // ═══════════════════════════════════════════════════════════════════════
  { type: "subcategory", name: "Fitness Equipment", parent: "Sports & Outdoors" },
  { type: "subcategory", name: "Camping Gear", parent: "Sports & Outdoors" },
  { type: "subcategory", name: "Cycling", parent: "Sports & Outdoors" },
  { type: "subcategory", name: "Yoga & Pilates", parent: "Sports & Outdoors" },
  { type: "subcategory", name: "Team Sports", parent: "Sports & Outdoors" },
  { type: "subcategory", name: "Water Sports", parent: "Sports & Outdoors" },
  { type: "subcategory", name: "Winter Sports", parent: "Sports & Outdoors" },
  { type: "subcategory", name: "Outdoor Recreation", parent: "Sports & Outdoors" },

  // ═══════════════════════════════════════════════════════════════════════
  // SUBCATEGORIES — Automotive
  // ═══════════════════════════════════════════════════════════════════════
  { type: "subcategory", name: "Car Accessories", parent: "Automotive" },
  { type: "subcategory", name: "Motorcycle Parts", parent: "Automotive" },
  { type: "subcategory", name: "Car Care", parent: "Automotive" },
  { type: "subcategory", name: "Tires & Wheels", parent: "Automotive" },
  { type: "subcategory", name: "Tools & Equipment", parent: "Automotive" },
  { type: "subcategory", name: "Audio & Electronics", parent: "Automotive" },
  { type: "subcategory", name: "Interior Accessories", parent: "Automotive" },
  { type: "subcategory", name: "Performance Parts", parent: "Automotive" },

  // ═══════════════════════════════════════════════════════════════════════
  // SUBCATEGORIES — Books & Media
  // ═══════════════════════════════════════════════════════════════════════
  { type: "subcategory", name: "Fiction Books", parent: "Books & Media" },
  { type: "subcategory", name: "Non-Fiction Books", parent: "Books & Media" },
  { type: "subcategory", name: "Educational Books", parent: "Books & Media" },
  { type: "subcategory", name: "E-Books", parent: "Books & Media" },
  { type: "subcategory", name: "Magazines", parent: "Books & Media" },
  { type: "subcategory", name: "Music CDs", parent: "Books & Media" },
  { type: "subcategory", name: "Movies & TV", parent: "Books & Media" },
  { type: "subcategory", name: "Video Games", parent: "Books & Media" },

  // ═══════════════════════════════════════════════════════════════════════
  // SUBCATEGORIES — Toys & Games
  // ═══════════════════════════════════════════════════════════════════════
  { type: "subcategory", name: "Action Figures", parent: "Toys & Games" },
  { type: "subcategory", name: "Board Games", parent: "Toys & Games" },
  { type: "subcategory", name: "Educational Toys", parent: "Toys & Games" },
  { type: "subcategory", name: "Dolls & Plush", parent: "Toys & Games" },
  { type: "subcategory", name: "Building Blocks", parent: "Toys & Games" },
  { type: "subcategory", name: "Outdoor Toys", parent: "Toys & Games" },
  { type: "subcategory", name: "Puzzles", parent: "Toys & Games" },
  { type: "subcategory", name: "RC Toys", parent: "Toys & Games" },

  // ═══════════════════════════════════════════════════════════════════════
  // SUBCATEGORIES — Industrial Equipment
  // ═══════════════════════════════════════════════════════════════════════
  { type: "subcategory", name: "Manufacturing Machinery", parent: "Industrial Equipment" },
  { type: "subcategory", name: "Construction Equipment", parent: "Industrial Equipment" },
  { type: "subcategory", name: "Material Handling", parent: "Industrial Equipment" },
  { type: "subcategory", name: "Power Tools", parent: "Industrial Equipment" },
  { type: "subcategory", name: "Safety Equipment", parent: "Industrial Equipment" },
  { type: "subcategory", name: "Testing Equipment", parent: "Industrial Equipment" },
  { type: "subcategory", name: "Packaging Equipment", parent: "Industrial Equipment" },
  { type: "subcategory", name: "Electrical Equipment", parent: "Industrial Equipment" },
];

async function seedMasters() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing masters
    await Master.deleteMany({});
    console.log("🗑️  Cleared existing masters");

    // Insert all seed data
    const inserted = await Master.insertMany(seedData);
    console.log(`✅ Inserted ${inserted.length} master records`);

    // Show summary
    const summary = {};
    inserted.forEach((doc) => {
      summary[doc.type] = (summary[doc.type] || 0) + 1;
    });
    console.log("\n📊 Summary:");
    Object.entries(summary).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} items`);
    });

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seedMasters();