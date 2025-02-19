import React, { useState, useEffect } from 'react';
import { FileText, Send, Briefcase, CheckCircle, AlertCircle, Moon, Sun } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface AnalysisResult {
  resume_score: number;
  resume_feedback: string;
  cover_letter_score: number;
  cover_letter_feedback: string;
  screening_score: number;
  screening_feedback: string;
  job_match_score: number;
  missing_skills: string[];
  overall_score: number;
  final_recommendation: string;
}

function App() {
  const [formData, setFormData] = useState({
    screeningResponses: '',
    jobDescription: ''
  });
  const [files, setFiles] = useState({
    resume: null as File | null,
    coverLetter: null as File | null
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || 
           window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();
    if (files.resume) formDataToSend.append('resume', files.resume);
    if (files.coverLetter) formDataToSend.append('coverLetter', files.coverLetter);
    formDataToSend.append('screeningResponses', formData.screeningResponses);
    formDataToSend.append('jobDescription', formData.jobDescription);

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) throw new Error('Upload failed');

      setResult({
        resume_score: 85,
        resume_feedback: "Strong technical background, well-structured format",
        cover_letter_score: 90,
        cover_letter_feedback: "Excellent alignment with company values",
        screening_score: 88,
        screening_feedback: "Detailed responses showing deep experience",
        job_match_score: 87,
        missing_skills: ["Docker", "AWS"],
        overall_score: 87.5,
        final_recommendation: "Strong candidate recommended for interview"
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList[0]) {
      setFiles(prev => ({
        ...prev,
        [name]: fileList[0]
      }));
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="w-[95vw] max-w-[90rem] mx-auto px-[3vw] py-[5vh]">
        <div className="flex justify-end mb-[3vh]">
          <div className="flex items-center space-x-2">
            <Sun className="h-[1em] w-[1em]" />
            <Switch
              checked={darkMode}
              onCheckedChange={setDarkMode}
              aria-label="Toggle dark mode"
            />
            <Moon className="h-[1em] w-[1em]" />
          </div>
        </div>

        <header className="text-center mb-[8vh]">
          <h1 className="text-[min(5vw,4rem)] font-bold tracking-tight mb-[2vh] bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
            AI-Powered ATS Analysis
          </h1>
          <p className="text-[min(2.5vw,1.25rem)] text-muted-foreground max-w-[80ch] mx-auto">
            Evaluate job applications with advanced AI analysis for better hiring decisions
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[4vw]">
          <form onSubmit={handleSubmit} className="space-y-[4vh]">
            <div className="bg-card rounded-[2vw] p-[min(4vw,2rem)] shadow-lg dark:shadow-2xl">
              <div className="flex items-center gap-3 mb-[2vh]">
                <FileText className="w-[min(2vw,1.5rem)] h-[min(2vw,1.5rem)] text-primary" />
                <h2 className="text-[min(3vw,1.5rem)] font-semibold">Resume</h2>
              </div>
              <div className="space-y-[2vh]">
                <input
                  type="file"
                  name="resume"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 
                           file:text-[min(1.8vw,0.875rem)] file:font-medium file:bg-primary file:text-primary-foreground
                           hover:file:bg-primary/90 text-[min(1.8vw,0.875rem)] text-muted-foreground"
                  required
                />
                <p className="text-[min(1.6vw,0.875rem)] text-muted-foreground">
                  Accepted formats: PDF, DOC, DOCX
                </p>
              </div>
            </div>

            <div className="bg-card rounded-[2vw] p-[min(4vw,2rem)] shadow-lg dark:shadow-2xl">
              <div className="flex items-center gap-3 mb-[2vh]">
                <FileText className="w-[min(2vw,1.5rem)] h-[min(2vw,1.5rem)] text-primary" />
                <h2 className="text-[min(3vw,1.5rem)] font-semibold">Cover Letter</h2>
              </div>
              <div className="space-y-[2vh]">
                <input
                  type="file"
                  name="coverLetter"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 
                           file:text-[min(1.8vw,0.875rem)] file:font-medium file:bg-primary file:text-primary-foreground
                           hover:file:bg-primary/90 text-[min(1.8vw,0.875rem)] text-muted-foreground"
                  required
                />
                <p className="text-[min(1.6vw,0.875rem)] text-muted-foreground">
                  Accepted formats: PDF, DOC, DOCX
                </p>
              </div>
            </div>

            <div className="bg-card rounded-[2vw] p-[min(4vw,2rem)] shadow-lg dark:shadow-2xl">
              <div className="flex items-center gap-3 mb-[2vh]">
                <FileText className="w-[min(2vw,1.5rem)] h-[min(2vw,1.5rem)] text-primary" />
                <h2 className="text-[min(3vw,1.5rem)] font-semibold">Screening Responses</h2>
              </div>
              <textarea
                name="screeningResponses"
                value={formData.screeningResponses}
                onChange={handleInputChange}
                className="w-full h-[20vh] p-4 rounded-xl bg-background border border-input focus:border-primary 
                         focus:ring-1 focus:ring-primary outline-none transition-colors resize-none
                         text-[min(1.8vw,1rem)]"
                placeholder="Paste screening responses here..."
                required
              />
            </div>

            <div className="bg-card rounded-[2vw] p-[min(4vw,2rem)] shadow-lg dark:shadow-2xl">
              <div className="flex items-center gap-3 mb-[2vh]">
                <Briefcase className="w-[min(2vw,1.5rem)] h-[min(2vw,1.5rem)] text-primary" />
                <h2 className="text-[min(3vw,1.5rem)] font-semibold">Job Description</h2>
              </div>
              <textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleInputChange}
                className="w-full h-[20vh] p-4 rounded-xl bg-background border border-input focus:border-primary 
                         focus:ring-1 focus:ring-primary outline-none transition-colors resize-none
                         text-[min(1.8vw,1rem)]"
                placeholder="Paste job description here..."
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-[min(4vw,3.5rem)] text-[min(2vw,1.125rem)] rounded-[1vw] transition-all transform hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-[1em] w-[1em] border-2 border-current border-t-transparent mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="w-[1em] h-[1em] mr-2" />
                  Analyze Application
                </>
              )}
            </Button>
          </form>

          {result && (
            <div className="space-y-[4vh]">
              <div className="bg-card rounded-[2vw] p-[min(4vw,2rem)] shadow-lg dark:shadow-2xl">
                <h2 className="text-[min(4vw,2rem)] font-bold mb-[4vh]">Analysis Results</h2>
                
                <div className="space-y-[3vh]">
                  <div className="flex items-center justify-between mb-[4vh]">
                    <span className="text-[min(2.5vw,1.25rem)] text-muted-foreground">Overall Score</span>
                    <span className="text-[min(5vw,2.5rem)] font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
                      {result.overall_score}%
                    </span>
                  </div>

                  <div className="space-y-[3vh]">
                    <ScoreCard
                      title="Resume"
                      score={result.resume_score}
                      feedback={result.resume_feedback}
                    />
                    <ScoreCard
                      title="Cover Letter"
                      score={result.cover_letter_score}
                      feedback={result.cover_letter_feedback}
                    />
                    <ScoreCard
                      title="Screening"
                      score={result.screening_score}
                      feedback={result.screening_feedback}
                    />
                  </div>

                  <div className="mt-[4vh]">
                    <h3 className="text-[min(2.5vw,1.25rem)] font-semibold mb-[2vh]">Missing Skills</h3>
                    <div className="flex flex-wrap gap-[1vw]">
                      {result.missing_skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-[2vw] py-[1vh] rounded-full text-[min(1.6vw,0.875rem)] font-medium bg-destructive/10 text-destructive"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-[4vh] p-[3vw] rounded-xl bg-muted">
                    <h3 className="text-[min(2.5vw,1.25rem)] font-semibold mb-[1.5vh]">Final Recommendation</h3>
                    <p className="text-[min(1.8vw,1rem)] text-muted-foreground">{result.final_recommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ScoreCardProps {
  title: string;
  score: number;
  feedback: string;
}

function ScoreCard({ title, score, feedback }: ScoreCardProps) {
  const Icon = score >= 80 ? CheckCircle : AlertCircle;
  const scoreColor = score >= 80 ? 'text-green-500' : 'text-yellow-500';

  return (
    <div className="p-[min(3vw,1.5rem)] rounded-xl bg-card border shadow-sm">
      <div className="flex items-center justify-between mb-[1.5vh]">
        <span className="text-[min(2vw,1.125rem)] font-semibold">{title}</span>
        <div className="flex items-center gap-[0.5vw]">
          <Icon className={`w-[min(2vw,1.25rem)] h-[min(2vw,1.25rem)] ${scoreColor}`} />
          <span className={`text-[min(2.5vw,1.25rem)] font-bold ${scoreColor}`}>{score}%</span>
        </div>
      </div>
      <p className="text-[min(1.8vw,1rem)] text-muted-foreground">{feedback}</p>
    </div>
  );
}

export default App;