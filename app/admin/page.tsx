"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { List, Star, StarOff, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
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
  isShortlisted: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [shortlistedResumes, setShortlistedResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await fetch('/api/admin/resumes');
      if (!response.ok) throw new Error('Failed to fetch resumes');
      const data = await response.json();
      
      setResumes(data.resumes.filter((r: Resume) => !r.isShortlisted));
      setShortlistedResumes(data.resumes.filter((r: Resume) => r.isShortlisted));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load resumes',
      });
    }
  };

  const toggleShortlist = async (resumeId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/resumes/${resumeId}/shortlist`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isShortlisted: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to update shortlist status');
      
      await fetchResumes();
      setSelectedResume(null);
      
      toast({
        title: 'Success',
        description: `Resume ${currentStatus ? 'removed from' : 'added to'} shortlist`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update shortlist status',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container flex h-16 items-center px-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
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
        <div className="grid grid-cols-12 gap-6">
          {/* Shortlisted Candidates */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>Shortlisted</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {shortlistedResumes.map((resume) => (
                    <div
                      key={resume._id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => setSelectedResume(resume)}
                    >
                      <div className="flex-1">
                        <p className="font-medium truncate">{resume.fileName}</p>
                        <p className="text-sm text-muted-foreground">
                          Rating: {resume.rating}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <List className="w-5 h-5" />
                  <span>All Candidates</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Hard Skills</TableHead>
                      <TableHead>Soft Skills</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resumes.map((resume) => (
                      <TableRow key={resume._id}>
                        <TableCell>{resume.fileName}</TableCell>
                        <TableCell>{resume.rating}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {resume.hardSkills}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {resume.softSkills}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedResume(resume)}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleShortlist(resume._id, resume.isShortlisted)}
                            >
                              <Star className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Selected Resume Details */}
            {selectedResume && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedResume.fileName}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleShortlist(selectedResume._id, selectedResume.isShortlisted)}
                    >
                      {selectedResume.isShortlisted ? (
                        <StarOff className="w-4 h-4 mr-2" />
                      ) : (
                        <Star className="w-4 h-4 mr-2" />
                      )}
                      {selectedResume.isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Rating</h3>
                      <div className="text-2xl font-bold">{selectedResume.rating}/100</div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Hard Skills</h3>
                      <p className="text-muted-foreground">{selectedResume.hardSkills}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Soft Skills</h3>
                      <p className="text-muted-foreground">{selectedResume.softSkills}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Wow Factor</h3>
                      <p className="text-muted-foreground">{selectedResume.wowFactor}</p>
                    </div>
                    <div className="col-span-2">
                      <h3 className="font-semibold mb-2">Areas for Improvement</h3>
                      <p className="text-muted-foreground">{selectedResume.badHabits}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}