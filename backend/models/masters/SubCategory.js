import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Category", 
    required: true 
  },
  active: { type: Boolean, default: true },
}, { timestamps: true });

subcategorySchema.index({ name: 1, category: 1 }, { unique: true });

export default mongoose.model("Subcategory", subcategorySchema);