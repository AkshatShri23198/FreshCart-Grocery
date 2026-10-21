import React, { useState, useRef, useEffect } from 'react';
import { PantryItem, AssistantMessage } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Bot, X, Send, Loader2, Sparkles, User, RefreshCw } from 'lucide-react';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pantryItems: PantryItem[];
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  pantryItems,
}) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'm1',
      role: 'assistant',
      content:
        "Hi! I'm Sprout, your AI kitchen & grocery assistant. Ask me anything about storage tips, ingredient substitutions, budget meal planning, or what to cook with your current pantry inventory!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const quickPrompts = [
    "How do I store strawberries to last longer?",
    "What can I cook with milk, eggs & bread?",
    "Healthy substitute for heavy whipping cream?",
    "3 budget-friendly meal prep ideas",
  ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: AssistantMessage = {
      id: 'm_' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const pantrySummary = pantryItems
      .map((i) => `${i.name} (${i.quantity} ${i.unit}, Expires: ${i.expirationDate})`)
      .join(', ');

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          pantrySummary,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to reach AI assistant server.');
      }

      const data = await res.json();

      const aiMsg: AssistantMessage = {
        id: 'm_ai_' + Date.now(),
        role: 'assistant',
        content: data.reply || "I'm here to help with all your kitchen queries!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'm_err_' + Date.now(),
          role: 'assistant',
          content: 'Sorry, I ran into a connection issue. Please check API key setup.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className={`${theme.modalBg} w-full max-w-md h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200`}>
        {/* Header */}
        <div className={`p-4 ${theme.modalHeaderBg} text-white flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-800 flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Sprout AI Kitchen Assistant</h3>
              <p className="text-[10px] text-emerald-200 font-medium">Always context-aware of your pantry</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-emerald-300 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-emerald-50/30">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 text-xs ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl max-w-[85%] space-y-1 font-medium ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-xs'
                    : 'bg-white border border-emerald-100 text-slate-800 shadow-sm rounded-tl-xs'
                }`}
              >
                <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                <div
                  className={`text-[9px] text-right ${
                    msg.role === 'user' ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-lg bg-slate-800 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white p-3 rounded-2xl border border-emerald-100 w-fit">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Sprout is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="p-3 bg-white border-t border-slate-100 space-y-2">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            Suggested Prompts:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp)}
                className="text-[10px] font-bold bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-950 px-3 py-1 rounded-full whitespace-nowrap transition-colors border border-emerald-100"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Sprout anything about cooking or groceries..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 text-xs px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl transition-colors shadow-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
