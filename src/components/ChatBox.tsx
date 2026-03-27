import { FormEvent, useMemo, useRef, useState } from 'react';
import { InterviewEntry } from '../types';
import FeedbackCard from './FeedbackCard';

interface ChatBoxProps {
  entry: InterviewEntry;
  answer: string;
  loading: boolean;
  canGoNext: boolean;
  isLastQuestion: boolean;
  onAnswerChange: (value: string) => void;
  onSubmit: () => Promise<void>;
  onNext: () => void;
}

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechCtor = new () => BrowserSpeechRecognition;

const ChatBox = ({
  entry,
  answer,
  loading,
  canGoNext,
  isLastQuestion,
  onAnswerChange,
  onSubmit,
  onNext,
}: ChatBoxProps) => {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  const supportsSpeech = useMemo(() => {
    const speechWindow = window as unknown as {
      SpeechRecognition?: SpeechCtor;
      webkitSpeechRecognition?: SpeechCtor;
    };
    return Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition);
  }, []);

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const toggleMic = () => {
    if (!supportsSpeech) return;
    if (listening) {
      stopListening();
      return;
    }

    const speechWindow = window as unknown as {
      SpeechRecognition?: SpeechCtor;
      webkitSpeechRecognition?: SpeechCtor;
    };

    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(' ')
        .trim();

      onAnswerChange(transcript);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    stopListening();
    await onSubmit();
  };

  return (
    <div className="space-y-4">
      {entry.answer && (
        <div className="ml-auto max-w-[90%] animate-fadeInUp rounded-2xl rounded-br-sm bg-zinc-800 px-4 py-3 text-sm text-zinc-100 sm:max-w-[80%]">
          {entry.answer}
        </div>
      )}

      {entry.feedback && <FeedbackCard feedback={entry.feedback} />}

      {canGoNext && (
        <div className="flex justify-end animate-fadeInUp">
          <button
            type="button"
            onClick={onNext}
            className="rounded-xl bg-ember px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-orange-500"
          >
            {isLastQuestion ? 'Finish Interview' : 'Next Question'}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="premium-card animate-fadeInUp p-3 sm:p-4">
        <textarea
          value={answer}
          onChange={(event) => onAnswerChange(event.target.value)}
          disabled={loading || canGoNext}
          rows={4}
          placeholder="Type your answer here or use the mic..."
          className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950/80 p-3 text-sm text-zinc-100 outline-none transition focus:border-ember disabled:opacity-60"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMic}
              disabled={loading || canGoNext || !supportsSpeech}
              className="rounded-xl border border-zinc-700 px-3 py-2 text-xs text-zinc-200 transition hover:border-ember hover:text-ember disabled:cursor-not-allowed disabled:opacity-50"
            >
              {listening ? '🎙️ Stop Mic' : '🎤 Speak Answer'}
            </button>
            <p className="text-xs text-zinc-400">{supportsSpeech ? 'Speech turns into editable text.' : 'Mic not supported in this browser.'}</p>
          </div>
          <button
            type="submit"
            disabled={loading || canGoNext || !answer.trim()}
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
