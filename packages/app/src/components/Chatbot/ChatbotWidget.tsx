import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { chatbotQuestions, type ChatbotQuestion, type ChatbotAnswer } from './chatbotData';
import { generateSummary, saveChatbotResponse } from './chatbotUtils';

interface ChatbotWidgetProps {
  autoOpenDelay?: number;
  onComplete?: (data: any) => void;
}

interface ChatbotState {
  isOpen: boolean;
  currentQuestionId: string;
  answers: ChatbotAnswer[];
  isComplete: boolean;
  isSubmitting: boolean;
  error: string | null;
  email: string;
  showEmailInput: boolean;
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ 
  autoOpenDelay = 8000,
  onComplete 
}) => {
  const [state, setState] = useState<ChatbotState>({
    isOpen: false,
    currentQuestionId: 'Q1',
    answers: [],
    isComplete: false,
    isSubmitting: false,
    error: null,
    email: '',
    showEmailInput: false,
  });

  const widgetRef = useRef<HTMLDivElement>(null);
  const hasAutoOpened = useRef(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!state.isOpen) return;
      
      if (event.key === 'Escape') {
        setState(prev => ({ ...prev, isOpen: false }));
        return;
      }
      
      const currentQuestion = chatbotQuestions.find(q => q.id === state.currentQuestionId);
      if (currentQuestion && !state.isComplete && !state.showEmailInput) {
        const options = currentQuestion.options;
        const keyMap: Record<string, string> = {
          '1': 'A',
          '2': 'B', 
          '3': 'C',
          '4': 'D',
          'a': 'A',
          'b': 'B',
          'c': 'C',
          'd': 'D'
        };
        
        const answerKey = keyMap[event.key.toLowerCase()];
        if (answerKey) {
          const option = options.find(opt => opt.key === answerKey);
          if (option) {
            handleAnswer(currentQuestion.id, option.key, option.label);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.isOpen, state.isComplete, state.showEmailInput, state.currentQuestionId]);

  // Auto-open functionality
  useEffect(() => {
    if (hasAutoOpened.current) return;
    
    const timer = setTimeout(() => {
      const hasVisited = localStorage.getItem('soyl_chatbot_visited');
      if (!hasVisited) {
        setState(prev => ({ ...prev, isOpen: true }));
        hasAutoOpened.current = true;
        localStorage.setItem('soyl_chatbot_visited', 'true');
      }
    }, autoOpenDelay);

    return () => clearTimeout(timer);
  }, [autoOpenDelay]);

  // Load saved session
  useEffect(() => {
    const savedSession = localStorage.getItem('soyl_chatbot_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setState(prev => ({
          ...prev,
          currentQuestionId: session.currentQuestionId || 'Q1',
          answers: session.answers || [],
          isComplete: session.isComplete || false,
        }));
      } catch (error) {
        console.error('Failed to load chatbot session:', error);
      }
    }
  }, []);

  // Save session to localStorage
  const saveSession = (newState: Partial<ChatbotState>) => {
    const sessionData = {
      currentQuestionId: newState.currentQuestionId || state.currentQuestionId,
      answers: newState.answers || state.answers,
      isComplete: newState.isComplete || state.isComplete,
    };
    localStorage.setItem('soyl_chatbot_session', JSON.stringify(sessionData));
  };

  const handleAnswer = async (questionId: string, answerKey: string, answerLabel: string) => {
    // Rate limiting - prevent rapid clicks
    if (state.isSubmitting) return;
    
    setState(prev => ({ ...prev, isSubmitting: true }));
    
    const newAnswer: ChatbotAnswer = {
      questionId,
      answerKey,
      answerLabel,
    };

    const updatedAnswers = [...state.answers, newAnswer];
    const currentQuestion = chatbotQuestions.find(q => q.id === questionId);
    const selectedOption = currentQuestion?.options.find(opt => opt.key === answerKey);
    const nextQuestionId = selectedOption?.next || 'COMPLETE';

    setState(prev => ({
      ...prev,
      answers: updatedAnswers,
      currentQuestionId: nextQuestionId,
      error: null,
      isSubmitting: false,
    }));

    saveSession({
      answers: updatedAnswers,
      currentQuestionId: nextQuestionId,
    });

    // Track analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'question_answered', {
        question_id: questionId,
        answer_key: answerKey,
        question_number: state.answers.length + 1,
      });
    }

    // Handle completion
    if (nextQuestionId === 'COMPLETE') {
      setState(prev => ({ ...prev, isComplete: true }));
      saveSession({ isComplete: true });
      
      // Track completion without email
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'flow_completed', {
          session_id: crypto.randomUUID(),
          email_provided: false,
          answers_count: updatedAnswers.length,
        });
      }
    }
  };

  const handleCompleteAction = async (action: string) => {
    if (action === 'ask_for_email') {
      setState(prev => ({ ...prev, showEmailInput: true }));
      return;
    }

    if (action === 'open_studio') {
      window.location.href = '/studio';
      return;
    }

    if (action === 'save_session') {
      // Save session and close
      setState(prev => ({ ...prev, isOpen: false }));
      return;
    }
  };

  const handleEmailSubmit = async () => {
    if (!state.email.trim()) return;

    setState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const summary = generateSummary(state.answers);
      const responseData = {
        sessionId: crypto.randomUUID(),
        startedAt: new Date().toISOString(),
        answers: state.answers,
        summary,
        email: state.email,
        source: 'chatbot',
        utm: new URLSearchParams(window.location.search).toString(),
        visitorId: localStorage.getItem('soyl_visitor_id') || crypto.randomUUID(),
      };

      await saveChatbotResponse(responseData);

      // Track completion
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'flow_completed', {
          session_id: responseData.sessionId,
          email_provided: true,
          answers_count: state.answers.length,
        });
        
        (window as any).gtag('event', 'email_provided', {
          session_id: responseData.sessionId,
          source: 'chatbot'
        });
      }

      setState(prev => ({ 
        ...prev, 
        isSubmitting: false,
        isOpen: false,
        showEmailInput: false,
      }));

      // Clear session
      localStorage.removeItem('soyl_chatbot_session');
      
      if (onComplete) {
        onComplete(responseData);
      }

    } catch (error) {
      console.error('Failed to save chatbot response:', error);
      setState(prev => ({ 
        ...prev, 
        isSubmitting: false,
        error: 'Failed to save your responses. Please try again.',
      }));
    }
  };

  const toggleChatbot = () => {
    const newIsOpen = !state.isOpen;
    setState(prev => ({ ...prev, isOpen: newIsOpen }));
    
    // Track analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'chat_open', {
        action: newIsOpen ? 'open' : 'close',
        source: 'chat_button'
      });
    }
  };

  const resetChatbot = () => {
    setState({
      isOpen: true,
      currentQuestionId: 'Q1',
      answers: [],
      isComplete: false,
      isSubmitting: false,
      error: null,
      email: '',
      showEmailInput: false,
    });
    localStorage.removeItem('soyl_chatbot_session');
  };

  const currentQuestion = chatbotQuestions.find(q => q.id === state.currentQuestionId);
  const progress = state.answers.length;
  const totalQuestions = chatbotQuestions.length;

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={toggleChatbot}
        className="fixed bottom-6 right-6 z-50 bg-soyl-gold hover:bg-soyl-gold/90 text-soyl-black rounded-full p-4 shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-soyl-gold focus:ring-offset-2 focus:ring-offset-soyl-black"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open SOYL Studio Bot"
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
      </motion.button>

      {/* Chat Widget */}
      <AnimatePresence>
        {state.isOpen && (
          <motion.div
            ref={widgetRef}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-soyl-white text-soyl-black rounded-2xl shadow-2xl border border-soyl-gold/20"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-soyl-gold/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-soyl-gold rounded-full flex items-center justify-center">
                  <span className="text-soyl-black font-bold text-sm">S</span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">SOYL Studio Bot</h3>
                  <p className="text-xs text-gray-600">Design assistant</p>
                </div>
              </div>
              <button
                onClick={toggleChatbot}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close chatbot"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-96 overflow-y-auto" role="main" aria-live="polite" aria-label="Chatbot conversation">
              {/* Progress Bar */}
              {!state.isComplete && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{progress}/{totalQuestions}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={totalQuestions} aria-label={`Question ${progress} of ${totalQuestions}`}>
                    <motion.div
                      className="bg-soyl-gold h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(progress / totalQuestions) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {state.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {state.error}
                </div>
              )}

              {/* Question Content */}
              {state.showEmailInput ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-700">
                    Enter your email to receive your design brief:
                  </p>
                  <input
                    type="email"
                    value={state.email}
                    onChange={(e) => setState(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-soyl-gold focus:border-transparent"
                    disabled={state.isSubmitting}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleEmailSubmit}
                      disabled={!state.email.trim() || state.isSubmitting}
                      className="flex-1 bg-soyl-gold hover:bg-soyl-gold/90 disabled:bg-gray-300 text-soyl-black px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {state.isSubmitting ? 'Sending...' : 'Send Brief'}
                    </button>
                    <button
                      onClick={() => setState(prev => ({ ...prev, showEmailInput: false }))}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : state.isComplete ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-soyl-gold rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-soyl-black font-bold text-lg">✓</span>
                    </div>
                    <h4 className="font-semibold text-lg mb-2">Design Brief Ready!</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {generateSummary(state.answers)}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => handleCompleteAction('open_studio')}
                      className="w-full bg-soyl-gold hover:bg-soyl-gold/90 text-soyl-black px-4 py-3 rounded-lg font-medium transition-colors"
                    >
                      Start Studio
                    </button>
                    <button
                      onClick={() => handleCompleteAction('ask_for_email')}
                      className="w-full border border-soyl-gold text-soyl-gold hover:bg-soyl-gold hover:text-soyl-black px-4 py-3 rounded-lg font-medium transition-colors"
                    >
                      Email Brief to Me
                    </button>
                    <button
                      onClick={() => handleCompleteAction('save_session')}
                      className="w-full text-gray-600 hover:text-gray-800 px-4 py-2 transition-colors"
                    >
                      Save & Continue Later
                    </button>
                  </div>
                </div>
              ) : currentQuestion ? (
                <div className="space-y-4">
                  <p className="text-sm font-medium">{currentQuestion.text}</p>
                  <p className="text-xs text-gray-500 sr-only">
                    Use number keys 1-4 or letter keys A-D to select an option, or use Tab to navigate and Enter to select.
                  </p>
                  
                  <div className="space-y-2" role="radiogroup" aria-labelledby="question-text">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={option.key}
                        onClick={() => handleAnswer(currentQuestion.id, option.key, option.label)}
                        className="w-full text-left p-3 border border-gray-200 hover:border-soyl-gold hover:bg-soyl-gold/5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-soyl-gold focus:ring-offset-2"
                        disabled={state.isSubmitting}
                        aria-describedby={`option-${option.key}-desc`}
                        role="radio"
                        aria-checked="false"
                        tabIndex={0}
                      >
                        <span className="text-sm font-medium">{option.key}. </span>
                        <span className="text-sm">{option.label}</span>
                        <span id={`option-${option.key}-desc`} className="sr-only">
                          Press {index + 1} or {option.key.toLowerCase()} to select this option
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Something went wrong. Please try again.</p>
                  <button
                    onClick={resetChatbot}
                    className="mt-4 bg-soyl-gold hover:bg-soyl-gold/90 text-soyl-black px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Restart
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-soyl-gold/20 bg-gray-50 rounded-b-2xl">
              <p className="text-xs text-gray-500 text-center">
                We use your answers to create design briefs. We don't sell data.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;
