import { Feedback } from '../types';

const fallbackQuestions = [
  'Can you walk me through a recent project relevant to this role?',
  'How do you prioritize tasks when facing competing deadlines?',
  'Describe a difficult bug or challenge you solved and your approach.',
  'How do you collaborate with team members across functions?',
  'What would your first 90 days in this role look like?',
];

const parseJsonFromAi = <T>(raw: string): T | null => {
  try {
    return JSON.parse(raw) as T;
  } catch {
    const match = raw.match(/```json\s*([\s\S]*?)\s*```/i) || raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!match) return null;
    try {
      return JSON.parse(match[1] || match[0]) as T;
    } catch {
      return null;
    }
  }
};

const extractText = (response: unknown): string => {
  if (typeof response === 'string') return response;
  if (response && typeof response === 'object') {
    const maybe = response as { content?: string; text?: string; message?: { content?: string } };
    return maybe.message?.content || maybe.content || maybe.text || '';
  }
  return '';
};

export const useInterviewAI = () => {
  const generateQuestions = async (role: string, experience: string): Promise<string[]> => {
    if (!window.puter?.ai?.chat) {
      return fallbackQuestions;
    }

    const prompt = `Generate exactly 5 interview questions for a ${role} candidate with ${experience} years of experience. Return ONLY JSON array of strings.`;

    try {
      const response = await window.puter.ai.chat(prompt);
      const text = extractText(response);
      const parsed = parseJsonFromAi<string[]>(text);
      if (parsed && parsed.length >= 5) {
        return parsed.slice(0, 5);
      }
      return fallbackQuestions;
    } catch {
      return fallbackQuestions;
    }
  };

  const evaluateAnswer = async (
    role: string,
    experience: string,
    question: string,
    answer: string,
  ): Promise<Feedback> => {
    const fallbackFeedback: Feedback = {
      score: 7,
      strengths: ['Clear response structure', 'Relevant examples shared'],
      improvements: ['Add measurable impact', 'Include more technical depth'],
      idealAnswer: 'Use STAR format, quantify outcomes, and align your decision-making with business goals.',
    };

    if (!window.puter?.ai?.chat) {
      return fallbackFeedback;
    }

    const prompt = `Evaluate this interview answer as a senior interviewer. Role: ${role}. Experience: ${experience} years.
Question: ${question}
Answer: ${answer}
Return ONLY JSON with this schema:
{
  "score": number between 1 and 10,
  "strengths": string[],
  "improvements": string[],
  "idealAnswer": string
}`;

    try {
      const response = await window.puter.ai.chat(prompt);
      const text = extractText(response);
      const parsed = parseJsonFromAi<Feedback>(text);
      if (parsed?.score && parsed.strengths && parsed.improvements && parsed.idealAnswer) {
        return {
          score: Math.min(10, Math.max(1, Math.round(parsed.score))),
          strengths: parsed.strengths.slice(0, 4),
          improvements: parsed.improvements.slice(0, 4),
          idealAnswer: parsed.idealAnswer,
        };
      }
      return fallbackFeedback;
    } catch {
      return fallbackFeedback;
    }
  };

  return {
    generateQuestions,
    evaluateAnswer,
  };
};
