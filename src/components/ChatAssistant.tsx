import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Bot, User, Loader2, Trash2, Camera, X } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useSecureChat } from '../contexts/SecureChatContext';
import { EncryptionUtility } from '../lib/EncryptionUtility';

interface ChatAssistantProps {
  privacyMode?: boolean;
  latestScan?: any;
  glassStyle?: any;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string;
}

const DEFAULT_MESSAGE: ChatMessage = { role: 'model', text: 'Hello! I am your SBJY MED-CARE assistant. I am here to support you in any way I can. How can I help you today? You can ask me questions or upload an image of your medicine for analysis.' };

export default function ChatAssistant({ privacyMode = false, latestScan, glassStyle }: ChatAssistantProps) {
  const { ghostMode, proactiveAI, comprehensionLevel } = useSettings();
  const { sendMessage, pin } = useSecureChat();
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [lastProcessedScan, setLastProcessedScan] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load encrypted history
  useEffect(() => {
    const loadEncryptedHistory = async () => {
      try {
        const saved = localStorage.getItem('chatHistory_secure');
        if (saved && pin) {
          const decrypted = await EncryptionUtility.decrypt(pin, saved);
          setMessages(JSON.parse(decrypted));
        }
      } catch (e) {
        console.error("Failed to decrypt chat history. Data might be corrupted or PIN is wrong.");
      }
    };
    loadEncryptedHistory();
  }, [pin]);

  // Save to localStorage securely whenever messages change (if not in Ghost Mode)
  useEffect(() => {
    const saveSecurely = async () => {
      if (!ghostMode && pin && messages.length > 1) {
        const encrypted = await EncryptionUtility.encrypt(pin, JSON.stringify(messages));
        localStorage.setItem('chatHistory_secure', encrypted);
      }
    };
    saveSecurely();
  }, [messages, ghostMode, pin]);

  // Handle wiping data from settings
  useEffect(() => {
    const handleWipe = () => {
      setMessages([DEFAULT_MESSAGE]);
      setLastProcessedScan(null);
    };
    window.addEventListener('terminalDataCleared', handleWipe);
    return () => window.removeEventListener('terminalDataCleared', handleWipe);
  }, []);

  const getConfig = () => {
    const complexityInstruction = comprehensionLevel === 'layperson' 
      ? 'Keep all your answers SHORT, SIMPLE, and EASY TO UNDERSTAND for a layperson. Use analogies.' 
      : 'Provide detailed Clinical terminology and raw medical data.';
    
    return {
      systemInstruction: `You are a highly advanced, secure, and deeply supportive medical AI assistant for SBJY MED-CARE. Your primary goal is to act supportive, empathetic, and helpful to the patient. ${complexityInstruction} Always use verified medical information. You operate on a Zero-Knowledge Protocol. If the user scans a document, you will be notified via a SYSTEM MESSAGE. Acknowledge the document and ask if they have questions.`,
      tools: [{ googleSearch: {} }]
    };
  };

  useEffect(() => {
    if (latestScan && latestScan !== lastProcessedScan) {
      setLastProcessedScan(latestScan);
      if (proactiveAI) {
        injectContext(latestScan);
      }
    }
  }, [latestScan, proactiveAI]);

  const removePII = (text: string) => {
    let sanitized = text;
    // Regex for basic formatting of names, SSN, Phone numbers
    sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[REDACTED_SSN]");
    sanitized = sanitized.replace(/\b(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})\b/g, "[REDACTED_PHONE]");
    return sanitized;
  };

  const injectContext = async (scanData: any) => {
    setIsLoading(true);
    try {
      const sanitizedData = removePII(JSON.stringify(scanData));
      const systemMessage = `[SYSTEM MESSAGE: The user just scanned a new document/prescription in the app. Here are the extracted details: ${sanitizedData}. Acknowledge this to the user in a supportive, empathetic tone. Briefly mention what the document is, and ask if they have any doubts or questions about the prescription, risk level, or medicines.]`;
      
      const payloadMessages = messages.map(m => ({
        role: m.role,
        text: m.text
        // ignoring images for context injection history for simplicity
      }));
      payloadMessages.push({ role: 'user', text: systemMessage });

      const response = await sendMessage('gemini-3.1-pro-preview', getConfig(), payloadMessages);
      setMessages(prev => [...prev, { role: 'model', text: response.text || 'I see you scanned a document. Let me know if you have questions!' }]);
    } catch (error: any) {
      console.error("Context Injection Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      const base64 = result.split(',')[1];
      setBase64Data(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if ((!input.trim() && !base64Data) || isLoading) return;
    const userText = input.trim();
    const currentImagePreview = imagePreview;
    const currentBase64 = base64Data;
    const currentMimeType = mimeType;

    setInput('');
    setImagePreview(null);
    setBase64Data(null);
    setMimeType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    const sanitizedUserText = removePII(userText);
    setMessages(prev => [...prev, { role: 'user', text: sanitizedUserText, image: currentImagePreview || undefined }]);
    setIsLoading(true);

    try {
      const payloadMessages = messages.map(m => {
          if (m.image && !m.text) return { role: m.role, text: "[Image Provided]" };
          return { role: m.role, text: m.text }
      });
      
      if (currentBase64 && currentMimeType) {
        payloadMessages.push({ 
          role: 'user', 
          parts: [
            { inlineData: { data: currentBase64, mimeType: currentMimeType } },
            { text: sanitizedUserText ? sanitizedUserText : "Please analyze this medicine image, tell me its function, side effects, and when to consume it." }
          ]
        } as any);
      } else {
        payloadMessages.push({ role: 'user', text: sanitizedUserText });
      }

      const response = await sendMessage('gemini-3.1-pro-preview', getConfig(), payloadMessages);
      if (response.error) throw new Error(response.error);
      
      setMessages(prev => [...prev, { role: 'model', text: response.text || 'No response generated.' }]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: `Error: Connection to AI core failed. ${error?.message || 'Please check your connection.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([DEFAULT_MESSAGE]);
    setImagePreview(null);
    setBase64Data(null);
    setMimeType(null);
    setLastProcessedScan(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!ghostMode) {
      localStorage.removeItem('chatHistory_secure');
    }
  };

  return (
    <div style={glassStyle} className="flex flex-col h-full bg-white/60 dark:bg-black/40 border border-emerald-200 dark:border-emerald-500/30 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.05)] dark:shadow-[0_0_15px_rgba(16,185,129,0.15)]">
      <div className="p-4 border-b border-emerald-200 dark:border-emerald-500/30 bg-emerald-100/50 dark:bg-emerald-950/20 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <h2 className="text-emerald-700 dark:text-emerald-400 font-mono font-semibold tracking-wider">AI_SUPPORT_CORE</h2>
          {ghostMode && <span className="text-[10px] bg-purple-500 text-white px-1.5 py-0.5 rounded font-bold ml-2">GHOST</span>}
        </div>
        <button 
          onClick={handleClear}
          className="text-emerald-700 dark:text-emerald-500 hover:text-red-400 transition-colors p-1"
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
            {msg.role === 'model' && <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-500 shrink-0 mt-1" />}
            <div className={`p-3 rounded-lg max-w-[80%] transition-all duration-300 ${
              msg.role === 'user' 
                ? 'bg-emerald-600/20 text-emerald-900 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-500/30 rounded-tr-none' 
                : 'bg-white/80 dark:bg-black/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 rounded-tl-none'
            }`}>
              {msg.image && (
                <div className="mb-2 rounded-md overflow-hidden border border-emerald-200 dark:border-emerald-500/30">
                  <img src={msg.image} alt="Uploaded" className="max-w-full h-auto max-h-48 object-contain" />
                </div>
              )}
              {privacyMode ? (
                <span className="group/privacy cursor-help relative block">
                  <span className="bg-emerald-900/10 text-emerald-600 dark:bg-white/10 dark:text-emerald-400 font-mono text-sm p-1 rounded blur-sm group-hover/privacy:blur-none transition-all duration-300 select-none">
                    [REDACTED_CHAT_BLOCK]
                  </span>
                  <span className="opacity-0 group-hover/privacy:opacity-100 absolute left-0 top-0 bottom-0 right-0 p-1 flex items-start bg-white/90 dark:bg-black/90 rounded transition-opacity z-10 pointer-events-none overflow-hidden">
                    {msg.text}
                  </span>
                </span>
              ) : msg.text}
            </div>
            {msg.role === 'user' && <User className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-1" />}
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-500 shrink-0 mt-1" />
            <div className="p-3 rounded-lg bg-white/80 dark:bg-black/60 text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-900/50 rounded-tl-none flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Processing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-emerald-200 dark:border-emerald-500/30 bg-white/60 dark:bg-black/40 shrink-0 flex flex-col gap-3">
        {imagePreview && (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-emerald-500/50 group">
            <img src={imagePreview} alt="Upload Preview" className="w-full h-full object-cover" />
            <button 
              onClick={() => { setImagePreview(null); setBase64Data(null); setMimeType(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} 
              className="absolute top-1 right-1 bg-white/80 dark:bg-black/60 text-red-400 p-1 rounded hover:bg-red-900/50 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="bg-emerald-100/50 dark:bg-emerald-900/20 hover:bg-emerald-800/30 text-emerald-700 dark:text-emerald-400 border border-emerald-500/50 rounded-lg px-3 py-2 transition-colors" 
            title="Upload Image"
          >
            <Camera className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question or upload a medicine image..."
            className="flex-1 bg-white/70 dark:bg-black/50 border border-emerald-500/50 rounded-lg px-4 py-2 text-emerald-900 dark:text-emerald-100 font-mono focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 placeholder-emerald-700/50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && !base64Data)}
            className="bg-emerald-600/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 border border-emerald-500/50 rounded-lg px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
