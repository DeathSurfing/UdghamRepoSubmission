import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import dbConnect from '@/lib/db';
import Resume from '@/lib/models/Resume';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const UPLOAD_DIR = join(process.cwd(), 'uploads');

export async function POST(request: Request) {
  try {
    const token = cookies().get('auth-token');
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verify(token.value, JWT_SECRET) as { userId: string };
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    try {
      await writeFile(join(UPLOAD_DIR, '.keep'), '');
    } catch (error) {
      // Directory already exists
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = join(UPLOAD_DIR, fileName);

    await writeFile(filePath, buffer);
    await dbConnect();

    // Call Ollama API for resume analysis
    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama2',
        prompt: `Analyze this resume and provide a JSON response with the following fields:
          Rating (0-100),
          Hard Skills (comma-separated list),
          Soft Skills (comma-separated list),
          Wow Factor (notable achievements or unique qualities),
          Bad Habits (areas for improvement)
          
          Resume content: ${buffer.toString()}`
      }),
    });

    const ollamaData = await ollamaResponse.json();
    const analysis = JSON.parse(ollamaData.response);

    const resume = await Resume.create({
      userId: decoded.userId,
      fileName: file.name,
      filePath: fileName,
      rating: analysis.Rating,
      hardSkills: analysis.HardSkills,
      softSkills: analysis.SoftSkills,
      wowFactor: analysis.WowFactor,
      badHabits: analysis.BadHabits,
    });

    return NextResponse.json({ resume });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}