import mongoose from "mongoose";

const natureOfBusinessSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("NatureOfBusiness", natureOfBusinessSchema);