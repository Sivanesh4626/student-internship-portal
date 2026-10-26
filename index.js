
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const routes = require("./routes/api");
const applicationRoutes = require("./backend/routes/applications");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Existing MongoDB connection
mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

// Middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(bodyParser.json());

// Existing routes
app.use("/api", routes);

// Internship Portal routes
app.use("/api", applicationRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Student Internship Portal API is running",
  });
});

// Serve the React production build only when it exists
const buildPath = path.join(__dirname, "client", "dist");

app.use(express.static(buildPath));

app.get("*", (req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    return res.status(404).json({
      message: "API server is running. Use the Vite frontend URL.",
    });
  }

  res.sendFile(path.join(buildPath, "index.html"), (err) => {
    if (err) next(err);
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

// Start only one backend server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
