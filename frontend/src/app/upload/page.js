"use client";
import { useState } from "react";
import axios from "axios";

export default function UploadPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cv, setCv] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cv) return setMessage("Please upload a CV");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("cv", cv);

    try {
      const res = await axios.post("http://localhost:5000/api/candidates/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(res.data.message);
      setName("");
      setEmail("");
      setCv(null);
    } catch (error) {
      setMessage("Upload failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 font-mono p-4 ">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md border border-blue-400 border-2">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-gray-900">
          Upload Your CV
        </h2>
        {message && <p className="text-green-600 text-center mb-4">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="file"
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            accept=".pdf"
            onChange={(e) => setCv(e.target.files[0])}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 sm:p-3 rounded transition duration-200"
          >
            Upload CV
          </button>
        </form>
      </div>
    </div>
  );
}
