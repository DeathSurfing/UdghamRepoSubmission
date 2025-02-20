"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, Star, BarChart2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Resume {
  _id: string;
  fileName: string;
  rating: number;
  hardSkills: string;
  softSkills: string;
  wowFactor: string;
  badHabits: string;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await fetch('/api/resume/list');
      if (!response.ok) throw new Error('Failed to fetch resumes');
      const data = await response.json();
      setResumes(data.resumes);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load resumes',
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      .includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Please upload a PDF, DOC, or DOCX file',
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      toast({
        title: 'Success!',
        description: 'Resume uploaded and analyzed successfully',
      });

      fetchResumes();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Upload failed',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container flex h-16 items-center px-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold">Resume Parser Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button
              variant="outline"
              onClick={() => {
                document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
                router.push('/login');
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Upload Resume</CardTitle>
              <CardDescription>
                Upload your resume in PDF, DOC, or DOCX format for AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-accent"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOC, or DOCX (MAX. 10MB)
                    </p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Resume History */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Resume History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resumes.map((resume) => (
                      <TableRow key={resume._id}>
                        <TableCell>{resume.fileName}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={resume.rating} className="w-[60px]" />
                            <span>{resume.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(resume.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedResume(resume)}
                          >
                            View Analysis
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart2 className="w-5 h-5" />
                  <span>Quick Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Total Resumes</p>
                    <p className="text-2xl font-bold">{resumes.length}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Average Rating</p>
                    <p className="text-2xl font-bold">
                      {resumes.length > 0
                        ? Math.round(
                            resumes.reduce((acc, r) => acc + r.rating, 0) / resumes.length
                          )
                        : 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Latest Upload</p>
                    <p className="text-muted-foreground">
                      {resumes[0]
                        ? new Date(resumes[0].createdAt).toLocaleDateString()
                        : 'No uploads yet'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Resume Analysis */}
          {selectedResume && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Resume Analysis: {selectedResume.fileName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedResume(null)}
                  >
                    Close
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Overall Rating</h3>
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl font-bold">{selectedResume.rating}</div>
                      <Progress value={selectedResume.rating} className="flex-1" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Hard Skills</h3>
                    <p className="text-muted-foreground">{selectedResume.hardSkills}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Soft Skills</h3>
                    <p className="text-muted-foreground">{selectedResume.softSkills}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Wow Factor</h3>
                    <p className="text-muted-foreground">{selectedResume.wowFactor}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold mb-2">Areas for Improvement</h3>
                    <p className="text-muted-foreground">{selectedResume.badHabits}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}