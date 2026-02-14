import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    firstName: String,
    middleName: String,
    lastName: String,
    email: String,
    phone: String,
    coverLetter: String,
    resumePath: String,

    // ✅ NEW FIELD
    status: {
      type: String,
      enum: [
        "Screening",
        "1st Round",
        "2nd Round",
        "Final Round",
        "Rejected",
        "Hired"
      ],
      default: "Screening"
    }
  },
  { timestamps: true }
);

export default mongoose.model(
  "Application",
  applicationSchema,
  "applications"
);