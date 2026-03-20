import express from "express";
import booking from '../models/Booking.js'
import addLog from "../utils/addLog.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// ✅ Mail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // 16-digit Google app password
  },
});

/**
 * @route   POST /api/bookings
 * @desc    Create a new call booking + send email
 */
router.post("/", async (req, res) => {
  try {
    const { name, phone, topic, date, time } = req.body;

    // Validation
    if (!name || !phone || !date || !time) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Save to DB
    const newBooking = new Booking({
      name,
      topic,
      phone,
      date,
      time,
    });

    const savedBooking = await newBooking.save();

    await addLog(
      `New call booking from ${name} (${phone}) on ${date} at ${time}`,
      "booking"
    );

    // ✅ Send email to you
    const emailContent = `
New Consultation Call Booking Received!

CLIENT DETAILS:

Name: ${name}
Phone: ${phone}

DISCUSSION TOPIC:
${topic}

SCHEDULE:

Date: ${date}
Time: ${time}

Booking ID: ${savedBooking._id}
Submitted: ${new Date().toLocaleString()}

Please contact the client at the scheduled time.
`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `📞 Call Booking: ${name} on ${date}`,
      text: emailContent,
    });

    res.status(201).json(savedBooking);
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings for the dashboard (Sorted by newest first)
 */
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    console.error("Fetch Bookings Error:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// PUT route to update status
router.put("/:id", async (req, res) => {
  const updated = await Booking.findByIdAndUpdate(
    req.params.id,
    { status: "confirmed" },
    { new: true }
  );

  await addLog(`Booking confirmed for ${updated.name}`, "booking");

  res.json(updated);
});

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Delete a specific booking by ID
 */
router.delete("/:id", async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);

    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await addLog(`Booking deleted for ${deletedBooking.name}`, "booking");

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: "Internal Server Error during deletion" });
  }
});

export default router;