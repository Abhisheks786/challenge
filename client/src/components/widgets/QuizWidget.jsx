import React, { useState } from 'react';

export function QuizWidget({ data }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!data || !data.questions) return null;

  const question = data.questions[currentIdx];
  const progress = ((currentIdx) / data.questions.length) * 100;

  const handleSelect = (idx) => {
    if (feedback) return;
    setSelectedOpt(idx);
    
    // Simulate submission or check if correct based on provided data
    // Assuming data.questions[i].correctOption is provided
    const isCorrect = idx === question.correctOption;
    if (isCorrect) setScore(s => s + 1);
    
    setFeedback({
      isCorrect,
      text: isCorrect ? 'Correct! ' : 'Incorrect. ',
      explanation: question.explanation || ''
    });
  };

  const handleNext = () => {
    setSelectedOpt(null);
    setFeedback(null);
    if (currentIdx < data.questions.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      setIsFinished(true);
      // POST score to backend (assuming globally provided userId or handled by caller)
      fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: question.id, selectedAnswer: selectedOpt, userId: 'demo-user' })
      }).catch(console.error);
    }
  };

  const handleRetry = () => {
    setCurrentIdx(0);
    setScore(0);
    setIsFinished(false);
    setSelectedOpt(null);
    setFeedback(null);
  };

  if (isFinished) {
    return (
      <div className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-6 text-center my-4 shadow-lg shadow-black/50">
        <h3 className="text-xl font-bold text-white mb-2">Quiz Completed!</h3>
        <p className="text-4xl font-black text-orange-500 mb-4">{score} / {data.questions.length}</p>
        <p className="text-sm text-neutral-400 mb-6">Great job participating. Knowledge is power!</p>
        <button onClick={handleRetry} className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg border border-neutral-600 transition-colors">
          Retry Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-neutral-900 border border-neutral-700 rounded-xl overflow-hidden my-4">
      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-neutral-800">
        <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Question {currentIdx + 1} of {data.questions.length}</span>
          <span className="text-xs bg-neutral-800 px-2 py-1 rounded text-neutral-400">Score: {score}</span>
        </div>
        
        <h4 className="text-base font-medium text-white mb-5">{question.text}</h4>
        
        <div className="flex flex-col gap-2">
          {question.options.map((opt, i) => {
            let btnClass = "text-left px-4 py-3 rounded-lg border text-sm transition-colors ";
            if (feedback) {
              if (i === question.correctOption) {
                btnClass += "bg-green-500/10 border-green-500/50 text-green-400";
              } else if (i === selectedOpt) {
                btnClass += "bg-red-500/10 border-red-500/50 text-red-400";
              } else {
                btnClass += "bg-neutral-800/50 border-neutral-700/50 text-neutral-500";
              }
            } else {
              btnClass += "bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:border-neutral-500 cursor-pointer";
            }
            
            return (
              <button key={i} disabled={!!feedback} onClick={() => handleSelect(i)} className={btnClass}>
                {opt}
              </button>
            );
          })}
        </div>

        {feedback && (
          <div className={`mt-5 p-4 rounded-lg text-sm border ${feedback.isCorrect ? 'bg-green-500/10 border-green-500/20 text-green-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
            <span className="font-bold">{feedback.text}</span>
            {feedback.explanation}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button 
            disabled={!feedback} 
            onClick={handleNext}
            className="px-5 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-0 disabled:pointer-events-none text-white text-sm font-medium rounded-lg transition-all"
          >
            {currentIdx < data.questions.length - 1 ? 'Next Question' : 'View Results'}
          </button>
        </div>
      </div>
    </div>
  );
}
