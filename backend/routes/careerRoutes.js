import express from "express";
import multer from "multer";
import nodemailer from "nodemailer";
import Application from "../models/Application.js";
import Page from "../models/page.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("EMAIL_USER or EMAIL_PASS is not set");
    }

    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    transporter.verify((error) => {
      if (error) {
        console.error("❌ Email configuration error:", error);
      } else {
        console.log("✅ Email server ready");
      }
    });
  }
  return transporter;
};

/* ================= CAREER PAGE ================= */

router.get("/", async (req, res) => {
  try {
    const page = await Page.findOne({ pageName: "career" });
    if (!page)
      return res.status(404).json({ message: "Career page not found" });
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= JOB MANAGEMENT ================= */

router.post("/job", async (req, res) => {
  try {
    const { title, category, location, type, description } = req.body;
    const page = await Page.findOne({ pageName: "career" });

    if (!page)
      return res.status(404).json({ message: "Career page document not found" });

    if (!page.sections) page.sections = {};
    if (!page.sections.jobCategories) page.sections.jobCategories = [];

    let categorySection = page.sections.jobCategories.find(
      (cat) => cat.category === category
    );

    if (categorySection) {
      categorySection.jobs.push({ title, location, type, description });
    } else {
      page.sections.jobCategories.push({
        category,
        jobs: [{ title, location, type, description }],
      });
    }

    page.markModified("sections");
    await page.save();

    res.status(201).json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/job/:catIndex/:jobIndex", async (req, res) => {
  try {
    const { catIndex, jobIndex } = req.params;
    const page = await Page.findOne({ pageName: "career" });

    page.sections.jobCategories[catIndex].jobs[jobIndex] = req.body;
    page.markModified("sections");

    await page.save();
    res.json({ message: "Job updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/job/:catIndex/:jobIndex", async (req, res) => {
  try {
    const { catIndex, jobIndex } = req.params;
    const page = await Page.findOne({ pageName: "career" });

    page.sections.jobCategories[catIndex].jobs.splice(jobIndex, 1);
    page.markModified("sections");

    await page.save();
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= APPLY ================= */

router.post("/apply", upload.single("resume"), async (req, res) => {
  try {
    const newApp = new Application({
      ...req.body,
      resumePath: req.file ? req.file.originalname : null,
    });

    await newApp.save();

    let emailTransporter;
    try {
      emailTransporter = getTransporter();
    } catch (err) {
      return res.json({
        message:
          "Application saved but email could not be sent due to configuration issue.",
        applicationId: newApp._id,
      });
    }

    const attachments = req.file
      ? [
          {
            filename: req.file.originalname,
            content: req.file.buffer,
          },
        ]
      : [];

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `🎯 New Job Application: ${req.body.firstName} ${req.body.lastName}`,
      text: `
New Job Application

Name: ${req.body.firstName} ${req.body.middleName || ""} ${
        req.body.lastName
      }
Email: ${req.body.email}
Phone: ${req.body.phone}

Cover Letter:
${req.body.coverLetter || "Not provided"}

Application ID: ${newApp._id}
Submitted: ${new Date().toLocaleString()}
      `,
      attachments,
    };

    await emailTransporter.sendMail(mailOptions);

    res.json({
      message: "Thanks for applying, we'll contact you shortly.",
      applicationId: newApp._id,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to submit application",
      details:
        process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

/* ================= APPLICATION MANAGEMENT ================= */

// Get all applications
router.get("/applications", async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// Delete application
router.delete("/applications/:id", async (req, res) => {
  try {
    const deleted = await Application.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Application not found" });

    res.status(200).json({ message: "Application deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete application" });
  }
});

// Update status
router.put("/applications/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

export default router;