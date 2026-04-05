import fs from 'fs';

function fixFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix backgrounds
  content = content.replace(/bg-white\/60 dark:bg-white dark:bg-black\/40/g, 'bg-white/60 dark:bg-black/40');
  content = content.replace(/bg-white\/80 dark:bg-white dark:bg-black\/60/g, 'bg-white/80 dark:bg-black/60');
  content = content.replace(/bg-white\/70 dark:bg-white dark:bg-black\/50/g, 'bg-white/70 dark:bg-black/50');
  content = content.replace(/bg-white\/70 dark:bg-white dark:bg-black/g, 'bg-white/70 dark:bg-black');
  
  // Fix borders
  content = content.replace(/border-emerald-200 dark:border-emerald-300 dark:border-emerald-900\/50/g, 'border-emerald-200 dark:border-emerald-900/50');
  content = content.replace(/border-emerald-300 dark:border-emerald-300 dark:border-emerald-800/g, 'border-emerald-300 dark:border-emerald-800');
  
  // Fix text colors
  content = content.replace(/text-emerald-950 dark:text-emerald-500 dark:text-emerald-700 dark:text-emerald-400/g, 'text-emerald-700 dark:text-emerald-400');
  content = content.replace(/text-emerald-950 dark:text-emerald-500 dark:text-emerald-600 dark:text-emerald-950 dark:text-emerald-500/g, 'text-emerald-600 dark:text-emerald-500');
  content = content.replace(/text-emerald-950 dark:text-emerald-500 dark:text-emerald-600/g, 'text-emerald-600 dark:text-emerald-500');
  content = content.replace(/text-emerald-950 dark:text-emerald-500 dark:text-emerald-700/g, 'text-emerald-700 dark:text-emerald-500');
  content = content.replace(/text-emerald-900\/80 dark:text-emerald-900 dark:text-emerald-100\/80/g, 'text-emerald-900/80 dark:text-emerald-100/80');
  content = content.replace(/text-emerald-900 dark:text-emerald-100/g, 'text-emerald-900 dark:text-emerald-100');
  
  fs.writeFileSync(filePath, content, 'utf8');
}

fixFile('src/components/DocumentScanner.tsx');
fixFile('src/components/ChatAssistant.tsx');
