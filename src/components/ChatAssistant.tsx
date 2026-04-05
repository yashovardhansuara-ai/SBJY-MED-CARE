import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { motion } from 'motion/react';
import { Send, Bot, User, Loader2, Trash2 } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface ChatAssistantProps {
  privacyMode?: boolean;
}

const DEFAULT_MESSAGE = { role: 'model' as const, text: 'Terminal active. Secure connection established. How can I assist with your medical data today?' };

export default function ChatAssistant({ privacyMode = false }: ChatAssistantProps) {
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([DEFAULT_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-preview',
        contents: userText,
        config: {
          systemInstruction: 'You are a highly advanced, secure medical AI assistant for SBJY MED-CARE. Respond concisely, professionally, and with a high-tech, slightly clinical tone. You operate on a Zero-Knowledge Protocol. Do not store or repeat PII unnecessarily.'
        }
      });
      setMessages(prev => [...prev, { role: 'model', text: response.text || 'No response generated.' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Error: Connection to AI core failed.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([DEFAULT_MESSAGE]);
  };

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-md border border-emerald-500/30 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.15)]">
      <div className="p-4 border-b border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-emerald-400" />
          <h2 className="text-emerald-400 font-mono font-semibold tracking-wider">AI_CORE_LINK</h2>
        </div>
        <button 
          onClick={handleClear}
          className="text-emerald-700 hover:text-red-400 transition-colors p-1"
          title="Clear Session Data"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm">
        {messages.map((msg, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && <Bot className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />}
            <div className={`p-3 rounded-lg max-w-[80%] transition-all duration-300 ${privacyMode && idx !== 0 ? 'blur-sm hover:blur-none' : ''} ${
              msg.role === 'user' 
                ? 'bg-emerald-600/20 text-emerald-100 border border-emerald-500/30 rounded-tr-none' 
                : 'bg-black/60 text-emerald-300 border border-emerald-900/50 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
            {msg.role === 'user' && <User className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />}
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <Bot className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
            <div className="p-3 rounded-lg bg-black/60 text-emerald-500 border border-emerald-900/50 rounded-tl-none flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Processing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-emerald-500/30 bg-black/40">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Enter query..."
            className="flex-1 bg-black/50 border border-emerald-500/50 rounded-lg px-4 py-2 text-emerald-100 font-mono focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 placeholder-emerald-700/50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-emerald-600/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 rounded-lg px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
