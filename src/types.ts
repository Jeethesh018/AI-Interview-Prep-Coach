export interface Feedback {
  score: number;
  strengths: string[];
  improvements: string[];
  idealAnswer: string;
}

export interface InterviewEntry {
  question: string;
  answer: string;
  feedback?: Feedback;
}
