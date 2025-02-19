const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const candidateRoutes = require("./routes/candidateRoutes");

const app = express();
const PORT = 5000;

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000", // React frontend URL
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/test", (req, res) => {
	console.log("✅ Test route hit!");
	res.send("Server is working");
});

// Connect to MongoDB
mongoose
	.connect("mongodb://127.0.0.1:27017/cv_database", {})
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.error("MongoDB connection error:", err));

// Debugging: Log when routes are registered
console.log("✅ Registering routes...");
app.use("/api/candidates", candidateRoutes);

// Start Server
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
