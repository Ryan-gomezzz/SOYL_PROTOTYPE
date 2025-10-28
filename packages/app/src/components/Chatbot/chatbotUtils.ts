import { ChatbotAnswer, answerLabels } from './chatbotData';

export interface ChatbotResponse {
  sessionId: string;
  startedAt: string;
  answers: ChatbotAnswer[];
  summary: string;
  email?: string;
  source: string;
  utm?: string;
  visitorId: string;
}

export function generateSummary(answers: ChatbotAnswer[]): string {
  const answerMap: Record<string, string> = {};
  
  answers.forEach(answer => {
    answerMap[answer.questionId] = answer.answerLabel;
  });

  const story = answerMap.Q2 || 'Unknown story';
  const product = answerMap.Q3 || 'Unknown product';
  const vibe = answerMap.Q4 || 'Unknown vibe';
  const colors = answerMap.Q5 || 'Unknown colors';
  const placement = answerMap.Q6 || 'Unknown placement';
  const tier = answerMap.Q7 || 'Unknown tier';

  return `${story} on a ${product}, ${vibe}, ${colors}, ${placement}. Tier: ${tier}.`;
}

export async function saveChatbotResponse(data: ChatbotResponse): Promise<void> {
  const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3001';
  
  const response = await fetch(`${API_BASE}/api/chatbot-responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to save chatbot response: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

export function generateVisitorId(): string {
  let visitorId = localStorage.getItem('soyl_visitor_id');
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem('soyl_visitor_id', visitorId);
  }
  return visitorId;
}

export function trackChatbotEvent(eventName: string, parameters?: Record<string, any>): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, parameters);
  }
}

export function getUTMParameters(): string {
  const urlParams = new URLSearchParams(window.location.search);
  const utmParams = new URLSearchParams();
  
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
    const value = urlParams.get(param);
    if (value) {
      utmParams.set(param, value);
    }
  });
  
  return utmParams.toString();
}
