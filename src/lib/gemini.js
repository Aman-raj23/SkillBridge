const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function askGemini(prompt, maxTokens = 1500) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.startsWith('sk-')) {
        return null; // Signals: use demo fallback (no key, placeholder, or old OpenAI key)
    }

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: maxTokens,
                responseMimeType: 'application/json',
            },
        }),
    });

    const data = await res.json();

    if (data.error) {
        console.error('[Gemini] API error:', data.error.message);
        return null; // Fall back to demo data instead of crashing
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }

    console.error('[Gemini] Could not parse response');
    return null; // Fall back to demo data
}
