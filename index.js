import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

app.post("/zobot", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,  // <<< KEY FROM ENV
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI Error:", err);
      return res.status(500).json({
        action: "reply",
        messages: [{ type: "text", text: "OpenAI request failed 🚨" }],
      });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    res.json({
      action: "reply",
      messages: [{ type: "text", text: reply }],
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      action: "reply",
      messages: [{ type: "text", text: "Internal server error ❌" }],
    });
  }
});

app.listen(10000, () => console.log("✅ Server running on port 10000"));
