import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SecureChatContextProps {
  sendMessage: (model: string, config: any, messages: any[]) => Promise<{ text?: string, error?: string }>;
  generateContent: (model: string, contents: any, config: any) => Promise<{ text?: string, error?: string }>;
}

const SecureChatContext = createContext<SecureChatContextProps | undefined>(undefined);

export function SecureChatProvider({ children }: { children: ReactNode }) {
  const sendMessage = async (model: string, config: any, messages: any[]) => {
    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, config, messages })
      });
      if (!response.ok) {
        const errText = await response.text();
        return { error: `Server Error ${response.status}: ${errText.slice(0, 100)}` };
      }
      const data = await response.json();
      return { text: data.text };
    } catch (e: any) {
      return { error: e.message };
    }
  };

  const generateContent = async (model: string, contents: any, config: any) => {
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, contents, config })
      });
      if (!response.ok) {
        const errText = await response.text();
        return { error: `Server Error ${response.status}: ${errText.slice(0, 100)}` };
      }
      const data = await response.json();
      return { text: data.text };
    } catch (e: any) {
      return { error: e.message };
    }
  };

  return (
    <SecureChatContext.Provider value={{ sendMessage, generateContent }}>
      {children}
    </SecureChatContext.Provider>
  );
}

export function useSecureChat() {
  const context = useContext(SecureChatContext);
  if (!context) throw new Error("useSecureChat must be used within a SecureChatProvider");
  return context;
}
