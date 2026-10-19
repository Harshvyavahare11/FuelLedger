// src/pages/AIAssistant.jsx
import { useState, useEffect, useRef } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { askQuestion, isAvailable, AI_STATUS } from '../services/aiService';
import { PrimaryButton } from '../components/ui/Buttons';
import { Bot, Send, User, Wifi, WifiOff, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import Card from '../components/ui/Card';

const QUICK_PROMPTS = [
  'What is the current fuel inventory status?',
  'Show me revenue summary for this week',
  'Explain the UPI reconciliation mismatch',
  'What should I order and how much?',
  'How to generate my daily report?',
  'Forecast CNG stock for next 14 days',
];

function StatusBadge({ status }) {
  if (status === AI_STATUS.CONNECTED) return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
      <span className="status-dot live" />
      AI Connected
    </div>
  );
  if (status === AI_STATUS.DEMO) return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
      <span className="status-dot demo" />
      Demo Mode
    </div>
  );
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
      <span className="status-dot offline" />
      Unavailable
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${isUser ? 'bg-slate-700' : 'bg-emerald-500'}`}>
        {isUser ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-white" />}
      </div>
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-slate-800 text-white rounded-tr-sm'
            : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm'
        }`}>
          {msg.typing ? (
            <div className="flex gap-1 py-1">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{msg.content}</div>
          )}
        </div>
        {msg.disclaimer && (
          <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {msg.disclaimer}
          </p>
        )}
        {msg.source && msg.source !== AI_STATUS.CONNECTED && (
          <p className="text-[10px] text-slate-400 mt-1">Source: Demo responses</p>
        )}
      </div>
    </div>
  );
}

const WELCOME_MSG = {
  id: 'welcome',
  role: 'assistant',
  content: `👋 Hello! I'm **FuelLedger AI**, your smart fuel station assistant.

I can help you with:
• 📊 Sales & revenue analysis
• 📦 Inventory status and forecasting  
• 💰 Reconciliation and payment insights
• 📋 Daily report guidance
• 🔮 Demand forecasting

Ask me anything about your station operations! (Demo Mode: responses are pre-defined examples)`,
};

export default function AIAssistant() {
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(AI_STATUS.DEMO);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    isAvailable().then(setAiStatus);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { id: Date.now(), role: 'user', content: msg };
    const typingMsg = { id: Date.now() + 1, role: 'assistant', typing: true, content: '' };
    setMessages(prev => [...prev, userMsg, typingMsg]);
    setLoading(true);

    const result = await askQuestion(msg, { stationName: 'Bharat Petroleum', stationId: 'FL-PN-001', ownerName: 'Rajesh Kumar' });

    setMessages(prev => {
      const filtered = prev.filter(m => !m.typing);
      return [...filtered, {
        id: Date.now() + 2,
        role: 'assistant',
        content: result.response,
        source: result.source,
        disclaimer: result.disclaimer,
      }];
    });
    setLoading(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function resetChat() {
    setMessages([WELCOME_MSG]);
  }

  return (
    <AppLayout title="AI Assistant" subtitle="Intelligent insights powered by FuelLedger AI">
      <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
        {/* Status bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <StatusBadge status={aiStatus} />
            <p className="text-xs text-slate-500">
              {aiStatus === AI_STATUS.CONNECTED
                ? `Connected to Ollama — live responses enabled`
                : `Demo Mode — pre-defined responses. Install Ollama + gemma3:4b for live AI.`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => isAvailable().then(setAiStatus)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Check Status
            </button>
            <button
              onClick={resetChat}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Clear Chat
            </button>
          </div>
        </div>

        {/* Setup note for Ollama */}
        {aiStatus === AI_STATUS.DEMO && (
          <Card className="bg-slate-800 text-white border-0">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white mb-1">Enable Live AI with Ollama</p>
                <p className="text-xs text-slate-300 mb-2">Run a local LLM for real-time station insights:</p>
                <div className="bg-slate-900 rounded-lg px-3 py-2 font-mono text-xs text-emerald-400 space-y-1">
                  <p>$ ollama pull gemma3:4b</p>
                  <p>$ ollama serve</p>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Then set VITE_OLLAMA_URL=http://localhost:11434 in .env</p>
              </div>
            </div>
          </Card>
        )}

        {/* Chat window */}
        <Card padding={false} className="overflow-hidden flex flex-col" style={{ height: '500px' }}>
          {/* Header */}
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
            <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">FuelLedger AI</p>
              <p className="text-[10px] text-slate-400">Your station intelligence assistant</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => <Message key={msg.id} msg={msg} />)}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 pb-4 pt-2 border-t border-slate-100">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your station... (Enter to send)"
                rows={1}
                className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-emerald-400 focus:bg-white transition-colors resize-none"
                style={{ minHeight: '44px', maxHeight: '100px' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>

        {/* Quick prompts */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map(prompt => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                disabled={loading}
                className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-full hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
