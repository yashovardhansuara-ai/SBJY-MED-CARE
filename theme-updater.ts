import fs from 'fs';

const replacements = [
  { regex: /bg-black\/40/g, replacement: 'bg-white/60 dark:bg-black/40' },
  { regex: /bg-black\/60/g, replacement: 'bg-white/80 dark:bg-black/60' },
  { regex: /bg-black\/50/g, replacement: 'bg-white/70 dark:bg-black/50' },
  { regex: /bg-black/g, replacement: 'bg-white dark:bg-black' },
  { regex: /bg-emerald-950\/20/g, replacement: 'bg-emerald-100/50 dark:bg-emerald-950/20' },
  { regex: /bg-emerald-900\/20/g, replacement: 'bg-emerald-100/50 dark:bg-emerald-900/20' },
  { regex: /bg-emerald-900\/30/g, replacement: 'bg-emerald-200/50 dark:bg-emerald-900/30' },
  { regex: /border-emerald-500\/30/g, replacement: 'border-emerald-200 dark:border-emerald-500/30' },
  { regex: /border-emerald-500\/40/g, replacement: 'border-emerald-300 dark:border-emerald-500/40' },
  { regex: /border-emerald-800/g, replacement: 'border-emerald-300 dark:border-emerald-800' },
  { regex: /border-emerald-900\/50/g, replacement: 'border-emerald-200 dark:border-emerald-900/50' },
  { regex: /border-emerald-900/g, replacement: 'border-emerald-300 dark:border-emerald-900' },
  { regex: /border-emerald-700/g, replacement: 'border-emerald-400 dark:border-emerald-700' },
  { regex: /text-emerald-400/g, replacement: 'text-emerald-700 dark:text-emerald-400' },
  { regex: /text-emerald-300/g, replacement: 'text-emerald-800 dark:text-emerald-300' },
  { regex: /text-emerald-500/g, replacement: 'text-emerald-600 dark:text-emerald-500' },
  { regex: /text-emerald-600/g, replacement: 'text-emerald-500 dark:text-emerald-600' },
  { regex: /text-emerald-700/g, replacement: 'text-emerald-500 dark:text-emerald-700' },
  { regex: /text-emerald-100\/80/g, replacement: 'text-emerald-900/80 dark:text-emerald-100/80' },
  { regex: /text-emerald-100/g, replacement: 'text-emerald-900 dark:text-emerald-100' },
  { regex: /text-emerald-200/g, replacement: 'text-emerald-800 dark:text-emerald-200' },
  { regex: /text-emerald-50/g, replacement: 'text-emerald-950 dark:text-emerald-50' },
  { regex: /hover:bg-emerald-900\/20/g, replacement: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/20' },
  { regex: /hover:text-emerald-300/g, replacement: 'hover:text-emerald-900 dark:hover:text-emerald-300' },
  { regex: /hover:border-emerald-500/g, replacement: 'hover:border-emerald-400 dark:hover:border-emerald-500' },
  { regex: /shadow-\[0_0_15px_rgba\(16,185,129,0\.15\)\]/g, replacement: 'shadow-[0_0_15px_rgba(16,185,129,0.05)] dark:shadow-[0_0_15px_rgba(16,185,129,0.15)]' },
];

function processFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');
  replacements.forEach(({ regex, replacement }) => {
    content = content.replace(regex, replacement);
  });
  
  // Fix double replacements
  content = content.replace(/bg-white dark:bg-white dark:bg-black\/40/g, 'bg-white/60 dark:bg-black/40');
  content = content.replace(/bg-white dark:bg-white dark:bg-black\/60/g, 'bg-white/80 dark:bg-black/60');
  content = content.replace(/bg-white dark:bg-white dark:bg-black\/50/g, 'bg-white/70 dark:bg-black/50');
  content = content.replace(/bg-white dark:bg-white dark:bg-black/g, 'bg-white dark:bg-black');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Processed ${filePath}`);
}

processFile('src/components/DocumentScanner.tsx');
processFile('src/components/ChatAssistant.tsx');
