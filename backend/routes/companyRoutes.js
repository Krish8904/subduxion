// routes/companyRoutes.js
import express from "express";
import Company from "../models/Company.js";

const router = express.Router();

// POST /api/companies  — save a new registration
router.post("/", async (req, res) => {
  try {
    const company = new Company(req.body);
    const saved = await company.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error("Company save error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/companies  — fetch all registrations (handy for admin/testing)
router.get("/", async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json({ success: true, data: companies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;