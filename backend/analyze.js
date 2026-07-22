const OpenAI = require('openai');
const { SYSTEM_PROMPT } = require('./prompts');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function stripCodeFence(text) {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenceMatch ? fenceMatch[1] : trimmed;
}

async function analyzeScreenshot(base64Image, mimeType) {
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this website screenshot and generate the React + Tailwind code as instructed.',
          },
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${base64Image}` },
          },
        ],
      },
    ],
    max_tokens: 4096,
    temperature: 0.2,
  });

  const raw = response.choices[0].message.content;
  const cleaned = stripCodeFence(raw);

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error('Failed to parse model response as JSON: ' + err.message);
  }

  if (!parsed.code || !parsed.description) {
    throw new Error('Model response missing required fields');
  }

  return {
    description: parsed.description,
    components: Array.isArray(parsed.components) ? parsed.components : [],
    code: parsed.code,
  };
}

module.exports = { analyzeScreenshot };
