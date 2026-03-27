import { FormEvent } from 'react';
import { InterviewEntry } from '../types';
import FeedbackCard from './FeedbackCard';

interface ChatBoxProps {
  entries: InterviewEntry[];
  answer: string;
  loading: boolean;
  onAnswerChange: (value: string) => void;
  onSubmit: () => Promise<void>;
}

const ChatBox = ({ entries, answer, loading, onAnswerChange, onSubmit }: ChatBoxProps) => {
  const latest = entries[entries.length - 1];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit();
  };

  return (
    <div className="space-y-4">
      {entries.map((entry, idx) => (
        <div key={`${entry.question}-${idx}`} className="space-y-3">
          {entry.answer && (
            <div className="ml-auto max-w-[90%] animate-fadeInUp rounded-2xl rounded-br-sm bg-zinc-800 px-4 py-3 text-sm text-zinc-100 sm:max-w-[80%]">
              {entry.answer}
            </div>
          )}
          {entry.feedback && <FeedbackCard feedback={entry.feedback} />}
        </div>
      ))}

      <form onSubmit={handleSubmit} className="premium-card animate-fadeInUp p-3 sm:p-4">
        <textarea
          value={answer}
          onChange={(event) => onAnswerChange(event.target.value)}
          disabled={loading}
          rows={4}
          placeholder="Type your answer here..."
          className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950/80 p-3 text-sm text-zinc-100 outline-none transition focus:border-ember"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-zinc-400">Keep your answer clear and concise. Mention impact where possible.</p>
          <button
            type="submit"
            disabled={loading || !answer.trim() || !!latest?.feedback}
            className="rounded-xl bg-ember px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Thinking...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
