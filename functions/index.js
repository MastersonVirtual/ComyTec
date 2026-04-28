const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const OpenAI = require('openai');

setGlobalOptions({ maxInstances: 10, region: 'us-central1' });

const MAX_MESSAGE_LENGTH = 500;
function applyCors(res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.set('Access-Control-Allow-Origin', allowedOrigin);
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function normalizeReply(response) {
  if (typeof response?.output_text === 'string' && response.output_text.trim()) {
    return response.output_text.trim();
  }

  const output = Array.isArray(response?.output) ? response.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      const text = part?.text;
      if (typeof text === 'string' && text.trim()) {
        return text.trim();
      }
    }
  }

  return '';
}

exports.chat = onRequest({ secrets: ['OPENAI_API_KEY', 'ALLOWED_ORIGIN'] }, async (req, res) => {
  applyCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(500).json({ error: 'Missing OPENAI_API_KEY on server.' });
    }
    const client = new OpenAI({ apiKey: openaiApiKey });

    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

    if (!message) {
      return res.status(400).json({ error: 'Field "message" is required.' });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.`,
      });
    }

    const response = await client.responses.create({
      model: 'gpt-5.2',
      input: message,
    });

    const reply = normalizeReply(response);

    if (!reply) {
      return res.status(502).json({ error: 'Empty response from OpenAI.' });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('chat function error:', error);

    const status = Number(error?.status) || 500;
    const detail =
      typeof error?.message === 'string' && error.message.trim()
        ? error.message
        : 'Unexpected server error.';

    return res.status(status).json({ error: 'chat_failed', detail });
  }
});
