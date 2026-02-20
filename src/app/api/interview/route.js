import { NextResponse } from 'next/server';
import { askGemini } from '@/lib/gemini';

export async function POST(request) {
    try {
        const { question, answer, type } = await request.json();

        if (!question || !answer) {
            return NextResponse.json({ score: 0, feedback: 'Please provide both a question and answer.' });
        }

        const prompt = `You are an expert interview coach. Evaluate this interview answer.

Question (${type || 'technical'}): ${question}
Candidate's Answer: ${answer}

Rate on a 0-100 scale and provide detailed feedback.
Return ONLY valid JSON:
{
  "score": <0-100>,
  "feedback": "<2-3 sentences of specific feedback>",
  "improvements": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>"]
}`;

        const result = await askGemini(prompt, 500);

        if (!result) {
            const wordCount = answer.trim().split(/\s+/).length;
            const demoScore = Math.min(85, Math.max(30, wordCount * 3 + 20));
            return NextResponse.json({
                score: demoScore,
                feedback: 'Good attempt! To improve, try adding specific examples and quantifiable results. Structure your answer using the STAR method for behavioral questions.',
                improvements: [
                    'Add specific technical details and real-world examples',
                    'Quantify impact where possible (e.g., "reduced latency by 40%")',
                    'Discuss trade-offs and alternative approaches',
                ],
            });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('[Interview] Error:', error.message);
        return NextResponse.json({ score: 50, feedback: 'AI evaluation failed. Try again later.', improvements: [] });
    }
}
