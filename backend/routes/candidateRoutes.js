const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Candidate = require("../models/Candidate");

const router = express.Router();

// Ensure the uploads folder exists
const uploadFolder = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadFolder)) {
	fs.mkdirSync(uploadFolder, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadFolder);
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`);
	},
});

const upload = multer({ storage: storage });

// Middleware to log incoming requests
router.use((req, res, next) => {
	console.log(`📩 Incoming Request: ${req.method} ${req.url}`);
	next();
});

// Candidate CV Upload API
router.post("/upload", upload.single("cv"), async (req, res) => {
	try {
		console.log("Received Upload Request:", req.body);
		console.log("Uploaded File:", req.file);

		if (!req.file) {
			console.log("❌ No file received!");
			return res
				.status(400)
				.json({ success: false, message: "No file uploaded" });
		}

		const newCandidate = new Candidate({
			name: req.body.name,
			email: req.body.email,
			cvUrl: `/uploads/${req.file.filename}`,
		});

		await newCandidate.save();
		console.log("✅ Candidate saved successfully!");
		res.json({
			success: true,
			message: "CV uploaded successfully",
			candidate: newCandidate, // Return the candidate object
		});
	} catch (error) {
		console.error("❌ Upload error:", error);
		res.status(500).json({ success: false, message: "Upload failed" });
	}
});

// Fetch All Candidates API
router.get("/all", async (req, res) => {
	try {
		const candidates = await Candidate.find();
		res.json({ success: true, candidates });
	} catch (error) {
		console.error("❌ Error fetching candidates:", error);
		res
			.status(500)
			.json({ success: false, message: "Error fetching candidates" });
	}
});

module.exports = router;
