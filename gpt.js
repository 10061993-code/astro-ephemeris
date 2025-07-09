require('dotenv').config();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function askGPT(prompt) {
  const chat = await openai.chat.completions.create({
    model: "gpt-4", // oder "gpt-3.5-turbo"
    messages: [
      {
        role: "system",
        content: "Du bist eine moderne, empathische astrologische Texterin.",
      },
      {
        role: "user",
        content: prompt,
      }
    ],
    temperature: 0.9,
    max_tokens: 1000,
  });

  return chat.choices[0].message.content.trim();
}

module.exports = { askGPT };

