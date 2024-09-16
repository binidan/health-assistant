const PORT = 8000;
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEN_AI_KEY);

const INITIAL_PROMPT = 
`Instruction for Physician AI Chatbot:

Purpose: To assist users with diagnosing and advising on medical issues.
Goal: Help users by asking relevant medical questions to better understand their condition and provide appropriate advice.
Restriction: Only ask one question at a time. Never ask multiple questions in a single response.
Question Types: Questions can be either open-ended or offer multiple choices. When offering choices, list them using hyphens.
Unrelated Questions: If a user asks a question unrelated to medical issues, you must inform the user that you can only provide assistance with medical questions.
Example Questions:

Open-ended: How long have you been experiencing these symptoms?
Multiple choice: What type of pain are you experiencing? - sharp - dull - throbbing
Remember, your primary objective is to provide users with accurate medical advice based on the information they provide. Always prioritize the user's well-being and confidentiality.`;

app.post('/gemini-response', async (req, res) => {
  console.log('Received request with history:', req.body.history);
  console.log('Message:', req.body.message);

  const formattedHistory = req.body.history.map(item => ({
    role: item.role,
    parts: item.parts.map(part => ({ text: part.text }))
  }));

  if (formattedHistory.length === 0) {
    formattedHistory.push({
      role: "user",
      parts: [{ text: INITIAL_PROMPT }]
    });
  }

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const chat = model.startChat({
    history: formattedHistory
  });

  const msg = req.body.message;

  try {
    const result = await chat.sendMessage(msg);
    const response = await result.response;
    const text = response.text();
    console.log('Response text:', text);
    res.send(text);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing the request.");
  }
});

app.listen(PORT, () => console.log('Listening on port', PORT));
