import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseekr1',
        prompt: `Analyze the following resume and provide a detailed evaluation in JSON format. Include scores (0-10) for different aspects and specific feedback.
        Resume text:
        ${text}
        
        Return the response in the following JSON format:
        {
          "overall_score": number,
          "skills_score": number,
          "experience_score": number,
          "education_score": number,
          "presentation_score": number,
          "strengths": string[],
          "weaknesses": string[],
          "recommendations": string[]
        }`,
        stream: false,
      }),
    });

    const data = await response.json();
    return NextResponse.json(JSON.parse(data.response));
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to evaluate resume' },
      { status: 500 }
    );
  }
}