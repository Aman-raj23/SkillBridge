import { NextResponse } from 'next/server';
import { askGemini } from '@/lib/gemini';

export async function POST(request) {
    try {
        const body = await request.json();
        const resumeText = body.resume || body.resumeText || '';
        const targetRole = body.targetRole || 'General';

        if (!resumeText) {
            return NextResponse.json({ error: 'Resume text is required' }, { status: 400 });
        }

        const prompt = `You are a career skills analyst. Analyze this resume against the target role.

Resume:
${resumeText.substring(0, 4000)}

Target Role: ${targetRole}

Return ONLY valid JSON in this exact format:
{
  "score": <0-100 readiness score>,
  "strengths": ["skill1", "skill2", ...],
  "gaps": [{"skill": "name", "level": "Missing|Needs Work|Partial", "current": <0-100 proficiency>}, ...],
  "recommendations": ["recommendation1", "recommendation2", ...]
}`;

        const result = await askGemini(prompt, 1200);

        if (!result) {
            // No valid API key — return demo data
            return NextResponse.json({
                score: 68,
                strengths: ['JavaScript', 'React', 'Node.js', 'REST APIs', 'Git'],
                gaps: [
                    { skill: 'System Design', level: 'Missing', current: 15 },
                    { skill: 'Kubernetes / Docker', level: 'Missing', current: 10 },
                    { skill: 'Distributed Systems', level: 'Needs Work', current: 25 },
                    { skill: 'CI/CD Pipelines', level: 'Needs Work', current: 30 },
                    { skill: 'Cloud Infrastructure (AWS/GCP)', level: 'Partial', current: 40 },
                ],
                recommendations: [
                    'Focus on system design fundamentals — start with "Designing Data-Intensive Applications" by Martin Kleppmann.',
                    'Get hands-on with Docker and Kubernetes through a personal project deployment.',
                    'Build at least one distributed system project (e.g., a task queue or real-time chat) to demonstrate competence.',
                    'Set up a full CI/CD pipeline with GitHub Actions for your portfolio projects.',
                    'Practice mock system design interviews on platforms like Pramp or interviewing.io.',
                ],
                _demo: true,
            });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('[Analyze] Error:', error.message);
        return NextResponse.json({ error: 'Analysis failed: ' + error.message }, { status: 500 });
    }
}
