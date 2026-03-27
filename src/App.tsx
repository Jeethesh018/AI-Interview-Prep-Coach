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
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [entries, setEntries] = useState<InterviewEntry[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [canGoNext, setCanGoNext] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  const activeQuestion = questions[activeIndex];
  const activeEntry = entries[activeIndex] ?? { question: activeQuestion ?? '', answer: '' };

  const progress = useMemo(() => `${Math.min(activeIndex + 1, 5)}/5`, [activeIndex]);

  const scoredEntries = useMemo(() => entries.filter((entry) => entry.feedback), [entries]);

  const averageScore = useMemo(() => {
    if (!scoredEntries.length) return 0;
    const total = scoredEntries.reduce((sum, item) => sum + (item.feedback?.score ?? 0), 0);
    return Number((total / scoredEntries.length).toFixed(1));
  }, [scoredEntries]);

  const averageIdealAnswer = useMemo(() => {
    if (!scoredEntries.length) return '';
    return scoredEntries
      .map((item, idx) => `Q${idx + 1}: ${item.feedback?.idealAnswer ?? ''}`)
      .join(' ')
      .slice(0, 420);
  }, [scoredEntries]);

  const startInterview = async () => {
    if (!signedIn) {
      setError('Please continue with Google first before starting the interview.');
      return;
    }

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
      setCanGoNext(false);
      setPage('interview');
    } catch {
      setError('Unable to start interview right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim() || !activeQuestion || canGoNext) return;

    setLoading(true);
    setError('');

    try {
      const feedback = await evaluateAnswer(role, experience, activeQuestion, answer.trim());

      setEntries((previous) => {
        const copy = [...previous];
        copy[activeIndex] = { ...copy[activeIndex], answer: answer.trim(), feedback };
        return copy;
      });

      setCanGoNext(true);
    } catch {
      setError('We could not evaluate this answer. Please retry in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const goToNextQuestion = () => {
    const isLast = activeIndex >= questions.length - 1;
    if (isLast) {
      setPage('done');
      return;
    }

    setActiveIndex((prev) => prev + 1);
    setAnswer('');
    setCanGoNext(false);
    setError('');
  };

  const restart = () => {
    setPage('home');
    setQuestions([]);
    setEntries([]);
    setActiveIndex(0);
    setAnswer('');
    setError('');
    setCanGoNext(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 px-4 py-8 text-zinc-100 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center animate-fadeInUp">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">AI Mock Interview</h1>
          <p className="mt-2 text-sm text-zinc-400 sm:text-base">Real interview style questions with sharp, bullet-point feedback.</p>
        </header>

        {page === 'home' && (
          <section className="premium-card animate-fadeInUp space-y-5 p-5 sm:p-8">
            <button
              onClick={() => {
                setSignedIn(true);
                setError('');
              }}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-semibold transition hover:border-ember hover:text-ember"
            >
              {signedIn ? '✅ Signed in with Google (Demo)' : 'Continue with Google'}
            </button>

            <p className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-xs text-zinc-400">
              To truly save interviews in your Firebase account, add Google Auth + Firestore config. I will need your Firebase project details.
            </p>

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
              entry={activeEntry}
              answer={answer}
              loading={loading}
              canGoNext={canGoNext}
              isLastQuestion={activeIndex === questions.length - 1}
              onAnswerChange={setAnswer}
              onSubmit={submitAnswer}
              onNext={goToNextQuestion}
            />
          </section>
        )}

        {page === 'done' && (
          <section className="premium-card animate-fadeInUp space-y-5 p-6 text-center sm:p-8">
            <h2 className="text-2xl font-bold">Thank you for taking your interview ✅</h2>
            <p className="text-zinc-300">If you want another interview like this, click Start Again.</p>
            <div className="rounded-2xl border border-ember/30 bg-zinc-950/70 p-4 text-left">
              <p className="text-sm text-zinc-400">Average score</p>
              <p className="mt-1 text-3xl font-bold text-ember">{averageScore}/10</p>
              <p className="mt-3 text-sm text-zinc-400">Average ideal answer summary</p>
              <p className="mt-1 text-sm text-zinc-200">{averageIdealAnswer || 'No answer summary available.'}</p>
            </div>
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
