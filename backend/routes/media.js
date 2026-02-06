import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// FIXED: We need to handle this differently because req.body 
// is not available in the filename callback
const upload = multer({ 
  dest: 'uploads/images/' // Temporary destination
});

// Upload image - COMPLETELY REWRITTEN
router.post("/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const oldFileName = req.body.oldFileName; // NOW req.body is available
    const tempPath = req.file.path; // Where multer temporarily saved it
    
    let finalFileName;
    
    if (oldFileName) {
      // REUSE the old filename
      finalFileName = oldFileName;
      console.log(`♻️ Reusing filename: ${oldFileName}`);
    } else {
      // CREATE new filename
      finalFileName = Date.now() + path.extname(req.file.originalname);
      console.log(`🆕 Creating new filename: ${finalFileName}`);
    }

    const finalPath = path.join('uploads/images', finalFileName);

    // Move the temp file to the final location with the correct name
    fs.renameSync(tempPath, finalPath);

    console.log(`✅ Image saved as: ${finalFileName}`);
    
    res.json({ 
      filePath: `/uploads/images/${finalFileName}`,
      path: `/uploads/images/${finalFileName}`,
      filename: finalFileName 
    });

  } catch (err) {
    console.error("Upload error:", err);
    // Clean up temp file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

// Get all images
router.get("/all", (req, res) => {
  try {
    const files = fs.readdirSync("uploads/images");
    const images = files.map((f) => `/uploads/images/${f}`);
    res.json(images);
  } catch (err) {
    console.error("Failed to read images directory:", err);
    res.status(500).json({ message: "Failed to fetch images" });
  }
});

// Delete image
router.delete("/delete/:name", (req, res) => {
  try {
    const filePath = path.join("uploads/images", req.params.name);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted image: ${req.params.name}`);
      res.json({ message: "Deleted successfully" });
    } else {
      res.status(404).json({ message: "File not found" });
    }
  } catch (err) {
    console.error("Failed to delete image:", err);
    res.status(500).json({ message: "Failed to delete image" });
  }
});

export default router;