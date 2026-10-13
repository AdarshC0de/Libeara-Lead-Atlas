const { SYSTEM, IDS } = require('./_atlas');

// Pick the AI provider with the LLM_PROVIDER environment variable.
// gemini and groq have free tiers; openai and xai (Grok) are pay-as-you-go.
// All four speak the same OpenAI-style "chat completions" format.
const PROVIDERS = {
  gemini: { url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', model: 'gemini-2.5-flash' },
  groq:   { url: 'https://api.groq.com/openai/v1/chat/completions', model: 'llama-3.3-70b-versatile' },
  openai: { url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini' },
  xai:    { url: 'https://api.x.ai/v1/chat/completions', model: 'grok-3-mini' }
};

const MAX_TURNS = 12, MAX_CHARS = 1500;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });

  const provider = PROVIDERS[(process.env.LLM_PROVIDER || 'gemini').toLowerCase()];
  if (!provider) return res.status(500).json({ error: 'LLM_PROVIDER must be gemini, groq, openai or xai.' });
  const key = process.env.LLM_API_KEY;
  if (!key) return res.status(500).json({ error: 'The server has no LLM_API_KEY set.' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  if (process.env.ACCESS_CODE && body.code !== process.env.ACCESS_CODE)
    return res.status(401).json({ error: 'Enter the access code to use the agent.' });

  const turns = Array.isArray(body.messages) ? body.messages.slice(-MAX_TURNS) : [];
  const messages = turns
    .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  if (!messages.length || messages[messages.length - 1].role !== 'user')
    return res.status(400).json({ error: 'Send a question.' });
  if (messages[0].role !== 'user') messages.shift();

  try {
    const r = await fetch(provider.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + key },
      body: JSON.stringify({
        model: process.env.LLM_MODEL || provider.model,
        max_tokens: 1000,
        messages: [{ role: 'system', content: SYSTEM }, ...messages]
      })
    });
    const data = await r.json();
    if (!r.ok) {
      const msg = (data && (data.error && (data.error.message || data.error))) || 'The model call failed.';
      return res.status(r.status === 429 ? 429 : 502).json({ error: r.status === 429 ? 'The free AI quota is busy. Wait a minute and ask again.' : String(msg) });
    }
    let text = ((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '').trim();
    let highlight = [];
    const m = text.match(/\n?HIGHLIGHT:\s*(.*)\s*$/i);
    if (m) {
      highlight = m[1].split(',').map(s => s.trim().replace(/[`*]/g, '')).filter(id => IDS.has(id));
      text = text.slice(0, m.index).trim();
    }
    return res.status(200).json({ text, highlight });
  } catch (e) {
    return res.status(500).json({ error: 'The agent could not answer just now. Try again in a moment.' });
  }
};
