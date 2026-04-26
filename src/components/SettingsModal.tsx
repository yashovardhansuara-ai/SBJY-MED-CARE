import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../contexts/SettingsContext';
import { X, Moon, Sun, Monitor, BatteryMedium, Droplets, Eraser, ShieldAlert, Ghost, Brain, Zap, SlidersHorizontal, CheckCircle2, ChevronRight } from 'lucide-react';

type Tab = 'appearance' | 'privacy' | 'audit' | 'ai';

export default function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('appearance');
  const [isWiping, setIsWiping] = useState(false);
  const [wipedToast, setWipedToast] = useState(false);

  const {
    theme, setTheme,
    powerSaver, setPowerSaver,
    blurIntensity, setBlurIntensity,
    autoBlur, setAutoBlur,
    ghostMode, setGhostMode,
    comprehensionLevel, setComprehensionLevel,
    proactiveAI, setProactiveAI,
    clearTerminalData
  } = useSettings();

  const handleWipeData = async () => {
    setIsWiping(true);
    // Fake a 1.5s wiping sequence for the effect
    await new Promise(resolve => setTimeout(resolve, 1500));
    clearTerminalData();
    setIsWiping(false);
    setWipedToast(true);
    setTimeout(() => setWipedToast(false), 3000);
  };

  const tabVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`relative w-full max-w-2xl bg-white/10 dark:bg-black/40 backdrop-blur-[24px] border border-emerald-200/50 dark:border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh] md:h-auto max-h-[600px]`}
          >
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 bg-emerald-50/50 dark:bg-black/60 border-b md:border-b-0 md:border-r border-emerald-200/50 dark:border-white/10 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible shrink-0">
              <div className="flex items-center justify-between mb-2 md:mb-6 px-2">
                <h2 className="text-emerald-950 dark:text-white font-mono font-bold tracking-wider hidden md:block">SYS_PREFS</h2>
                <button onClick={onClose} className="md:hidden p-1 text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-emerald-50">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {[
                { id: 'appearance', label: 'Appearance', icon: <SlidersHorizontal className="w-4 h-4" /> },
                { id: 'privacy', label: 'Privacy Overview', icon: <ShieldAlert className="w-4 h-4" /> },
                { id: 'audit', label: 'Security Audit', icon: <Droplets className="w-4 h-4" /> },
                { id: 'ai', label: 'AI Parameters', icon: <Brain className="w-4 h-4" /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                      : 'text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200/30 dark:hover:bg-white/5'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto hidden md:block opacity-50" />}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto font-sans relative">
              <button onClick={onClose} className="absolute right-4 top-4 hidden md:flex p-1.5 text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white bg-white/20 dark:bg-white/10 rounded-full transition-colors backdrop-blur-md">
                <X className="w-4 h-4" />
              </button>

              <AnimatePresence mode="wait">
                {activeTab === 'appearance' && (
                  <motion.div key="appearance" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                    <div>
                      <h3 className="text-emerald-950 dark:text-white font-semibold mb-4 flex items-center gap-2">Theme Integration</h3>
                      <div className="grid grid-cols-3 gap-3 p-1 bg-white/40 dark:bg-black/30 rounded-lg border border-emerald-200/50 dark:border-white/10">
                        {[
                          { id: 'light', icon: <Sun className="w-4 h-4" /> },
                          { id: 'dark', icon: <Moon className="w-4 h-4" /> },
                          { id: 'system', icon: <Monitor className="w-4 h-4" /> }
                        ].map(t => (
                          <button
                            key={t.id}
                            onClick={() => setTheme(t.id as Theme)}
                            className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                              theme === t.id ? 'bg-white dark:bg-emerald-600 text-emerald-950 dark:text-white shadow-sm' : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-white'
                            }`}
                          >
                            {t.icon}
                            <span className="capitalize hidden sm:inline">{t.id}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-emerald-950 dark:text-white font-semibold flex items-center gap-2">Visual Performance</h3>
                      
                      <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-black/30 rounded-xl border border-emerald-200/50 dark:border-white/10">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${powerSaver ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                            <BatteryMedium className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-emerald-950 dark:text-white font-medium text-sm">Power Saver Mode</div>
                            <div className="text-emerald-700 dark:text-emerald-400/70 text-xs">Halts Aurora background animation</div>
                          </div>
                        </div>
                        <button
                          onClick={() => setPowerSaver(!powerSaver)}
                          className={`w-12 h-6 rounded-full transition-colors relative border ${
                            powerSaver ? 'bg-amber-500 border-amber-400' : 'bg-white/20 dark:bg-black/50 border-emerald-300 dark:border-white/20'
                          }`}
                        >
                          <motion.div
                            animate={{ x: powerSaver ? 24 : 2 }}
                            className={`w-5 h-5 rounded-full absolute top-0 bottom-0 my-auto ${powerSaver ? 'bg-white' : 'bg-emerald-500 dark:bg-emerald-400'}`}
                          />
                        </button>
                      </div>

                      <div className="p-4 bg-white/40 dark:bg-black/30 rounded-xl border border-emerald-200/50 dark:border-white/10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <Droplets className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-emerald-950 dark:text-white font-medium text-sm">Glassmorphism Intensity</div>
                            <div className="text-emerald-700 dark:text-emerald-400/70 text-xs">Adjust UI backdrop blur</div>
                          </div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="24"
                          step="2"
                          value={blurIntensity}
                          onChange={(e) => setBlurIntensity(Number(e.target.value))}
                          className="w-full h-2 bg-emerald-200 dark:bg-emerald-900/50 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'privacy' && (
                  <motion.div key="privacy" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-black/30 rounded-xl border border-emerald-200/50 dark:border-white/10">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${autoBlur ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-emerald-950 dark:text-white font-medium text-sm">Auto-Blur (Privacy Mode)</div>
                          <div className="text-emerald-700 dark:text-emerald-400/70 text-xs">Blurs screen after 30s of inactivity</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setAutoBlur(!autoBlur)}
                        className={`w-12 h-6 rounded-full transition-colors relative border ${
                          autoBlur ? 'bg-indigo-500 border-indigo-400' : 'bg-white/20 dark:bg-black/50 border-emerald-300 dark:border-white/20'
                        }`}
                      >
                        <motion.div animate={{ x: autoBlur ? 24 : 2 }} className={`w-5 h-5 rounded-full absolute top-0 bottom-0 my-auto ${autoBlur ? 'bg-white' : 'bg-emerald-500 dark:bg-emerald-400'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-black/30 rounded-xl border border-emerald-200/50 dark:border-white/10">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${ghostMode ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                          <Ghost className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-emerald-950 dark:text-white font-medium text-sm">Ghost Mode</div>
                          <div className="text-emerald-700 dark:text-emerald-400/70 text-xs">Session history will not be saved</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setGhostMode(!ghostMode)}
                        className={`w-12 h-6 rounded-full transition-colors relative border ${
                          ghostMode ? 'bg-purple-500 border-purple-400' : 'bg-white/20 dark:bg-black/50 border-emerald-300 dark:border-white/20'
                        }`}
                      >
                        <motion.div animate={{ x: ghostMode ? 24 : 2 }} className={`w-5 h-5 rounded-full absolute top-0 bottom-0 my-auto ${ghostMode ? 'bg-white' : 'bg-emerald-500 dark:bg-emerald-400'}`} />
                      </button>
                    </div>

                    <div className="p-4 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50 relative overflow-hidden">
                      <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="p-2 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                          <Eraser className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-red-900 dark:text-red-100 font-medium text-sm">Destructive Actions</div>
                          <div className="text-red-700 dark:text-red-400/70 text-xs">Permanently wipe all local terminal data</div>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleWipeData}
                        disabled={isWiping || wipedToast}
                        className="relative z-10 w-full py-3 rounded-lg font-mono font-bold text-sm transition-all border disabled:opacity-80
                                 bg-red-500 hover:bg-red-600 text-white border-red-400 dark:border-red-600 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                      >
                        {isWiping ? (
                          <div className="flex items-center justify-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            >
                              <Brain className="w-4 h-4" />
                            </motion.div>
                            ERASING MEMORY...
                          </div>
                        ) : wipedToast ? (
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> DATA WIPED
                          </div>
                        ) : (
                          "CLEAR LOCAL TERMINAL DATA"
                        )}
                      </button>

                      {isWiping && (
                        <motion.div
                          initial={{ left: '-100%' }}
                          animate={{ left: '100%' }}
                          transition={{ duration: 1.5, ease: "linear" }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent skew-x-12 z-0"
                        />
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'audit' && (
                  <motion.div key="audit" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                    <div>
                      <h3 className="text-emerald-950 dark:text-white font-semibold mb-4 flex items-center gap-2">Protocol Status</h3>
                      <div className="space-y-3 font-mono text-sm">
                        
                        <div className="flex items-center justify-between p-3 bg-white/40 dark:bg-black/30 rounded-lg border border-emerald-500/30">
                          <div className="flex items-center gap-2 text-emerald-950 dark:text-emerald-100">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> AES-256 Encryption
                          </div>
                          <div className="text-emerald-600 dark:text-emerald-400 font-bold">ACTIVE</div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white/40 dark:bg-black/30 rounded-lg border border-emerald-500/30">
                          <div className="flex items-center gap-2 text-emerald-950 dark:text-emerald-100">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> CSP Headers
                          </div>
                          <div className="text-emerald-600 dark:text-emerald-400 font-bold">STRICT</div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white/40 dark:bg-black/30 rounded-lg border border-emerald-500/30">
                          <div className="flex items-center gap-2 text-emerald-950 dark:text-emerald-100">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Zero-Knowledge Proxy
                          </div>
                          <div className="text-emerald-600 dark:text-emerald-400 font-bold">VERIFIED</div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white/40 dark:bg-black/30 rounded-lg border border-emerald-500/30">
                          <div className="flex items-center gap-2 text-emerald-950 dark:text-emerald-100">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Local OCR Sandbox
                          </div>
                          <div className="text-emerald-600 dark:text-emerald-400 font-bold">ISOLATED</div>
                        </div>

                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'ai' && (
                  <motion.div key="ai" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-emerald-950 dark:text-white font-semibold flex items-center gap-2">Assistant Tone</h3>
                      <div className="grid grid-cols-2 gap-3 p-1 bg-white/40 dark:bg-black/30 rounded-lg border border-emerald-200/50 dark:border-white/10">
                        <button
                          onClick={() => setComprehensionLevel('layperson')}
                          className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-md transition-colors ${
                            comprehensionLevel === 'layperson' ? 'bg-white dark:bg-emerald-600 text-emerald-950 dark:text-white shadow-sm' : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-white'
                          }`}
                        >
                          <span className="font-medium text-sm">Layperson</span>
                          <span className="text-[10px] opacity-70 text-center">Simple terms & analogies</span>
                        </button>
                        <button
                          onClick={() => setComprehensionLevel('clinical')}
                          className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-md transition-colors ${
                            comprehensionLevel === 'clinical' ? 'bg-white dark:bg-emerald-600 text-emerald-950 dark:text-white shadow-sm' : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-white'
                          }`}
                        >
                          <span className="font-medium text-sm">Clinical</span>
                          <span className="text-[10px] opacity-70 text-center">Raw medical data</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-black/30 rounded-xl border border-emerald-200/50 dark:border-white/10">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${proactiveAI ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-stone-100 text-stone-600 dark:bg-stone-900/30 dark:text-stone-400'}`}>
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-emerald-950 dark:text-white font-medium text-sm">Proactive AI</div>
                          <div className="text-emerald-700 dark:text-emerald-400/70 text-xs">Auto-start conversation on scan</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setProactiveAI(!proactiveAI)}
                        className={`w-12 h-6 rounded-full transition-colors relative border ${
                          proactiveAI ? 'bg-emerald-500 border-emerald-400' : 'bg-white/20 dark:bg-black/50 border-emerald-300 dark:border-white/20'
                        }`}
                      >
                        <motion.div animate={{ x: proactiveAI ? 24 : 2 }} className={`w-5 h-5 rounded-full absolute top-0 bottom-0 my-auto ${proactiveAI ? 'bg-white' : 'bg-emerald-500 dark:bg-emerald-400'}`} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
