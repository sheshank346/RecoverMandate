export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { payment, diagnosedCause, action } = req.body;

  const prompt = `A recurring payment failed. Details:
Amount: ₹${payment.amount}
Error code: ${payment.error_code}
Error reason: ${payment.error_reason}
Bank: ${payment.bank}
Payment method: ${payment.payment_method}

Our system diagnosed the cause as: ${diagnosedCause}
Recommended action: ${action}

In 1-2 short sentences, explain in plain English why this diagnosis and action make sense, as if explaining to a merchant. Be concise and specific.`;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    if (!data.candidates) {
      return res.status(500).json({ error: "No candidates from Gemini", raw: data });
    }

    const explanation = data.candidates[0].content.parts[0].text;
    res.status(200).json({ explanation });

  } catch (error) {
    res.status(500).json({ error: "Failed to generate explanation", details: error.message });
  }
}