"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminPage() {
	const [candidates, setCandidates] = useState([]);
	const [messages, setMessages] = useState([
		{
			text: "Please provide your prompt to rank the candidates based on their CV.",
			sender: "bot",
		},
	]);
	const [inputMessage, setInputMessage] = useState("");
	const [rankedCandidates, setRankedCandidates] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchCandidates = async () => {
			try {
				const res = await axios.get("http://localhost:5000/api/candidates/all");
				setCandidates(res.data?.candidates || []);
			} catch (error) {
				console.error("❌ Failed to fetch candidates:", error);
				setCandidates([]);
			}
		};
		fetchCandidates();
	}, []);

	const handleSendMessage = async () => {
		if (!inputMessage.trim()) return;

		setMessages((prev) => [...prev, { text: inputMessage, sender: "user" }]);
		setInputMessage("");
		setLoading(true);

		// Prepare candidate data for ranking
		const candidatesData = candidates
			.filter((c) => c.cvUrl && c._id) // Ensure required fields exist
			.map((c) => ({
				_id: c._id,
				name: c.name,
				cvUrl: c.cvUrl,
			}));

		if (candidatesData.length === 0) {
			setMessages((prev) => [
				...prev,
				{ text: "No valid CV data available for ranking.", sender: "bot" },
			]);
			setLoading(false);
			return;
		}

		try {
			const response = await axios.post(
				"http://localhost:5000/api/openai/rank-candidates",
				{
					prompt: inputMessage,
					candidates: candidatesData,
				}
			);

			if (response.data?.rankedCandidates) {
				setRankedCandidates(response.data.rankedCandidates);
				setMessages((prev) => [
					...prev,
					{ text: "Candidates ranked successfully!", sender: "bot" },
				]);
			} else {
				setMessages((prev) => [
					...prev,
					{ text: "No rankings returned from AI.", sender: "bot" },
				]);
			}
		} catch (error) {
			console.error("❌ Error ranking candidates:", error);
			setMessages((prev) => [
				...prev,
				{ text: "An error occurred while ranking candidates.", sender: "bot" },
			]);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col items-center bg-gray-900 p-4 sm:p-6 font-mono">
			{/* Chat Box */}
			<div className="w-full max-w-md bg-white p-4 sm:p-6 rounded-lg shadow-lg border border-gray-300">
				<div className="h-80 overflow-y-auto space-y-4 p-2 border-b border-gray-300">
					{messages.map((message, index) => (
						<div
							key={index}
							className={`p-3 rounded-lg ${
								message.sender === "bot"
									? "bg-blue-500 text-white"
									: "bg-gray-200 text-gray-900"
							}`}
						>
							{message.text}
						</div>
					))}
				</div>
				<div className="flex mt-4">
					<input
						type="text"
						value={inputMessage}
						onChange={(e) => setInputMessage(e.target.value)}
						className="flex-grow p-2 border rounded-l-md focus:outline-none"
						placeholder="Enter prompt to rank candidates..."
						disabled={loading}
					/>
					<button
						onClick={handleSendMessage}
						className={`px-4 py-2 rounded-r-md transition ${
							loading
								? "bg-gray-400 cursor-not-allowed"
								: "bg-blue-500 text-white hover:bg-blue-600"
						}`}
						disabled={loading}
					>
						{loading ? "Processing..." : "Send"}
					</button>
				</div>
			</div>

			{/* Ranked Candidates */}
			<div className="w-full max-w-3xl mt-6">
				<h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-4">
					Ranked Candidates
				</h2>
				<div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
					{rankedCandidates.length === 0 ? (
						<p className="text-gray-900 text-center">No rankings yet.</p>
					) : (
						<ul className="space-y-3">
							{rankedCandidates.map((candidate, index) => (
								<li key={index} className="p-4 border rounded">
									<p className="font-semibold text-gray-900">
										{candidate.name}
									</p>
									<p className="text-gray-900">Rank: {candidate.rank}</p>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>

			{/* Candidate List */}
			<div className="w-full max-w-3xl mt-6">
				<h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-4">
					Candidate List
				</h2>
				<div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
					{candidates.length === 0 ? (
						<p className="text-gray-900 text-center">No candidates yet.</p>
					) : (
						<ul className="space-y-3">
							{candidates.map((candidate) => (
								<li
									key={candidate._id}
									className="p-4 border rounded flex justify-between items-center"
								>
									<div>
										<p className="font-semibold text-gray-900 text-left">
											{candidate.name}
										</p>
										<p className="text-gray-900">{candidate.email}</p>
									</div>
									<a
										href={
											candidate.cvUrl
												? candidate.cvUrl.startsWith("http")
													? candidate.cvUrl
													: `http://localhost:5000${candidate.cvUrl}`
												: "#"
										}
										target="_blank"
										rel="noopener noreferrer"
										className={`px-4 py-2 rounded transition ${
											candidate.cvUrl
												? "bg-blue-500 text-white hover:bg-blue-600"
												: "bg-gray-400 cursor-not-allowed"
										}`}
									>
										{candidate.cvUrl ? "View CV" : "No CV"}
									</a>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	);
}
