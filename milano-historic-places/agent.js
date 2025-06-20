const fs = require('fs');
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function editFileWithGPT(filePath, promptInstruction) {
  const code = fs.readFileSync(filePath, 'utf-8');
  const userPrompt = `${promptInstruction}\n\n\`\`\`js\n${code}\n\`\`\``;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'Sei un assistente che migliora codice JavaScript/React.' },
      { role: 'user', content: userPrompt }
    ]
  });

  const response = completion.choices[0].message.content;
  fs.writeFileSync(filePath, response);
  console.log(`✅ File aggiornato con GPT`);
}

editFileWithGPT('./src/app.tsx', 'Ottimizza il componente per leggibilità e performance');