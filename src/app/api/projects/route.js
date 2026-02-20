import { NextResponse } from 'next/server';
import { askGemini } from '@/lib/gemini';

const DEMO_PROJECTS = (role) => ({
    beginner: [
        { name: `${role} Portfolio Website`, description: `Build a personal portfolio website showcasing your ${role} skills. Include responsive design, projects section, and contact form.`, stack: ['HTML', 'CSS', 'JavaScript'], impact: 55, closesGap: 'Web fundamentals & personal branding' },
        { name: 'REST API CRUD App', description: 'Build a complete CRUD application with a REST API backend. Include user authentication and data validation.', stack: ['Node.js', 'Express', 'PostgreSQL'], impact: 60, closesGap: 'Backend development basics' },
        { name: 'CLI Task Manager', description: 'Build a command-line task management tool with file-based storage. Support adding, editing, completing, and filtering tasks.', stack: ['Python', 'Click', 'JSON'], impact: 50, closesGap: 'Scripting & automation' },
    ],
    intermediate: [
        { name: 'Real-time Chat Application', description: 'Build a full messaging app with WebSocket connections, user authentication, chat rooms, and message history.', stack: ['React', 'Socket.io', 'Node.js', 'Redis'], impact: 78, closesGap: 'Real-time communication & state management' },
        { name: 'CI/CD Pipeline Setup', description: 'Create an automated testing and deployment pipeline from scratch. Include unit tests, integration tests, and staging deployments.', stack: ['Docker', 'GitHub Actions', 'Jest'], impact: 80, closesGap: 'DevOps & deployment automation' },
        { name: 'Analytics Dashboard', description: 'Build a data visualization dashboard with interactive charts, filters, and real-time data updates. Include user authentication.', stack: ['React', 'D3.js', 'PostgreSQL', 'Chart.js'], impact: 75, closesGap: 'Data visualization & frontend complexity' },
    ],
    advanced: [
        { name: 'Distributed Task Queue', description: 'Build a fault-tolerant task queue with worker pools, retry logic, dead letter queues, and monitoring dashboard.', stack: ['Go', 'Redis', 'Docker', 'Kubernetes'], impact: 92, closesGap: 'Distributed systems & reliability' },
        { name: 'ML Model Serving Platform', description: 'Deploy and serve ML models via REST API with A/B testing, auto-scaling, and performance monitoring.', stack: ['Python', 'FastAPI', 'Docker', 'TensorFlow'], impact: 90, closesGap: 'MLOps & production systems' },
        { name: 'Search Engine', description: 'Build a search engine with web crawling, inverted indexing, ranking algorithms, and a clean search UI.', stack: ['Python', 'Elasticsearch', 'React'], impact: 95, closesGap: 'Information retrieval & system design' },
    ],
});

export async function POST(request) {
    try {
        const { role } = await request.json();

        if (!role) {
            return NextResponse.json({ error: 'Role is required' }, { status: 400 });
        }

        const prompt = `You are a technical career coach. Generate project recommendations for someone targeting the "${role}" role.

Generate exactly 9 projects: 3 beginner, 3 intermediate, 3 advanced. Each project should be directly relevant to the ${role} role.

Return ONLY valid JSON:
{
  "projects": {
    "beginner": [
      {"name": "<project name>", "description": "<2-3 sentence description>", "stack": ["tech1", "tech2"], "impact": <50-70>, "closesGap": "<what skill gap this closes>"}
    ],
    "intermediate": [
      {"name": "<project name>", "description": "<2-3 sentence description>", "stack": ["tech1", "tech2"], "impact": <70-90>, "closesGap": "<what skill gap this closes>"}
    ],
    "advanced": [
      {"name": "<project name>", "description": "<2-3 sentence description>", "stack": ["tech1", "tech2"], "impact": <85-99>, "closesGap": "<what skill gap this closes>"}
    ]
  }
}`;

        const result = await askGemini(prompt, 2000);

        if (!result) {
            // Fallback to demo data
            return NextResponse.json({ projects: DEMO_PROJECTS(role) });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('[Projects] Error:', error.message);
        return NextResponse.json({ projects: DEMO_PROJECTS(role || 'Developer') });
    }
}
