import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, Shield, Database, Eye, EyeOff, Moon, Sun, Info } from 'lucide-react';
import Background3D from './Background3D';
import ChatAssistant from './ChatAssistant';
import DocumentScanner from './DocumentScanner';

export default function Dashboard() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [privacyMode, setPrivacyMode] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [latestScan, setLatestScan] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen font-sans relative overflow-hidden selection:bg-emerald-500/30">
      <Background3D theme={theme} />
      
      <div className="relative z-10 flex flex-col h-screen p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-6 bg-white/60 dark:bg-black/40 backdrop-blur-md border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-4 shadow-[0_0_20px_rgba(16,185,129,0.05)] dark:shadow-[0_0_20px_rgba(16,185,129,0.1)] shrink-0 gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Activity className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              <div className="absolute inset-0 bg-emerald-400 blur-md opacity-40 rounded-full animate-pulse" />
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
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-emerald-200 dark:border-emerald-800/50 bg-white/50 dark:bg-black/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

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

        {/* Main Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          {/* Left Column: OCR Scanner */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="h-full min-h-0"
          >
            <DocumentScanner privacyMode={privacyMode} onScanComplete={setLatestScan} />
          </motion.div>

          {/* Right Column: AI Chat */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="h-full min-h-0 flex flex-col gap-4"
          >
            <div className="flex-1 min-h-0">
              <ChatAssistant privacyMode={privacyMode} latestScan={latestScan} />
            </div>
          </motion.div>
        </div>
        
        {/* Footer Status Bar */}
        <footer className="mt-6 flex items-center justify-between text-xs font-mono text-emerald-600 dark:text-emerald-700 bg-white/60 dark:bg-black/40 backdrop-blur-md border border-emerald-200 dark:border-emerald-900/50 rounded-lg p-2 px-4 shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Database className="w-3 h-3" /> LOCAL_NODE_ACTIVE</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">ENCRYPTION: AES-256</span>
          </div>
          <div>NODE: 0x7A9F</div>
        </footer>
      </div>
    </div>
  );
}
