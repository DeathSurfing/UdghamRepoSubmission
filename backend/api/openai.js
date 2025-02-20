const axios = require("axios");

const rankCandidates = async (req, res) => {
	const { prompt, candidates } = req.body;

	try {
		const response = await axios.post(
			"https://api.openai.com/v1/chat/completions",
			{
				model: "gpt-3.5-turbo", // Switch to gpt-3.5-turbo for free account
				messages: [
					{
						role: "system",
						content: "You are a helpful assistant that ranks candidates.",
					},
					{ role: "user", content: prompt },
					{ role: "user", content: JSON.stringify(candidates) },
				],
				max_tokens: 1000, // Adjust the tokens according to the prompt length
			},
			{
				headers: {
					Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
					"Content-Type": "application/json",
				},
			}
		);

		const rankedCandidates = response.data.choices[0].message.content;
		res.json({ rankedCandidates });
	} catch (error) {
		console.error("Error ranking candidates:", error);
		res.status(500).json({ error: "Failed to rank candidates" });
	}
};

module.exports = { rankCandidates };
