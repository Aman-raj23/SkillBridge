import { NextResponse } from 'next/server';
import { askGemini } from '@/lib/gemini';

export async function POST(request) {
    try {
        const body = await request.json();
        const resumeText = body.resume || body.resumeText || '';
        const targetRole = body.targetRole || 'General';

        if (!resumeText || resumeText.trim().length < 20) {
            return NextResponse.json(
                { error: 'Please provide more resume content. Paste your full resume text or upload a PDF/DOCX file.' },
                { status: 400 }
            );
        }

        console.log('[Analyze] Resume length:', resumeText.length, '| Target role:', targetRole);

        const prompt = `You are an expert career skills analyst and resume reviewer. Analyze the following resume thoroughly and critically against the target role.

IMPORTANT INSTRUCTIONS:
- Give an HONEST and ACCURATE score based on how well the resume matches the target role
- Do NOT default to any particular score — evaluate each resume independently
- Consider: relevant skills, experience level, projects, education, certifications, keywords
- A score of 90+ means the candidate is exceptionally well-matched
- A score of 70-89 means strong match with some gaps
- A score of 50-69 means moderate match, significant gaps exist
- A score below 50 means major gaps for the target role
- The strengths should list ACTUAL skills found in the resume
- The gaps should identify SPECIFIC skills the candidate is missing for the target role
- Recommendations should be ACTIONABLE and SPECIFIC to this candidate

Resume:
${resumeText.substring(0, 6000)}

Target Role: ${targetRole}

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "score": <number 0-100, be honest and specific>,
  "summary": "<2-3 sentence overall assessment of the candidate>",
  "strengths": ["strength1", "strength2", "strength3", ...],
  "gaps": [
    {"skill": "skill name", "level": "Missing|Beginner|Needs Improvement|Partial", "current": <0-100 proficiency estimate>},
    ...
  ],
  "recommendations": ["specific actionable recommendation 1", "specific actionable recommendation 2", ...]
}`;

        const result = await askGemini(prompt, 2000);

        // Validate that the result has the expected structure
        if (!result || typeof result.score !== 'number') {
            console.error('[Analyze] Invalid AI response structure:', JSON.stringify(result).substring(0, 300));
            return NextResponse.json(
                { error: 'AI returned an unexpected response format. Please try again.' },
                { status: 500 }
            );
        }

        console.log('[Analyze] Success! Score:', result.score);
        return NextResponse.json(result);

    } catch (error) {
        console.error('[Analyze] Error:', error.message);
        return NextResponse.json(
            { error: 'Analysis failed: ' + error.message },
            { status: 500 }
        );
    }
}
