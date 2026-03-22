const GEMINI_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
];

function getGeminiUrl(model) {
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

export async function askGemini(prompt, maxTokens = 2000) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        throw new Error('GEMINI_API_KEY is not configured. Get one free at https://aistudio.google.com/apikey');
    }

    if (apiKey.startsWith('sk-')) {
        throw new Error('GEMINI_API_KEY contains an OpenAI key. Please use a Google Gemini key from https://aistudio.google.com/apikey');
    }

    let lastError = null;

    // Try each model in order — fall back if quota exceeded
    for (const model of GEMINI_MODELS) {
        console.log(`[Gemini] Trying model: ${model}...`);

        try {
            const genConfig = {
                temperature: 0.7,
                maxOutputTokens: maxTokens,
            };
            // Only flash models support responseMimeType for JSON mode
            if (model.includes('flash')) {
                genConfig.responseMimeType = 'application/json';
            }

            const res = await fetch(`${getGeminiUrl(model)}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: genConfig,
                }),
            });

            const data = await res.json();

            if (data.error) {
                const errMsg = data.error.message || JSON.stringify(data.error);
                console.error(`[Gemini] ${model} error:`, errMsg);

                // If quota exceeded, model not found, or unsupported — try next model
                if (errMsg.includes('quota') || errMsg.includes('429') || errMsg.includes('not found') || errMsg.includes('unsupported') || res.status === 429 || res.status === 404) {
                    lastError = errMsg;
                    continue;
                }
                // For other errors (auth, bad request), don't retry
                throw new Error(`Gemini API error: ${errMsg}`);
            }

            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            if (!text) {
                console.error(`[Gemini] ${model} returned empty response`);
                lastError = 'Empty response';
                continue;
            }

            console.log(`[Gemini] ${model} responded, length:`, text.length);
            return parseJsonResponse(text);

        } catch (fetchErr) {
            if (fetchErr.message.startsWith('Gemini API error:') || fetchErr.message.startsWith('Failed to parse')) {
                throw fetchErr;
            }
            console.error(`[Gemini] ${model} fetch error:`, fetchErr.message);
            lastError = fetchErr.message;
            continue;
        }
    }

    throw new Error(`All Gemini models failed. Last error: ${lastError}`);
}

function parseJsonResponse(text) {
    // Try to parse as JSON directly first
    try {
        return JSON.parse(text);
    } catch (e) {
        // Try to extract JSON from markdown code blocks or other wrappers
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (e2) {
                console.error('[Gemini] Failed to parse extracted JSON:', e2.message);
                console.error('[Gemini] Raw text:', text.substring(0, 500));
                throw new Error('Failed to parse Gemini response as JSON');
            }
        }
        console.error('[Gemini] No JSON found in response:', text.substring(0, 500));
        throw new Error('Gemini response did not contain valid JSON');
    }
}
