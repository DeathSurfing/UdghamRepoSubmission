"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminPage() {
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/candidates/all");
        console.log("API Response:", res.data); // Log to check if cvUrl is present
        if (res.data && Array.isArray(res.data.candidates)) {
          setCandidates(res.data.candidates);
        } else {
          setCandidates([]);
        }
      } catch (error) {
        console.error("Failed to fetch candidates", error);
        setCandidates([]);
      }
    };
    fetchCandidates();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-4 sm:p-6 font-mono bg-black">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">
        Candidate List
      </h2>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-3xl">
        {candidates.length === 0 ? (
          <p className="text-gray-900">No candidates yet.</p>
        ) : (
          <ul className="space-y-3">
            {candidates.map((candidate) => (
              <li
                key={candidate._id}
                className="p-4 border rounded flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {candidate.name}
                  </p>
                  <p className="text-gray-900">{candidate.email}</p>
                </div>
                <a
                  href={`http://localhost:5000${candidate.cvUrl}`} // Ensure cvUrl is correct
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                  View CV
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
