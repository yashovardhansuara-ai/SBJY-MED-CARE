import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Aurora from './Aurora';
import Dock from './Dock';
import ChatAssistant from './ChatAssistant';
import DocumentScanner from './DocumentScanner';
import { Home, Settings, Activity, Shield, Database, Eye, EyeOff, Info, MessageSquare, Scan, Lock, KeyRound } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import SettingsModal from './SettingsModal';
import { useSecureChat } from '../contexts/SecureChatContext';

export default function Dashboard() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [privacyMode, setPrivacyMode] = useState(true);
  const [latestScan, setLatestScan] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'scanner' | 'chat'>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAutoBlurred, setIsAutoBlurred] = useState(false);
  const [pinInput, setPinInput] = useState('');
  
  const { powerSaver, blurIntensity, autoBlur } = useSettings();
  const { pin, setPin } = useSecureChat();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const resetTimer = () => {
      setIsAutoBlurred(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (autoBlur) {
        timeoutRef.current = setTimeout(() => {
          setIsAutoBlurred(true);
        }, 30000); // 30 seconds
      }
    };

    resetTimer();

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('touchstart', resetTimer);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [autoBlur]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim().length >= 4) {
      setPin(pinInput.trim());
    }
  };

  const dockItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Home', onClick: () => setActiveTab('home') },
    { icon: <Scan className="w-5 h-5" />, label: 'Scanner', onClick: () => setActiveTab('scanner') },
    { icon: <MessageSquare className="w-5 h-5" />, label: 'Chat', onClick: () => setActiveTab('chat') },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', onClick: () => setIsSettingsOpen(true) },
  ];

  // Dynamic glassmorphism style
  const glassStyle = { backdropFilter: `blur(${blurIntensity}px)` };

  if (!pin) {
    return (
      <div className="min-h-screen font-sans relative overflow-hidden bg-black flex items-center justify-center selection:bg-emerald-500/30">
        <Aurora colorStops={["#7cff67","#B497CF","#5227FF"]} blend={0.5} amplitude={powerSaver ? 0 : 1.0} speed={powerSaver ? 0 : 0.5} />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 bg-black/60 backdrop-blur-xl border border-emerald-500/40 p-8 rounded-2xl flex flex-col items-center shadow-[0_0_50px_rgba(16,185,129,0.15)] max-w-md w-full mx-4"
        >
          <div className="bg-emerald-950/50 p-4 rounded-full mb-6 border border-emerald-500/30">
            <KeyRound className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-emerald-50 font-mono text-2xl font-bold mb-2 text-center text-balance tracking-tight">SECURE TERMINAL</h1>
          <p className="text-emerald-400/80 font-mono text-sm text-center mb-8 leading-relaxed">
            Welcome to SBJY MED-CARE. Please establish your Privacy PIN to initialize local AES-256 encryption. This PIN is never stored.
          </p>
          
          <form onSubmit={handlePinSubmit} className="w-full flex flex-col gap-4">
            <div>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter Privacy PIN (min 4 chars)"
                className="w-full bg-black/50 border border-emerald-500/50 rounded-lg px-4 py-3 text-emerald-100 font-mono text-center tracking-widest focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all font-bold placeholder:font-normal placeholder:tracking-normal"
                autoFocus
              />
            </div>
            <button 
              type="submit"
              disabled={pinInput.trim().length < 4}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-mono font-bold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" /> INITIALIZE SECURE TUNNEL
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans relative overflow-hidden selection:bg-emerald-500/30">
      <Aurora colorStops={["#7cff67","#B497CF","#5227FF"]} blend={0.5} amplitude={powerSaver ? 0 : 1.0} speed={powerSaver ? 0 : 0.5} />
      
      <div 
        className={`relative z-10 flex flex-col h-screen p-4 md:p-6 lg:p-8 max-w-7xl mx-auto pb-32 transition-all duration-1000 ${isAutoBlurred ? 'blur-xl opacity-50 scale-[0.98]' : ''}`}
      >
        {/* Header */}
        <header style={glassStyle} className="flex flex-col md:flex-row md:items-center justify-between mb-6 bg-white/60 dark:bg-black/40 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-4 shadow-[0_0_20px_rgba(16,185,129,0.05)] dark:shadow-[0_0_20px_rgba(16,185,129,0.1)] shrink-0 gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Activity className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              <div className={`absolute inset-0 bg-emerald-400 blur-md opacity-40 rounded-full ${powerSaver ? '' : 'animate-pulse'}`} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-widest text-emerald-900 dark:text-emerald-50 drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">
                SBJY MED-CARE
              </h1>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 font-mono tracking-widest flex items-center gap-2">
                <Shield className="w-3 h-3" /> ZERO-KNOWLEDGE PROTOCOL
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            {privacyMode && (
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                <Info className="w-3 h-3" />
                <span>Hover over blurred data to reveal</span>
              </div>
            )}
            
            <button
              onClick={() => setPrivacyMode(!privacyMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all font-mono text-xs ${
                privacyMode 
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.1)] dark:shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                  : 'bg-white/40 dark:bg-black/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-700 hover:text-emerald-800 dark:hover:text-emerald-500'
              }`}
              title="Toggle Privacy Blur"
            >
              {privacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="hidden sm:inline">{privacyMode ? 'PRIVACY: ON' : 'PRIVACY: OFF'}</span>
            </button>
            <div className="hidden lg:block text-right font-mono">
              <div className="text-emerald-700 dark:text-emerald-400 text-sm">{time}</div>
              <div className="text-emerald-600 dark:text-emerald-700 text-xs">SYS_STATUS: ONLINE</div>
            </div>
          </div>
        </header>

        {/* Main Area */}
        <div className="flex-1 min-h-0 relative">
          <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: OCR Scanner */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              style={glassStyle}
              className={`h-full min-h-0 rounded-xl overflow-hidden ${activeTab === 'chat' ? 'hidden' : 'block'} ${activeTab === 'scanner' ? 'lg:col-span-2' : ''}`}
            >
              <DocumentScanner privacyMode={privacyMode} onScanComplete={setLatestScan} glassStyle={glassStyle} />
            </motion.div>

            {/* Right Column: AI Chat */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              style={glassStyle}
              className={`h-full min-h-0 flex flex-col gap-4 rounded-xl overflow-hidden ${activeTab === 'scanner' ? 'hidden' : 'block'} ${activeTab === 'chat' ? 'lg:col-span-2' : ''}`}
            >
              <div className="flex-1 min-h-0">
                <ChatAssistant privacyMode={privacyMode} latestScan={latestScan} glassStyle={glassStyle} />
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Footer Status Bar */}
        <footer style={glassStyle} className="mt-6 flex items-center justify-between text-xs font-mono text-emerald-600 dark:text-emerald-700 bg-white/60 dark:bg-black/40 border border-emerald-200 dark:border-emerald-900/50 rounded-lg p-2 px-4 shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Database className="w-3 h-3" /> LOCAL_NODE_ACTIVE</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">ENCRYPTION: AES-256</span>
          </div>
          <div>NODE: 0x7A9F</div>
        </footer>
      </div>
      
      {/* Auto-Blur Overlay */}
      <AnimatePresence>
        {isAutoBlurred && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/20"
            onClick={() => setIsAutoBlurred(false)}
          >
            <div className="bg-black/60 backdrop-blur-xl border border-emerald-500/40 p-6 rounded-2xl flex flex-col items-center shadow-2xl">
              <Lock className="w-12 h-12 text-emerald-400 mb-4" />
              <div className="text-emerald-50 font-mono text-lg font-bold">TERMINAL LOCKED</div>
              <div className="text-emerald-400/80 font-mono text-sm mt-1 mb-6">Inactivity timeout reached for security</div>
              <button 
                onClick={() => setIsAutoBlurred(false)}
                className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-6 py-2 rounded-lg font-bold transition-colors"
              >
                RESUME SESSION
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dock items={dockItems} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
