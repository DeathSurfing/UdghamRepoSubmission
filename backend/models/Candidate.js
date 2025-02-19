const mongoose = require("mongoose");

const CandidateSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, trim: true, lowercase: true },
		cvUrl: { type: String, required: true }, // Ensure cvUrl is correct here
		createdAt: { type: Date, default: Date.now },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Candidate", CandidateSchema);
