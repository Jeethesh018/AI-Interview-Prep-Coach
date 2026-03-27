import { useMemo, useState } from 'react';
import ChatBox from './components/ChatBox';
import QuestionCard from './components/QuestionCard';
import { useInterviewAI } from './hooks/useInterviewAI';
import { InterviewEntry } from './types';

type Page = 'home' | 'interview' | 'done';

const LoadingDots = () => (
  <div className="inline-flex items-center gap-1">
    <span className="h-2 w-2 animate-bounce rounded-full bg-ember [animation-delay:-0.3s]" />
    <span className="h-2 w-2 animate-bounce rounded-full bg-ember [animation-delay:-0.15s]" />
    <span className="h-2 w-2 animate-bounce rounded-full bg-ember" />
  </div>
);

function App() {
  const { generateQuestions, evaluateAnswer } = useInterviewAI();

  const [page, setPage] = useState<Page>('home');
  const [role, setRole] = useState('React Developer');
  const [experience, setExperience] = useState('2');
  const [questions, setQuestions] = useState<string[]>([]);
  const [entries, setEntries] = useState<InterviewEntry[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeQuestion = questions[activeIndex];
  const progress = useMemo(() => `${Math.min(activeIndex + 1, 5)}/5`, [activeIndex]);

  const startInterview = async () => {
    if (!role.trim() || !experience.trim()) {
      setError('Please provide both role and experience to start.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const generated = await generateQuestions(role.trim(), experience.trim());
      setQuestions(generated.slice(0, 5));
      setEntries(generated.slice(0, 5).map((question) => ({ question, answer: '' })));
      setActiveIndex(0);
      setAnswer('');
      setPage('interview');
    } catch {
      setError('Unable to start interview right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim() || !activeQuestion) return;

    setLoading(true);
    setError('');

    try {
      const feedback = await evaluateAnswer(role, experience, activeQuestion, answer.trim());

      setEntries((previous) => {
        const copy = [...previous];
        copy[activeIndex] = { ...copy[activeIndex], answer: answer.trim(), feedback };
        return copy;
      });

      setAnswer('');

      if (activeIndex >= questions.length - 1) {
        setPage('done');
      } else {
        setTimeout(() => {
          setActiveIndex((prev) => prev + 1);
        }, 250);
      }
    } catch {
      setError('We could not evaluate this answer. Please retry in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setPage('home');
    setQuestions([]);
    setEntries([]);
    setActiveIndex(0);
    setAnswer('');
    setError('');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 px-4 py-8 text-zinc-100 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center animate-fadeInUp">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">AI Interview Prep Coach</h1>
          <p className="mt-2 text-sm text-zinc-400 sm:text-base">Mobile-first prep with live AI feedback powered by Puter.js.</p>
        </header>

        {page === 'home' && (
          <section className="premium-card animate-fadeInUp space-y-5 p-5 sm:p-8">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">Role</label>
              <input
                value={role}
                onChange={(event) => setRole(event.target.value)}
                placeholder="e.g. React Developer"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none transition focus:border-ember"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">Experience (years)</label>
              <input
                value={experience}
                onChange={(event) => setExperience(event.target.value)}
                inputMode="numeric"
                placeholder="e.g. 3"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none transition focus:border-ember"
              />
            </div>

            {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

            <button
              onClick={startInterview}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-ember px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoadingDots />
                  Generating questions...
                </>
              ) : (
                'Start Interview'
              )}
            </button>
          </section>
        )}

        {page === 'interview' && activeQuestion && (
          <section className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-sm text-zinc-300">
              <span>Progress</span>
              <span className="font-medium text-ember">Question {progress}</span>
            </div>
            <QuestionCard question={activeQuestion} index={activeIndex} total={questions.length} />
            {loading && (
              <div className="premium-card animate-fadeInUp flex items-center gap-3 p-4 text-sm text-zinc-300">
                <LoadingDots />
                AI is reviewing your answer...
              </div>
            )}
            {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
            <ChatBox
              entries={entries.slice(0, activeIndex + 1)}
              answer={answer}
              loading={loading}
              onAnswerChange={setAnswer}
              onSubmit={submitAnswer}
            />
          </section>
        )}

        {page === 'done' && (
          <section className="premium-card animate-fadeInUp space-y-5 p-6 text-center sm:p-8">
            <h2 className="text-2xl font-bold">Interview Completed 🎉</h2>
            <p className="text-zinc-300">Great work! Review your feedback and run another round to improve even more.</p>
            <button
              onClick={restart}
              className="rounded-xl bg-ember px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-orange-500"
            >
              Start Again
            </button>
          </section>
        )}
      </div>
    </main>
  );
}

export default App;
