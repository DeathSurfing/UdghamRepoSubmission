const mongoose = require("mongoose");

const CandidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    cvUrl: { type: String, required: true },  // CV URL path for storing the uploaded file
    createdAt: { type: Date, default: Date.now },
    analysis_result: {
      rating: { type: Number },  // Rating score given to the candidate based on their CV
      exceptional_qualities: [String],  // List of exceptional qualities from the CV
      bad_habits: [String],  // List of bad habits detected in the CV
      normalized_score: { type: Number },  // Normalized score after processing
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Candidate", CandidateSchema);
