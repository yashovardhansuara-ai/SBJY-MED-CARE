import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, Shield, Database, LogOut } from 'lucide-react';
import Background3D from './Background3D';
import ChatAssistant from './ChatAssistant';
import DocumentScanner from './DocumentScanner';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export default function Dashboard() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-emerald-50 font-sans relative overflow-hidden selection:bg-emerald-500/30">
      <Background3D />
      
      <div className="relative z-10 flex flex-col h-screen p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6 bg-black/40 backdrop-blur-md border border-emerald-500/30 rounded-xl p-4 shadow-[0_0_20px_rgba(16,185,129,0.1)] shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Activity className="w-8 h-8 text-emerald-400" />
              <div className="absolute inset-0 bg-emerald-400 blur-md opacity-40 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-widest text-emerald-50 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">
                SBJY MED-CARE
              </h1>
              <p className="text-xs text-emerald-500 font-mono tracking-widest flex items-center gap-2">
                <Shield className="w-3 h-3" /> ZERO-KNOWLEDGE PROTOCOL
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:block text-right font-mono">
              <div className="text-emerald-400 text-sm">{time}</div>
              <div className="text-emerald-700 text-xs">SYS_STATUS: ONLINE</div>
            </div>
            <button 
              onClick={() => signOut(auth)}
              className="p-2 hover:bg-emerald-900/30 rounded-lg text-emerald-500 hover:text-emerald-400 transition-colors border border-transparent hover:border-emerald-500/30"
              title="Secure Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
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
            <DocumentScanner />
          </motion.div>

          {/* Right Column: AI Chat */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="h-full min-h-0"
          >
            <ChatAssistant />
          </motion.div>
        </div>
        
        {/* Footer Status Bar */}
        <footer className="mt-6 flex items-center justify-between text-xs font-mono text-emerald-700 bg-black/40 backdrop-blur-md border border-emerald-900/50 rounded-lg p-2 px-4 shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Database className="w-3 h-3" /> FIREBASE_LINKED</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">ENCRYPTION: AES-256</span>
          </div>
          <div>NODE: 0x7A9F</div>
        </footer>
      </div>
    </div>
  );
}
