/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import Dashboard from './components/Dashboard';
import { Shield, Lock, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_50%)]" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/60 backdrop-blur-xl border border-emerald-500/30 p-8 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.15)] max-w-md w-full relative z-10 text-center"
        >
          <div className="w-16 h-16 bg-emerald-950/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-50 tracking-widest mb-2">SBJY MED-CARE</h1>
          <p className="text-emerald-600 font-mono text-xs mb-8 flex items-center justify-center gap-2">
            <Lock className="w-3 h-3" /> SECURE TERMINAL ACCESS
          </p>
          
          <button
            onClick={handleLogin}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] flex items-center justify-center gap-2"
          >
            Authenticate via Google
          </button>
        </motion.div>
      </div>
    );
  }

  return <Dashboard />;
}
