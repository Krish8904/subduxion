import express from "express";
import mongoose from "mongoose";
import Company from "../models/Company.js";

const router = express.Router();

const toObjectId = (val) => {
  if (!val || val === "") return null;
  if (mongoose.Types.ObjectId.isValid(val)) return new mongoose.Types.ObjectId(val);
  return null;
};

const sanitizeBody = (body) => ({
  ...body,
  category: toObjectId(body.category),
  natureOfBusiness: (body.natureOfBusiness || []).filter(v => mongoose.Types.ObjectId.isValid(v)),
  channel: (body.channel || []).filter(v => mongoose.Types.ObjectId.isValid(v)),
  subcategory: (body.subcategory || []).filter(v => mongoose.Types.ObjectId.isValid(v)),
});

const lookupPipeline = [
  {
    $lookup: {
      from: "natureofbusinesses",
      localField: "natureOfBusiness",
      foreignField: "_id",
      as: "natureOfBusiness",
    },
  },
  {
    $lookup: {
      from: "channels",
      localField: "channel",
      foreignField: "_id",
      as: "channel",
    },
  },
  {
    $lookup: {
      from: "categories",
      localField: "category",
      foreignField: "_id",
      as: "categoryArr",
    },
  },
  {
    $lookup: {
      from: "subcategories",
      localField: "subcategory",
      foreignField: "_id",
      as: "subcategory",
    },
  },
  {
    $addFields: {
      natureOfBusiness: { $map: { input: "$natureOfBusiness", as: "n", in: "$$n.name" } },
      channel:          { $map: { input: "$channel",          as: "c", in: "$$c.name" } },
      category:         { $arrayElemAt: [{ $map: { input: "$categoryArr", as: "c", in: "$$c.name" } }, 0] },
      subcategory:      { $map: { input: "$subcategory",      as: "s", in: "$$s.name" } },
    },
  },
  { $unset: "categoryArr" },
  { $sort: { createdAt: -1 } },
];

router.get("/", async (req, res) => {
  try {
    const companies = await Company.aggregate(lookupPipeline);
    res.json({ success: true, data: companies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const company = new Company(sanitizeBody(req.body));
    const saved = await company.save();
    const [resolved] = await Company.aggregate([
      { $match: { _id: saved._id } },
      ...lookupPipeline,
    ]);
    res.status(201).json({ success: true, data: resolved });
  } catch (err) {
    console.error("Company save error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await Company.findByIdAndUpdate(
      req.params.id,
      sanitizeBody(req.body),
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Not found" });
    const [resolved] = await Company.aggregate([
      { $match: { _id: updated._id } },
      ...lookupPipeline,
    ]);
    res.json({ success: true, data: resolved });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;