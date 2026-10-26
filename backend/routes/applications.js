
const express = require("express");
const Application = require("../models/Application");

const router = express.Router();

const internships = [
  {
    id: "web",
    title: "Web Development Intern",
    company: "Tech Solutions",
    duration: "3 months",
    mode: "Remote",
    description:
      "Develop responsive websites using HTML, CSS, JavaScript and React.",
  },
  {
    id: "java",
    title: "Java Developer Intern",
    company: "CodeWorks",
    duration: "3 months",
    mode: "Hybrid",
    description:
      "Build Java applications and learn object-oriented programming.",
  },
  {
    id: "data",
    title: "Data Science Intern",
    company: "Data Insights",
    duration: "4 months",
    mode: "Remote",
    description:
      "Analyze datasets and develop data visualizations.",
  },
  {
    id: "ml",
    title: "Machine Learning Intern",
    company: "AI Labs",
    duration: "4 months",
    mode: "On-site",
    description:
      "Develop and evaluate machine learning models.",
  },
  {
    id: "cloud",
    title: "Cloud Computing Intern",
    company: "Cloud Systems",
    duration: "3 months",
    mode: "Hybrid",
    description:
      "Learn cloud infrastructure and deployment.",
  },
];

// GET: all internships
router.get("/internships", (req, res) => {
  res.json(internships);
});

// GET: one internship
router.get("/internships/:id", (req, res) => {
  const internship = internships.find(
    (item) => item.id === req.params.id
  );

  if (!internship) {
    return res.status(404).json({
      message: "Internship not found",
    });
  }

  res.json(internship);
});

// POST: submit application
router.post("/applications", async (req, res) => {
  try {
    const { studentName, email, rollNumber, internship } = req.body;

    if (
      typeof studentName !== "string" ||
      typeof email !== "string" ||
      typeof rollNumber !== "string" ||
      typeof internship !== "string" ||
      !studentName.trim() ||
      !email.trim() ||
      !rollNumber.trim() ||
      !internship.trim()
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (studentName.trim().length < 2) {
      return res.status(400).json({
        message: "Name must contain at least 2 characters",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        message: "Please enter a valid email",
      });
    }

    const validInternship = internships.some(
      (item) => item.title === internship
    );

    if (!validInternship) {
      return res.status(400).json({
        message: "Select a valid internship",
      });
    }

    const application = await Application.create({
      studentName: studentName.trim(),
      email: email.trim(),
      rollNumber: rollNumber.trim(),
      internship,
    });

    return res.status(201).json({
      message: "Application submitted successfully!",
      applicationId: application._id,
    });
  } catch (error) {
    console.error("Application submission error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Server error while saving application",
    });
  }
});

// GET: all submitted applications
router.get("/applications", async (req, res) => {
  try {
    const applications = await Application.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json(applications);
  } catch (error) {
    console.error("Fetch error:", error);

    res.status(500).json({
      message: "Unable to retrieve applications",
    });
  }
});

module.exports = router;
