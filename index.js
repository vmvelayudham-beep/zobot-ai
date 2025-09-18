require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY;

app.get('/', (req, res) => res.send('Zobot-OpenAI running ✅'));

app.post('/zobot', async (req, res) => {
  try {
    const userMessage = req.body.message || req.body.text || "Hello";

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant for Shree Swayam, a web design & graphics startup. Keep answers short and friendly." },
          { role: "user", content: userMessage }
        ],
        max_tokens: 200,
        temperature: 0.2
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const botReply = response.data.choices[0].message.content.trim();

    res.json({
      action: "reply",
      messages: [{ type: "text", text: botReply }]
    });

  } catch (err) {
    console.error("Error:", err.message);
    res.json({
      action: "reply",
      messages: [{ type: "text", text: "Sorry, something went wrong. We'll connect you to a human." }]
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
