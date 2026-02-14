import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Contact from "../models/Contact.js";

dotenv.config();
const router = express.Router();

/* =========================================
   📧 Mail Transporter
========================================= */
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    transporter.verify((error) => {
      if (error) {
        console.error("❌ Email config error:", error);
      } else {
        console.log("✅ Email server ready");
      }
    });
  }
  return transporter;
};

/* =========================================
   📥 GET All Contacts (Admin)
========================================= */
router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    console.error("Fetch Contacts Error:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

/* =========================================
   ❌ DELETE Contact
========================================= */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Delete Contact Error:", error);
    res.status(500).json({ error: "Delete failed" });
  }
});

/* =========================================
   📩 POST Contact Form
========================================= */
router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, company, email, phone, message } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // ✅ 1️⃣ Save to MongoDB
    const newContact = new Contact({
      firstName,
      lastName,
      email,
      phone,
      message,
    });

    await newContact.save();

    // ✅ 2️⃣ Send Email
    const emailContent = `
New Contact Form Submission!

CONTACT DETAILS:
Name: ${firstName} ${lastName}
Company: ${company || "Not provided"}
Email: ${email}
Phone: ${phone || "Not provided"}

MESSAGE:
${message}

Contact ID: ${newContact._id}
Submitted: ${new Date().toLocaleString()}
`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `📩 Contact Form: ${firstName} ${lastName}`,
      text: emailContent,
    };

    const emailTransporter = getTransporter();
    await emailTransporter.sendMail(mailOptions);

    res.status(201).json({
      message: "Thanks for contacting us, we'll get back to you soon!",
      contactId: newContact._id,
    });

  } catch (err) {
    console.error("❌ Contact Form Error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;