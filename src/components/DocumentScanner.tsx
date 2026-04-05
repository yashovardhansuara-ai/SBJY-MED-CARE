import { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { motion } from 'motion/react';
import { Scan, Upload, CheckCircle, Loader2 } from 'lucide-react';

export default function DocumentScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setIsScanning(true);
    setResult('');

    try {
      const worker = await Tesseract.createWorker('eng');
      worker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
      });
      
      const ret = await worker.recognize(file);
      setResult(ret.data.text);
      await worker.terminate();
    } catch (error) {
      console.error(error);
      setResult('Error: OCR processing failed.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-md border border-emerald-500/30 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.15)]">
      <div className="p-4 border-b border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scan className="w-5 h-5 text-emerald-400" />
          <h2 className="text-emerald-400 font-mono font-semibold tracking-wider">OCR_SCANNER</h2>
        </div>
        <span className="text-xs font-mono text-emerald-600 border border-emerald-800 px-2 py-1 rounded bg-black/50">AES-256 ACTIVE</span>
      </div>
      
      <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
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
          {imagePreview ? (
            <div className="absolute inset-0 opacity-20">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          ) : null}
          
          <Upload className="w-10 h-10 text-emerald-500 mb-4 group-hover:scale-110 transition-transform relative z-10" />
          <p className="text-emerald-300 font-mono text-sm text-center relative z-10">
            Click to upload medical document<br/>
            <span className="text-emerald-600 text-xs mt-2 block">Supported: JPG, PNG, WEBP</span>
          </p>
        </div>

        {isScanning && (
          <div className="space-y-2 shrink-0">
            <div className="flex items-center justify-between text-emerald-400 font-mono text-xs">
              <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Analyzing Document...</span>
            </div>
            <div className="h-1 bg-black rounded-full overflow-hidden border border-emerald-900">
              <motion.div 
                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
              />
            </div>
          </div>
        )}

        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="flex items-center gap-2 mb-2 text-emerald-400 font-mono text-sm shrink-0">
              <CheckCircle className="w-4 h-4" /> Extracted Data
            </div>
            <div className="flex-1 bg-black/60 border border-emerald-500/30 rounded-lg p-4 font-mono text-sm text-emerald-100 overflow-y-auto whitespace-pre-wrap shadow-inner">
              {result}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
