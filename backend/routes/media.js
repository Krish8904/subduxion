import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/images",
  filename: (req, file, cb) => {
    // If oldFilename is provided, use it (overwrite mode)
    const filename = req.body.filename || Date.now() + path.extname(file.originalname);
    cb(null, filename);
  },
});

const upload = multer({ storage });

// Upload image
router.post("/upload", upload.single("image"), (req, res) => {
  // Return consistent field name
  res.json({ 
    filePath: `/uploads/images/${req.file.filename}`,
    filename: req.file.filename 
  });
});

// Get all images
router.get("/all", (req, res) => {
  const files = fs.readdirSync("uploads/images");
  const images = files.map((f) => `/uploads/images/${f}`);
  res.json(images);
});

// Delete image
router.delete("/delete/:name", (req, res) => {
  const filePath = path.join("uploads/images", req.params.name);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ message: "Deleted successfully" });
  } else {
    res.status(404).json({ message: "File not found" });
  }
});

export default router;