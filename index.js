require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY;

app.get('/', (req, res) => res.send('Zobot-OpenAI running ✅'));

app.post('/zobot', async (req, res) => {
  try {
    const userMessage = req.body.message || req.body.text || 'Hello';

    if (!OPENAI_KEY) {
      console.error('[ERR] OPENAI_API_KEY missing');
      return res.status(500).json({
        action: 'reply',
        messages: [{ type: 'text', text: 'Server misconfigured: missing API key.' }]
      });
    }

    const payload = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant for Shree Swayam. Keep replies short and friendly.' },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 300,
      temperature: 0.2
    };

    const r = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 20000
    });

    const botReply = r.data?.choices?.[0]?.message?.content?.trim() || 'Sorry, I could not generate a response.';
    return res.json({ action: 'reply', messages: [{ type: 'text', text: botReply }] });

  } catch (err) {
    console.error('--- ERROR in /zobot START ---');
    if (err.response) {
      console.error('OpenAI response status:', err.response.status);
      console.error('OpenAI response data:', JSON.stringify(err.response.data));
    } else {
      console.error('Error message:', err.message || err);
    }
    console.error('--- ERROR in /zobot END ---');

    return res.status(500).json({
      action: 'reply',
      messages: [{ type: 'text', text: "Sorry, something went wrong. We'll connect you to a human." }]
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
