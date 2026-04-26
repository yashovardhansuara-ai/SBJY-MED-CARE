# Product Requirements Document (PRD) 

## 1. Project Overview
**Product Name:** SBJY MED-CARE (Secure Terminal)
**Type:** Web-based Advanced Medical Assistant & Document Analyzer
**Target Audience:** Patients and users needing quick, secure, and easily understandable insights into their medical prescriptions, health reports, and physical medicine labels.
**Core Philosophy:** Empathy, simplicity, and absolute data security (Zero-Knowledge Protocol).

## 2. Objectives
- **Secure Processing:** Ensure patient data (medical documents, medicine images) remains secure and prevents unauthorized third-party exfiltration.
- **Empathetic AI Support:** Provide an AI interface that acts supportive, friendly, and translates complex medical jargon into short, simple, layperson-friendly terms.
- **Advanced Optical Recognition:** Allow users to upload images of medicine bottles or prescriptions to instantly extract text and identify health risks, medication functions, and consumption rules.
- **Seamless Context Sharing:** Enable the AI chat assistant to automatically know what the user just scanned, ensuring proactive and contextual support.

## 3. Core Features & Requirements

### 3.1. Document & Medicine Scanner (OCR & AI Vision)
- **Local OCR (Tesseract.js):** Pre-process images entirely within the browser to extract raw text without immediately sending image data to remote servers, reducing latency and increasing privacy.
- **Vision AI Analysis:** Uses Gemini 3.1 Pro Vision integration to analyze document types (Prescription, Medicine Label, Medical Report).
- **Data Extraction:**
  - **For Prescriptions:** Extracts Detailed Description, Patient Health Assessment, Risk Level (Low/Medium/High/Critical), and Further Procedures.
  - **For Medicines:** Extracts Medicine Identified, Specific Functions, Side Effects, and Consumption Guidelines.
- **Verified Grounding:** Integrates Google Search grounding to ensure medicine insights and side effects are cross-referenced with verified internet sources (outputs URLs for transparency).

### 3.2. AI Support Core (Chat Assistant)
- **Personality:** Empathetic, highly supportive, and comforting.
- **Simplicity:** Strictly formatted to give short, straightforward, bullet-pointed answers avoiding dense medical jargon.
- **Omnimodal Input:** Accepts both text questions and direct image uploads via a camera UI button.
- **Context Injection:** When a document is scanned in the Scanner tab, the AI is automatically notified via a hidden SYSTEM MESSAGE, prompting it to proactively reach out to the user regarding the newly scanned document.

### 3.3. Security & Privacy (Zero-Knowledge Protocol)
- **Client-Side Storage:** History is maintained explicitly in the browser's `localStorage`. No centralized backend database is used for user sessions.
- **Privacy Mode (Blur Toggle):** A toggleable "Privacy Mode" that blurs sensitive document images and analysis results on the screen to prevent shoulder-surfing. Hovering temporarily unblurs elements. The chat window remains unblurred for readabilty.
- **Security Headers (index.html):**
  - Custom Content Security Policy (CSP) restricting resources strictly to trusted domains (Google APIs, Tesseract).
  - X-Frame-Options (DENY) to prevent clickjacking.
  - X-XSS-Protection & Referrer-Policy strict enforcement.

### 3.4. User Interface & Aesthetics
- **Theme Support:** Fully responsive Dark Mode (terminal-style, deep emeralds/blacks) and Light Mode (clean, modern emerald/white).
- **Interactive 3D Background:** A rotating, distorting "bio-sphere" (React Three Fiber/Drei) that reacts to the theme (brighter green in light mode, deeper emissive `#064e3b` in dark mode).
- **Responsive Layout:** Side-by-side grid on desktop, vertically stacked on mobile.

## 4. Technical Stack
- **Frontend Framework:** React 18, Vite, TypeScript
- **Styling:** Tailwind CSS (Custom scrollbars, dark mode classes)
- **AI & Integrations:** 
  - `@google/genai` (Gemini 3.1 Pro API with Search Grounding)
  - `tesseract.js` (Local browser Optical Character Recognition)
- **3D Graphics:** `@react-three/fiber`, `@react-three/drei`, `three`
- **Icons:** `lucide-react`
- **Animations:** `motion/react` (Framer Motion)

## 5. User Flow
1. User opens the portal and is greeted by the 3D aesthetic and active AI Support Core.
2. User toggles Privacy/Theme settings based on their environment.
3. User uploads a prescription image or medicine bottle photo.
4. Local OCR runs -> AI analyzes the document against internet sources -> Displays structured medical breakdown.
5. AI Chat proactively greets the user mentioning the document they just scanned.
6. User follows up with questions in the chat (e.g., "What does this risk level mean?" or "Can I take this pill with coffee?").
7. User safely clears data or closes the session, resting assured no PII was leaked.

## 6. Future Enhancements (Roadmap)
- WebRTC integration for live video scanning of pill bottles.
- Multi-language support for diverse patient demographics.
- Export to PDF feature for analyzed reports.
- Optional secure OAuth login for multi-device sync (if explicitly requested by users).
