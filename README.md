# Libeara Lead Atlas

Interactive globe + bubble map of Libeara partners, competing platforms and open BD leads (Asia-Pacific and the Gulf), with a BD-desk AI agent.

## Folder layout
```
package.json
README.md
public/index.html     the page
api/ask.js            calls the AI model
api/_atlas.js         the data and instructions the agent answers from
```

## Get a free AI key (pick one)
- **Gemini (default, recommended):** https://aistudio.google.com/apikey , sign in with Google, click "Create API key". No card needed.
- **Groq:** https://console.groq.com/keys , free tier, uses open models like Llama.

ChatGPT Plus and SuperGrok subscriptions do NOT include API access. OpenAI and xAI keys are pay-as-you-go; they also work here if you add credit.

## Deploy on Vercel
1. Push this folder to a GitHub repo.
2. In Vercel: Add New -> Project -> Import the repo. No build settings needed.
3. Settings -> Environment Variables, add:
   - `LLM_API_KEY` = your key (required)
   - `LLM_PROVIDER` = `gemini` (default), `groq`, `openai` or `xai`
   - `ACCESS_CODE` = any password (recommended, so strangers can't use up your quota)
   - `LLM_MODEL` = optional, to override the default model
4. Redeploy and share the URL (and the access code).

Free tiers have rate limits; if many people ask at once, the agent replies "wait a minute and ask again".

## Update the data
Edit the `N` (bubbles), `L` (links) and `FACTS` in `public/index.html`, and the matching text in `api/_atlas.js`.
