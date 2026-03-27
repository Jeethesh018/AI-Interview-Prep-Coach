import { Feedback } from '../types';

interface FeedbackCardProps {
  feedback: Feedback;
}

const toBullets = (text: string): string[] =>
  text
    .split(/\n|\.|;/)
    .map((item) => item.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 5);

const FeedbackCard = ({ feedback }: FeedbackCardProps) => {
  const idealBullets = toBullets(feedback.idealAnswer);

  return (
    <div className="premium-card animate-fadeInUp mt-3 border-ember/25 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-zinc-100">Interviewer Feedback</h3>
        <span className="rounded-full bg-ember/20 px-3 py-1 text-sm font-semibold text-ember">{feedback.score}/10</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="mb-2 text-sm font-medium text-emerald-400">Strengths</h4>
          <ul className="space-y-1 text-sm text-zinc-300">
            {feedback.strengths.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-medium text-amber-400">Improvements</h4>
          <ul className="space-y-1 text-sm text-zinc-300">
            {feedback.improvements.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 border-t border-zinc-800 pt-4">
        <h4 className="mb-2 text-sm font-medium text-ember">High-Scoring Answer Highlights</h4>
        <ul className="space-y-1 text-sm text-zinc-200">
          {idealBullets.map((bullet) => (
            <li key={bullet}>• {bullet}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FeedbackCard;
