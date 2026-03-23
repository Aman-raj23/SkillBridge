// ── Gemini API helper ──────────────────────────────────────────────
// Uses ONE model at a time. Only falls back to the next model if the
// current model literally doesn't exist — NOT on quota/rate errors.
// On rate-limit (429), waits and retries the SAME model (max 2 retries).

const GEMINI_MODELS = [
    'gemini-2.0-flash',        // primary — fast and cheap
    'gemini-2.0-flash-lite',   // fallback — only if primary not found
];

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function askGemini(prompt, maxTokens = 2000) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        throw new Error('GEMINI_API_KEY is not configured. Get one free at https://aistudio.google.com/apikey');
    }
    if (apiKey.startsWith('sk-')) {
        throw new Error('GEMINI_API_KEY contains an OpenAI key. Please use a Google Gemini key from https://aistudio.google.com/apikey');
    }

    // Try models in order (only move to next if model doesn't exist)
    for (let m = 0; m < GEMINI_MODELS.length; m++) {
        const model = GEMINI_MODELS[m];

        // Retry the SAME model up to 2 times on rate-limit errors
        for (let attempt = 0; attempt < 3; attempt++) {
            console.log(`[Gemini] ${model} attempt ${attempt + 1}...`);

            try {
                const res = await fetch(`${API_BASE}/${model}:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: maxTokens,
                            responseMimeType: 'application/json',
                        },
                    }),
                });

                const data = await res.json();

                if (data.error) {
                    const errMsg = data.error.message || JSON.stringify(data.error);
                    console.error(`[Gemini] ${model} error:`, errMsg);

                    // Model doesn't exist → try next model
                    if (errMsg.includes('not found') || res.status === 404) {
                        break; // break retry loop, continue model loop
                    }

                    // Rate limit / quota exceeded → fail immediately with clear message
                    if (errMsg.includes('quota') || errMsg.includes('429') || res.status === 429) {
                        const waitMatch = errMsg.match(/retry in ([\d.]+)s/i);
                        const waitSec = waitMatch ? Math.ceil(parseFloat(waitMatch[1])) : 60;
                        throw new Error(
                            `⏳ API rate limit reached. Please wait ${waitSec} seconds and try again. ` +
                            `The free Gemini API allows ~15 requests/minute and ~1,500/day.`
                        );
                    }

                    // Other error (auth, bad request) → fail immediately
                    throw new Error(`Gemini API error: ${errMsg}`);
                }

                // ── Success — extract text from response ──
                // gemini-2.5-flash returns multiple parts (thinking + response)
                const parts = data.candidates?.[0]?.content?.parts || [];
                const allText = parts.filter(p => p.text).map(p => p.text).join('\n');

                if (!allText) {
                    throw new Error('Gemini returned an empty response');
                }

                console.log(`[Gemini] ✓ ${model} responded (${allText.length} chars, ${parts.length} parts)`);
                return parseJsonResponse(allText);

            } catch (err) {
                // Re-throw our own errors
                if (err.message.includes('Gemini') || err.message.includes('Rate limit') || err.message.includes('Failed to parse')) {
                    throw err;
                }
                // Network error → retry
                console.error(`[Gemini] ${model} network error:`, err.message);
                if (attempt < 2) {
                    await sleep(3000);
                    continue;
                }
                throw new Error(`Network error calling Gemini: ${err.message}`);
            }
        }
    }

    throw new Error('No Gemini models available. Please check your API key.');
}

// ── JSON parsing (handles markdown wrappers, thinking text, etc.) ──

function parseJsonResponse(text) {
    // Direct parse
    try { return JSON.parse(text); } catch (e) { /* continue */ }

    // From markdown code block
    const codeBlock = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (codeBlock) {
        try { return JSON.parse(codeBlock[1].trim()); } catch (e) { /* continue */ }
    }

    // Balanced-brace extraction
    const jsonStr = extractBalancedJson(text);
    if (jsonStr) {
        try { return JSON.parse(jsonStr); } catch (e) {
            console.error('[Gemini] JSON-like block found but invalid:', jsonStr.substring(0, 300));
        }
    }

    console.error('[Gemini] No JSON in response:', text.substring(0, 500));
    throw new Error('Failed to parse Gemini response as JSON');
}

function extractBalancedJson(text) {
    const start = text.indexOf('{');
    if (start === -1) return null;

    let depth = 0, inStr = false, esc = false;
    for (let i = start; i < text.length; i++) {
        const ch = text[i];
        if (esc) { esc = false; continue; }
        if (ch === '\\' && inStr) { esc = true; continue; }
        if (ch === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (ch === '{') depth++;
        else if (ch === '}' && --depth === 0) return text.substring(start, i + 1);
    }
    return null;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
