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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Upload Your CV</h2>
        {message && <p className="text-green-600">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="file"
            className="w-full p-2 border rounded"
            accept=".pdf"
            onChange={(e) => setCv(e.target.files[0])}
            required
          />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded">
            Upload CV
          </button>
        </form>
      </div>
    </div>
  );
}