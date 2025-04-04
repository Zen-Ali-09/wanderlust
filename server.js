// node --version # Should be >= 18
// npm install @google/generative-ai express

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const fs = require("node:fs");
const mime = require("mime-types");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-pro-exp-03-25",
  systemInstruction: "Give answers as in same as of web model of gemini.\nUse Previous User Answers to give next results.\n",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 65536,
  responseModalities: [
  ],
  responseMimeType: "text/plain",
};

async function run() {
  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {text: "\nIntroduce yourself as WanderLustAI, a friendly AI travel companion. Begin by saying, \"Hello there! I'm WanderLustAI, your personal AI travel guide.\" Then, ask the user a few questions to get to know them better and understand their travel preferences. For example, you could ask: \"Where are you planning to travel next?\", \"What kind of experiences are you looking for?\", and \"Do you have any specific interests or hobbies?\""},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "Hello there! I'm WanderLustAI, your personal AI travel guide. I'm excited to help you craft the perfect travel experience!\n\nTo get started, could you tell me a little bit about what you're looking for in your next trip?\n\n*   Where are you planning to travel next?\n*   What kind of experiences are you looking for? (e.g., adventure, relaxation, cultural immersion)\n*   Do you have any specific interests or hobbies that you'd like to incorporate into your trip?\n"},
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
  // TODO: Following code needs to be updated for client-side apps.
  const candidates = result.response.candidates;
  for(let candidate_index = 0; candidate_index < candidates.length; candidate_index++) {
    for(let part_index = 0; part_index < candidates[candidate_index].content.parts.length; part_index++) {
      const part = candidates[candidate_index].content.parts[part_index];
      if(part.inlineData) {
        try {
          const filename = `output_${candidate_index}_${part_index}.${mime.extension(part.inlineData.mimeType)}`;
          fs.writeFileSync(filename, Buffer.from(part.inlineData.data, 'base64'));
          console.log(`Output written to: ${filename}`);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
  console.log(result.response.text());
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
