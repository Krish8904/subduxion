// models/Company.js
import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    // ── Auto-generated confidential ID ──────────────────────────────────────
    companyId: {
      type: String,
      unique: true,
      index: true,
    },

    // Company Info
    companyName:   { type: String, required: true },
    companyEmail:  { type: String, required: true },
    website:       { type: String },
    countryCode:   { type: String, default: "+1" },
    companyMobile: { type: String, required: true },

    // Business Details
    natureOfBusiness: { type: [String], default: [] },
    channel:          { type: [String], default: [] },
    category:         { type: [String], default: [] },
    subcategory:      { type: [String], default: [] },

    // Contact Person
    firstName:           { type: String, required: true },
    middleName:          { type: String },
    lastName:            { type: String, required: true },
    personalEmail:       { type: String, required: true },
    personalCountryCode: { type: String, default: "+1" },
    personalMobile:      { type: String, required: true },
    gender:              { type: String },
  },
  { timestamps: true }
);

// Auto-generate companyId before saving 
companySchema.pre("save", async function () {
  if (!this.isNew) return;

  const last = await mongoose
    .model("Company")
    .findOne({}, { companyId: 1 })
    .sort({ createdAt: -1 });

  let nextNumber = 1;

  if (last?.companyId) {
    const lastNumber = parseInt(last.companyId.replace("CMP", ""), 10);
    if (!isNaN(lastNumber)) nextNumber = lastNumber + 1;
  }

  this.companyId = `CMP${String(nextNumber).padStart(4, "0")}`;
});

export default mongoose.model("Company", companySchema);  