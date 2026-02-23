import express from "express";
import NatureOfBusiness from "../models/masters/NatureOfBusiness.js";
import Channel from "../models/masters/Channel.js";
import Category from "../models/masters/Category.js";
import SubCategory from "../models/masters/SubCategory.js";

const router = express.Router();

// Helper to build generic CRUD for a model
const buildCRUD = (Model) => ({
  getAll: async (req, res) => {
    try {
      const items = await Model.find({ active: true }).sort({ name: 1 });
      res.json({ success: true, data: items });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
  create: async (req, res) => {
    try {
      const item = new Model(req.body);
      const saved = await item.save();
      res.status(201).json({ success: true, data: saved });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },
  update: async (req, res) => {
    try {
      const updated = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: "Not found" });
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },
  remove: async (req, res) => {
    try {
      const deleted = await Model.findByIdAndUpdate(
        req.params.id, { active: false }, { new: true }
      );
      if (!deleted) return res.status(404).json({ success: false, message: "Not found" });
      res.json({ success: true, data: deleted });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
});

// ── Nature of Business ──
const nobCRUD = buildCRUD(NatureOfBusiness);
router.get("/nature-of-business", nobCRUD.getAll);
router.post("/nature-of-business", nobCRUD.create);
router.put("/nature-of-business/:id", nobCRUD.update);
router.delete("/nature-of-business/:id", nobCRUD.remove);

// ── Channel ──
const channelCRUD = buildCRUD(Channel);
router.get("/channel", channelCRUD.getAll);
router.post("/channel", channelCRUD.create);
router.put("/channel/:id", channelCRUD.update);
router.delete("/channel/:id", channelCRUD.remove);

// ── Category ──
const categoryCRUD = buildCRUD(Category);
router.get("/category", categoryCRUD.getAll);
router.post("/category", categoryCRUD.create);
router.put("/category/:id", categoryCRUD.update);
router.delete("/category/:id", categoryCRUD.remove);

// ── Subcategory (special: has category reference) ──
router.get("/subcategory", async (req, res) => {
  try {
    const query = { active: true };
    if (req.query.category) query.category = req.query.category;
    const items = await SubCategory.find(query).populate("category", "name").sort({ name: 1 });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.post("/subcategory", async (req, res) => {
  try {
    const item = new SubCategory(req.body); // req.body: { name, category: categoryId }
    const saved = await item.save();
    const populated = await saved.populate("category", "name");
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
router.put("/subcategory/:id", async (req, res) => {
  try {
    const updated = await SubCategory.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("category", "name");
    if (!updated) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
router.delete("/subcategory/:id", async (req, res) => {
  try {
    const deleted = await SubCategory.findByIdAndUpdate(
      req.params.id, { active: false }, { new: true }
    );
    if (!deleted) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: deleted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Combined endpoint for CompanyForm ──
router.get("/all", async (req, res) => {
  try {
    const [nob, channels, categories, subcategories] = await Promise.all([
      NatureOfBusiness.find({ active: true }).sort({ name: 1 }),
      Channel.find({ active: true }).sort({ name: 1 }),
      Category.find({ active: true }).sort({ name: 1 }),
      SubCategory.find({ active: true }).populate("category", "name").sort({ name: 1 }),
    ]);
    res.json({
      success: true,
      data: {
        natureOfBusiness: nob,
        channel: channels,
        category: categories,
        subcategory: subcategories,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;