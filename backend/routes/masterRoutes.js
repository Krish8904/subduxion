// routes/masterRoutes.js
import express from "express";
import Master from "../models/Master.js";

const router = express.Router();

// GET /api/masters — fetch all active masters grouped by type
router.get("/", async (req, res) => {
  try {
    const masters = await Master.find({ active: true }).sort({ type: 1, name: 1 });
    
    // Group by type for easy frontend consumption
    const grouped = {};
    masters.forEach((master) => {
      if (!grouped[master.type]) {
        grouped[master.type] = [];
      }
      grouped[master.type].push({
        _id: master._id,
        name: master.name,
        parent: master.parent
      });
    });

    res.json({ success: true, data: grouped });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/masters — add a new master entry (for admin use)
router.post("/", async (req, res) => {
  try {
    const master = new Master(req.body);
    const saved = await master.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/masters/:id — update a master entry
router.put("/:id", async (req, res) => {
  try {
    const updated = await Master.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/masters/:id — soft delete (set active: false)
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Master.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );
    res.json({ success: true, data: deleted });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;