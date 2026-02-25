import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://krishgabani08_db_user:krish_subduxion@cluster1.xjnhxyc.mongodb.net/test?appName=Cluster1";

const NatureOfBusiness = mongoose.model("NatureOfBusiness", new mongoose.Schema({ name: String }));
const Channel = mongoose.model("Channel", new mongoose.Schema({ name: String }));
const Category = mongoose.model("Category", new mongoose.Schema({ name: String }));
const Subcategory = mongoose.model("Subcategory", new mongoose.Schema({ name: String, category: mongoose.Schema.Types.ObjectId }));
const Company = mongoose.model("Company", new mongoose.Schema({
  companyName: String,
  natureOfBusiness: mongoose.Schema.Types.Mixed,
  channel: mongoose.Schema.Types.Mixed,
  category: mongoose.Schema.Types.Mixed,
  subcategory: mongoose.Schema.Types.Mixed,
}));

await mongoose.connect(MONGO_URI);
console.log("✅ Connected to DB:", mongoose.connection.db.databaseName);

const [natures, channels, categories, subcategories] = await Promise.all([
  NatureOfBusiness.find(),
  Channel.find(),
  Category.find(),
  Subcategory.find(),
]);

const nameToId = (list) =>
  Object.fromEntries(list.map((x) => [x.name.toLowerCase().trim(), x._id]));

const nMap = nameToId(natures);
const chMap = nameToId(channels);
const catMap = nameToId(categories);
const subMap = nameToId(subcategories);

const companies = await Company.find().lean();
console.log("🏢 Companies to process:", companies.length);

let updated = 0;
let skipped = 0;

for (const c of companies) {
  const alreadyMigrated =
    (c.natureOfBusiness?.length > 0 &&
      mongoose.Types.ObjectId.isValid(c.natureOfBusiness[0]) &&
      typeof c.natureOfBusiness[0] !== "string") ||
    (c.category &&
      mongoose.Types.ObjectId.isValid(c.category) &&
      typeof c.category !== "string");

  if (alreadyMigrated) {
    skipped++;
    continue;
  }

  const catKey = typeof c.category === "string" ? c.category.toLowerCase().trim() : "";

  const update = {
    natureOfBusiness: (c.natureOfBusiness || [])
      .map((n) => typeof n === "string" ? nMap[n.toLowerCase().trim()] : null)
      .filter(Boolean),
    channel: (c.channel || [])
      .map((n) => typeof n === "string" ? chMap[n.toLowerCase().trim()] : null)
      .filter(Boolean),
    category: catMap[catKey] || null,
    subcategory: (c.subcategory || [])
      .map((n) => typeof n === "string" ? subMap[n.toLowerCase().trim()] : null)
      .filter(Boolean),
  };

  console.log(`\n🔄 Migrating: ${c.companyName}`);
  console.log(`   nature:      ${c.natureOfBusiness} → ${update.natureOfBusiness}`);
  console.log(`   channel:     ${c.channel} → ${update.channel}`);
  console.log(`   category:    ${c.category} → ${update.category}`);
  console.log(`   subcategory: ${c.subcategory} → ${update.subcategory}`);

  await mongoose.connection.db.collection("companies").updateOne(
    { _id: c._id },
    { $set: update }
  );
  updated++;
}

console.log(`\n✅ Migrated: ${updated} | ⏭️ Already done: ${skipped}`);
await mongoose.disconnect();