import React from 'react';

const STARTER_QUESTIONS = [
  { id: 'q1', text: 'How does the Lok Sabha election work?', icon: '🏛️' },
  { id: 'q2', text: 'What are the voter eligibility rules in India?', icon: '✅' },
  { id: 'q3', text: 'How are EVMs and VVPATs used?', icon: '🗳️' },
  { id: 'q4', text: 'What is anti-defection law?', icon: '⚖️' },
  { id: 'q5', text: 'How do I register as a voter?', icon: '📝' },
  { id: 'q6', text: 'What happens if no party gets majority?', icon: '🤝' },
];

export function StarterPrompts() {
  const handleQuestionClick = (question) => {
    // Programmatically trigger a suggestion chip
    const inputEl = document.getElementById('chat-input');
    if (inputEl) {
      inputEl.focus();
      // Set value via native setter to trigger React onChange if needed, 
      // or we can rely on form submission directly if we have a way.
      // Easiest is dispatching a submit event or using the store if exposed.
      // For now, setting value and dispatching event.
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      nativeInputValueSetter.call(inputEl, question);
      const ev2 = new Event('input', { bubbles: true});
      inputEl.dispatchEvent(ev2);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 text-center px-4 md:px-8 max-w-4xl mx-auto w-full">
      <div>
        <div className="text-5xl mb-4">🗳️</div>
        <h2 className="text-2xl font-semibold text-neutral-100">Welcome to Election Assistant</h2>
        <p className="text-sm text-neutral-400 mt-2 max-w-md mx-auto">
          Your guide to Indian election processes, voter registration, and constitutional procedures.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        {STARTER_QUESTIONS.map((q) => (
          <button
            key={q.id}
            onClick={() => handleQuestionClick(q.text)}
            className="flex items-center gap-3 p-4 text-left rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:border-neutral-600 transition-all group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">{q.icon}</span>
            <span className="text-sm text-neutral-300 font-medium group-hover:text-white transition-colors">{q.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
