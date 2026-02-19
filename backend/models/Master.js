import mongoose from "mongoose";

const masterSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, 
    name: { type: String, required: true },
    parent: { type: String, default: null }, 
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

masterSchema.index({ type: 1 });

export default mongoose.model("Master", masterSchema);