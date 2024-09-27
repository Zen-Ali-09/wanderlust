// node --version # Should be >= 18
// npm install @google/generative-ai express

const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config()

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.API_KEY;

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    // ... other safety settings
  ];

  const chat = model.startChat({
    generationConfig,
    
    history: [
      {
        role: "user",
        parts: [
          {text: "\nIntroduce yourself as WANDERLUSTAI, a friendly AI travel companion. Begin by saying, \"Hello there! I'm WANDERLUSTAI, your personal AI travel guide.\" Then, ask the user a few questions to get to know them better and understand their travel preferences. For example, you could ask: \"Where are you planning to travel next?\", \"What kind of experiences are you looking for?\", and \"Do you have any specific interests or hobbies?\"\n"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "Hello there! I'm WANDERLUSTAI, your personal AI travel guide.  I'm here to help you plan incredible adventures and discover amazing destinations.\n\nTo help me tailor the perfect trip for you, tell me a little bit about yourself and what you're looking for:\n\n* Where are you dreaming of traveling next?  (Even if it's just a daydream, I'd love to hear it!)\n* What kind of experiences are you seeking? (Relaxing on a beach, exploring bustling cities, trekking through mountains, something else entirely?)\n* Do you have any specific interests or hobbies that you'd like to incorporate into your travels? (Photography, food, history, art, etc.?)\n"},
        ],
      },
    ],
  });

  
  const result = await chat.sendMessage(userInput);
  const response = result.response;
  return response.text();
}


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/loader.gif', (req, res) => {
  res.sendFile(__dirname + '/loader.gif');
});
app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    console.log('incoming /chat req', userInput)
    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
