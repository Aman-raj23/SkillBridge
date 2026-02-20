import { NextResponse } from 'next/server';
import { askGemini } from '@/lib/gemini';

const DEMO_SUGGESTIONS = [
    { id: 1, text: '<strong>Add quantified metrics</strong> to your experience. "Built 3 features" → "Built 3 features that increased user retention by 23%"' },
    { id: 2, text: '<strong>Missing ATS keywords</strong> for your target role: Add "distributed systems", "microservices", "CI/CD", "Kubernetes" to your skills.' },
    { id: 3, text: '<strong>Strengthen your summary</strong>: Add your target role explicitly and mention years of experience.' },
    { id: 4, text: '<strong>Add a Projects section</strong>: Include side projects that demonstrate initiative, especially on GitHub.' },
    { id: 5, text: '<strong>Reorder sections</strong>: For senior roles, move Skills before Experience. Recruiters scan for keyword matches in the first 6 seconds.' },
];

export async function POST(request) {
    try {
        const { name, title, summary, skills, experience, education, targetRole } = await request.json();

        const prompt = `You are an expert resume reviewer. Review this resume and provide 5 specific improvement suggestions for a ${targetRole || 'senior engineer'} role.

Name: ${name || 'Not provided'}
Title: ${title || 'Not provided'}
Summary: ${summary || 'Not provided'}
Skills: ${skills || 'Not provided'}
Experience: ${experience || 'Not provided'}
Education: ${education || 'Not provided'}

Return ONLY valid JSON:
{"suggestions": [{"id": 1, "text": "<suggestion with <strong> tags for emphasis>"}, {"id": 2, "text": "..."}, {"id": 3, "text": "..."}, {"id": 4, "text": "..."}, {"id": 5, "text": "..."}]}`;

        const result = await askGemini(prompt, 800);

        if (!result) {
            return NextResponse.json({ suggestions: DEMO_SUGGESTIONS });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('[Resume Suggest] Error:', error.message);
        return NextResponse.json({ suggestions: DEMO_SUGGESTIONS });
    }
}
