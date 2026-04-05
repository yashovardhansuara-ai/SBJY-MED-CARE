import { useState, useRef, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import { motion } from 'motion/react';
import { Scan, Upload, CheckCircle, Loader2, Calendar, ShieldAlert, Activity, Trash2, Cpu, History, ChevronLeft } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface AnalysisData {
  riskLevel: string;
  checkUpTimes: string[];
  protocols: string[];
  summary: string;
}

interface PrescriptionRecord {
  id: string;
  date: string;
  summary: string;
  riskLevel: string;
  checkUpTimes: string[];
  protocols: string[];
  rawText: string;
}

interface DocumentScannerProps {
  privacyMode?: boolean;
}

export default function DocumentScanner({ privacyMode = false }: DocumentScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState('');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [history, setHistory] = useState<PrescriptionRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('medcare_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setIsScanning(true);
    setResult('');
    setAnalysisData(null);

    try {
      const worker = await Tesseract.createWorker('eng');
      worker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
      });
      
      const ret = await worker.recognize(file);
      const extractedText = ret.data.text;
      setResult(extractedText);
      await worker.terminate();
      
      setIsScanning(false);
      
      if (extractedText.trim().length > 10) {
        setIsAnalyzing(true);
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-preview',
            contents: `Analyze this medical document/prescription text and extract key information. 
            Text: ${extractedText}`,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  riskLevel: { type: Type.STRING, description: "Low, Medium, High, or Critical based on the severity of the medications or conditions." },
                  checkUpTimes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suggested follow-up or check-up times." },
                  protocols: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Recommended protocols, actions, or dosage instructions." },
                  summary: { type: Type.STRING, description: "A brief 1-2 sentence summary of the document." }
                }
              }
            }
          });
          
          if (response.text) {
            const data = JSON.parse(response.text);
            setAnalysisData(data);
            
            // Save to history
            const newRecord: PrescriptionRecord = {
              id: Date.now().toString(),
              date: new Date().toLocaleString(),
              summary: data.summary || 'Medical Document',
              riskLevel: data.riskLevel,
              checkUpTimes: data.checkUpTimes,
              protocols: data.protocols,
              rawText: extractedText
            };
            const updatedHistory = [newRecord, ...history];
            setHistory(updatedHistory);
            localStorage.setItem('medcare_history', JSON.stringify(updatedHistory));
          }
        } catch (aiError) {
          console.error("AI Analysis failed:", aiError);
        } finally {
          setIsAnalyzing(false);
        }
      }

    } catch (error) {
      console.error(error);
      setResult('Error: OCR processing failed.');
      setIsScanning(false);
    }
  };

  const handleClear = () => {
    setResult('');
    setAnalysisData(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const loadHistoryItem = (record: PrescriptionRecord) => {
    setResult(record.rawText);
    setAnalysisData({
      riskLevel: record.riskLevel,
      checkUpTimes: record.checkUpTimes,
      protocols: record.protocols,
      summary: record.summary
    });
    setImagePreview(null); // Clear image preview as we don't store base64 in localstorage to save space
    setShowHistory(false);
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('medcare_history', JSON.stringify(updated));
  };

  const getRiskColor = (risk?: string) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'text-emerald-400 border-emerald-500/50 bg-emerald-900/20 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
      case 'medium': return 'text-yellow-400 border-yellow-500/50 bg-yellow-900/20 shadow-[0_0_10px_rgba(234,179,8,0.3)]';
      case 'high': return 'text-orange-400 border-orange-500/50 bg-orange-900/20 shadow-[0_0_10px_rgba(249,115,22,0.3)]';
      case 'critical': return 'text-red-400 border-red-500/50 bg-red-900/20 shadow-[0_0_10px_rgba(239,68,68,0.3)]';
      default: return 'text-emerald-400 border-emerald-500/50 bg-emerald-900/20';
    }
  };

  if (showHistory) {
    return (
      <div className="flex flex-col h-full bg-black/40 backdrop-blur-md border border-emerald-500/30 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.15)]">
        <div className="p-4 border-b border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHistory(false)} className="text-emerald-400 hover:text-emerald-300 transition-colors p-1">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-emerald-400 font-mono font-semibold tracking-wider">LOCAL_HISTORY</h2>
          </div>
          <span className="text-xs font-mono text-emerald-600 border border-emerald-800 px-2 py-1 rounded bg-black/50">ENCRYPTED_STORE</span>
        </div>
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {history.length === 0 ? (
            <div className="text-emerald-700 font-mono text-sm text-center mt-10">No records found in local storage.</div>
          ) : (
            history.map(record => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={record.id} 
                onClick={() => loadHistoryItem(record)}
                className={`p-4 rounded-lg border border-emerald-500/30 bg-black/60 cursor-pointer hover:bg-emerald-900/20 transition-all group ${privacyMode ? 'blur-sm hover:blur-none' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="text-emerald-400 font-mono text-xs">{record.date}</div>
                  <button 
                    onClick={(e) => deleteHistoryItem(e, record.id)} 
                    className="text-emerald-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-emerald-100 font-mono text-sm mb-3 line-clamp-2">{record.summary}</div>
                <div className={`inline-block px-2 py-1 rounded border font-mono text-[10px] font-bold uppercase ${getRiskColor(record.riskLevel)}`}>
                  {record.riskLevel} RISK
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-md border border-emerald-500/30 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.15)]">
      <div className="p-4 border-b border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Scan className="w-5 h-5 text-emerald-400" />
          <h2 className="text-emerald-400 font-mono font-semibold tracking-wider hidden sm:block">OCR_SCANNER</h2>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-1 text-xs font-mono text-emerald-500 hover:text-emerald-300 transition-colors border border-emerald-800 hover:border-emerald-500 px-2 py-1 rounded bg-black/50"
          >
            <History className="w-3 h-3" /> <span className="hidden sm:inline">HISTORY</span>
          </button>
          <span className="hidden md:flex items-center gap-1 text-xs font-mono text-emerald-600 border border-emerald-800 px-2 py-1 rounded bg-black/50" title="Optical Character Recognition runs entirely in your browser">
            <Cpu className="w-3 h-3" /> LOCAL OCR
          </span>
          {(result || imagePreview || analysisData) && (
            <button 
              onClick={handleClear}
              className="text-emerald-700 hover:text-red-400 transition-colors p-1"
              title="Clear Document Data"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
        {!imagePreview && !analysisData && !result && !isScanning && !isAnalyzing && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-emerald-500/40 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-900/20 transition-colors group relative overflow-hidden shrink-0"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <Upload className="w-10 h-10 text-emerald-500 mb-4 group-hover:scale-110 transition-transform relative z-10" />
            <p className="text-emerald-300 font-mono text-sm text-center relative z-10">
              Click to upload medical document<br/>
              <span className="text-emerald-600 text-xs mt-2 block">Supported: JPG, PNG, WEBP</span>
            </p>
          </div>
        )}

        {imagePreview && (
          <div className="relative h-32 rounded-xl overflow-hidden border border-emerald-500/30 shrink-0 group">
            <img src={imagePreview} alt="Preview" className={`w-full h-full object-cover transition-all duration-300 ${privacyMode ? 'blur-md group-hover:blur-none' : ''}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
              <span className="text-emerald-400 font-mono text-xs">DOCUMENT_LOADED</span>
            </div>
          </div>
        )}

        {(isScanning || isAnalyzing) && (
          <div className="space-y-2 shrink-0">
            <div className="flex items-center justify-between text-emerald-400 font-mono text-xs">
              <span className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" /> 
                {isScanning ? 'Extracting Text (Local OCR)...' : 'AI Analyzing Medical Data...'}
              </span>
            </div>
            <div className="h-1 bg-black rounded-full overflow-hidden border border-emerald-900">
              <motion.div 
                className={`h-full shadow-[0_0_10px_rgba(16,185,129,0.8)] ${isScanning ? 'bg-emerald-500' : 'bg-emerald-300'}`}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: isScanning ? 2 : 3, ease: "easeInOut", repeat: Infinity }}
              />
            </div>
          </div>
        )}

        <div className={`transition-all duration-300 flex flex-col gap-6 flex-1 ${privacyMode && (analysisData || result) ? 'blur-md hover:blur-none' : ''}`}>
          {analysisData && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4 shrink-0"
            >
              {/* Risk Indicator */}
              <div className="flex items-center justify-between bg-black/60 border border-emerald-500/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm">
                  <Activity className="w-4 h-4" /> Risk Assessment
                </div>
                <div className={`px-3 py-1 rounded-md border font-mono text-xs font-bold tracking-wider uppercase ${getRiskColor(analysisData.riskLevel)}`}>
                  {analysisData.riskLevel} RISK
                </div>
              </div>

              {/* Check-up Times */}
              <div className="bg-black/60 border border-emerald-500/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm mb-3">
                  <Calendar className="w-4 h-4" /> Recommended Check-ups
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysisData.checkUpTimes.length > 0 ? analysisData.checkUpTimes.map((time, idx) => (
                    <span key={idx} className="bg-emerald-900/40 border border-emerald-500/40 text-emerald-200 text-xs font-mono px-2 py-1 rounded">
                      {time}
                    </span>
                  )) : <span className="text-emerald-700 text-xs font-mono">No specific check-ups identified.</span>}
                </div>
              </div>

              {/* Protocols */}
              <div className="bg-black/60 border border-emerald-500/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm mb-3">
                  <ShieldAlert className="w-4 h-4" /> Required Protocols
                </div>
                <ul className="space-y-2">
                  {analysisData.protocols.length > 0 ? analysisData.protocols.map((protocol, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-emerald-100 text-sm font-mono">
                      <span className="text-emerald-500 mt-0.5">▸</span>
                      <span>{protocol}</span>
                    </li>
                  )) : <li className="text-emerald-700 text-xs font-mono">No specific protocols identified.</li>}
                </ul>
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="flex items-center gap-2 mb-2 text-emerald-600 font-mono text-xs shrink-0">
                <CheckCircle className="w-3 h-3" /> Raw Extracted Text
              </div>
              <div className="flex-1 bg-black/40 border border-emerald-900/50 rounded-lg p-3 font-mono text-xs text-emerald-700 overflow-y-auto whitespace-pre-wrap shadow-inner">
                {result}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
