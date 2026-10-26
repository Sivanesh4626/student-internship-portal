
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    rollNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 30,
    },
    internship: {
      type: String,
      required: true,
      enum: [
        "Web Development Intern",
        "Java Developer Intern",
        "Data Science Intern",
        "Machine Learning Intern",
        "Cloud Computing Intern",
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
