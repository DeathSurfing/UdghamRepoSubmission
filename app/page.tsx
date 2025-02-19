import { ResumeUpload } from '@/components/resume-upload';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Resume Evaluator</h1>
          <ThemeToggle />
        </div>
        <ResumeUpload />
      </div>
    </main>
  );
}