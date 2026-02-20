import { NextResponse } from 'next/server';
import { askGemini } from '@/lib/gemini';

const DEMO_ROADMAP = (role, duration) => [
  {
    phase: 'Phase 1', title: 'Foundation & Prerequisites', duration: 'Start',
    description: `Build core foundations for the ${role} role. Set up dev environment and learn key concepts.`,
    tasks: [
      { text: 'Identify and list all key skills required for the role', priority: 'high' },
      { text: 'Set up your development environment and tools', priority: 'high' },
      { text: 'Complete 1-2 foundational courses or tutorials', priority: 'high' },
      { text: 'Join relevant communities (Discord, Reddit, LinkedIn groups)', priority: 'medium' },
    ],
  },
  {
    phase: 'Phase 2', title: 'Core Skills Development', duration: 'Early-Mid',
    description: 'Deep dive into the most critical technical skills needed for the role.',
    tasks: [
      { text: 'Master the primary programming language / framework', priority: 'high' },
      { text: 'Build 2-3 small practice projects to apply concepts', priority: 'high' },
      { text: 'Read official documentation and best practices guides', priority: 'medium' },
      { text: 'Practice on coding challenge platforms (LeetCode, HackerRank)', priority: 'medium' },
    ],
  },
  {
    phase: 'Phase 3', title: 'Portfolio Projects', duration: 'Mid',
    description: 'Build portfolio-worthy projects that demonstrate real-world skills.',
    tasks: [
      { text: 'Design and build a full-stack portfolio project', priority: 'high' },
      { text: 'Contribute to open source projects', priority: 'medium' },
      { text: 'Write technical blog posts about what you\'ve learned', priority: 'low' },
      { text: 'Get code reviews from experienced developers', priority: 'medium' },
    ],
  },
  {
    phase: 'Phase 4', title: 'Interview Prep & Job Hunt', duration: 'Final',
    description: 'Prepare for interviews and launch your job search.',
    tasks: [
      { text: 'Practice mock interviews (technical + behavioral)', priority: 'high' },
      { text: 'Polish resume and LinkedIn to highlight relevant skills', priority: 'high' },
      { text: 'Apply to 5-10 target companies per week', priority: 'high' },
      { text: 'Network with professionals in the target role', priority: 'medium' },
      { text: 'Prepare your personal pitch and salary expectations', priority: 'medium' },
    ],
  },
];

export async function POST(request) {
  try {
    const { role, duration } = await request.json();

    if (!role || !duration) {
      return NextResponse.json({ error: 'Role and duration are required' }, { status: 400 });
    }

    const phaseCount = duration === '1 week' ? '3-4' : duration === '1 month' ? '4-5' : duration === '3 months' ? '5-6' : duration === '6 months' ? '6-8' : '8-10';

    const prompt = `You are a career coach. Generate a detailed learning roadmap.

Role: ${role}
Duration: ${duration}

Generate ${phaseCount} phases. Each phase has a title, description, and specific tasks.
Return ONLY valid JSON:
{
  "roadmap": [
    {
      "phase": "Phase 1",
      "title": "<phase title>",
      "duration": "<e.g. Week 1-2>",
      "description": "<what this phase covers>",
      "tasks": [
        {"text": "<specific task>", "priority": "high|medium|low"},
        {"text": "<specific task>", "priority": "high|medium|low"}        
      ]
    }
  ]
}

Make tasks specific and actionable for the ${role} role.`;

    const result = await askGemini(prompt, 2000);

    if (!result) {
      // Fallback to demo data
      return NextResponse.json({ roadmap: DEMO_ROADMAP(role, duration) });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Roadmap] Error:', error.message);
    return NextResponse.json({ error: 'Failed to generate roadmap: ' + error.message }, { status: 500 });
  }
}
