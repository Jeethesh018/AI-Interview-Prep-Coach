interface QuestionCardProps {
  question: string;
  index: number;
  total: number;
}

const QuestionCard = ({ question, index, total }: QuestionCardProps) => {
  return (
    <div className="premium-card animate-fadeInUp p-4 sm:p-6">
      <div className="mb-3 flex items-center justify-between text-xs sm:text-sm">
        <span className="rounded-full bg-ember/20 px-3 py-1 text-ember">AI Interviewer</span>
        <span className="text-zinc-400">Question {index + 1}/{total}</span>
      </div>
      <p className="text-base leading-relaxed text-zinc-100 sm:text-lg">{question}</p>
    </div>
  );
};

export default QuestionCard;
