'use client';

import { useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

type EvaluationResult = {
  overall_score: number;
  skills_score: number;
  experience_score: number;
  education_score: number;
  presentation_score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
};

export function ResumeUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, DOC, or DOCX file');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // First convert the file to text
      const fileText = await readFileAsText(file);

      // Then send the text to the evaluation endpoint
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: fileText }),
      });

      if (!response.ok) throw new Error('Evaluation failed');

      const result = await response.json();
      setResult(result);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to evaluate resume');
    } finally {
      setIsLoading(false);
    }
  };

  const readFileAsText = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">Upload Your Resume</h2>
            <p className="text-muted-foreground">
              Supported formats: PDF, DOC, DOCX
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button disabled={isLoading} asChild>
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Resume
                  </>
                )}
              </label>
            </Button>
          </div>
        </div>
      </Card>

      {result && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Evaluation Results</h3>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Overall Score</span>
                  <span>{result.overall_score}/10</span>
                </div>
                <Progress value={result.overall_score * 10} />
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Skills</TableCell>
                    <TableCell className="text-right">{result.skills_score}/10</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Experience</TableCell>
                    <TableCell className="text-right">{result.experience_score}/10</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Education</TableCell>
                    <TableCell className="text-right">{result.education_score}/10</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Presentation</TableCell>
                    <TableCell className="text-right">{result.presentation_score}/10</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Strengths</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {result.strengths.map((strength, i) => (
                    <li key={i}>{strength}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Areas for Improvement</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {result.weaknesses.map((weakness, i) => (
                    <li key={i}>{weakness}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Recommendations</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {result.recommendations.map((recommendation, i) => (
                    <li key={i}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}