import {
  GrammarAnalysis,
  TranslationData,
  OcrDiaryResult,
  SummaryData,
  QuoteItem,
  BookProject,
  MultiAgentCouncilResult,
  AIEngineType,
} from '../types/manuscript';

/**
 * Resilient fetch wrapper with client-side retry for transient errors (e.g. 503 Overloaded)
 */
async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  let lastError: any = null;

  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.status === 503 && i < retries) {
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
        continue;
      }
      return res;
    } catch (err: any) {
      lastError = err;
      if (i < retries) {
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
        continue;
      }
    }
  }

  throw lastError || new Error('Network request failed. Please check your connection.');
}

function parseErrorMessage(errData: any, status: number): string {
  if (errData && errData.error) {
    if (typeof errData.error === 'string') {
      if (errData.error.includes('503') || errData.error.toLowerCase().includes('overloaded')) {
        return 'AI सर्वर पर वर्तमान में भारी लोड है (503 Service Overloaded)। कृपया कुछ क्षण रुककर "पुनः प्रयास करें" दबाएं या तेज़ Gemini Turbo मोड चुनें।';
      }
      return errData.error;
    }
    if (errData.error.message) {
      return errData.error.message;
    }
  }
  if (status === 503) {
    return 'Google AI मॉडल अस्थायी रूप से व्यस्त है (503 Overloaded)। सिस्टम ने वैकल्पिक इंजन से प्रयास किया है, कृपया "पुनः प्रयास करें" दबाएं।';
  }
  return `अनुरोध असफल रहा (${status})`;
}

export async function checkGrammarAndSpelling(
  text: string,
  language: string = 'auto',
  style: string = 'literary',
  engine: AIEngineType = 'gemini-turbo'
): Promise<GrammarAnalysis> {
  const res = await fetchWithRetry('/api/ai/grammar-spelling', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language, style, engine }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(parseErrorMessage(errorData, res.status));
  }

  return res.json();
}

export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'auto',
  literaryTone: string = 'expressive',
  engine: AIEngineType = 'gemini-turbo'
): Promise<TranslationData> {
  const res = await fetchWithRetry('/api/ai/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetLanguage, sourceLanguage, literaryTone, engine }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(parseErrorMessage(errorData, res.status));
  }

  return res.json();
}

export async function scanDiaryOcr(
  imageBase64: string,
  mimeType: string = 'image/jpeg',
  notesContext: string = '',
  engine: AIEngineType = 'gemini-turbo'
): Promise<OcrDiaryResult> {
  const res = await fetchWithRetry('/api/ai/ocr-diary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType, notesContext, engine }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(parseErrorMessage(errorData, res.status));
  }

  return res.json();
}

export async function summarizeContent(
  text: string,
  title: string = '',
  length: 'short' | 'medium' | 'detailed' = 'medium',
  engine: AIEngineType = 'gemini-turbo'
): Promise<SummaryData> {
  const res = await fetchWithRetry('/api/ai/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, title, length, engine }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(parseErrorMessage(errorData, res.status));
  }

  return res.json();
}

export async function fetchContextualQuotes(
  text: string,
  theme: string = '',
  quoteStyle: string = 'mixed',
  engine: AIEngineType = 'gemini-turbo'
): Promise<{ detectedTheme: string; quotes: QuoteItem[]; _isFallback?: boolean; _notice?: string; engineUsed?: string }> {
  const res = await fetchWithRetry('/api/ai/suggest-quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, theme, quoteStyle, engine }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(parseErrorMessage(errorData, res.status));
  }

  return res.json();
}

export async function fetchDiaryPrompts(
  mood: string = 'contemplative',
  theme: string = '',
  engine: AIEngineType = 'gemini-turbo'
): Promise<{ prompts: Array<{ promptHindi: string; promptEnglish: string; category: string }>; _isFallback?: boolean; _notice?: string; engineUsed?: string }> {
  const res = await fetchWithRetry('/api/ai/diary-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mood, theme, engine }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(parseErrorMessage(errorData, res.status));
  }

  return res.json();
}

export async function convertDiaryToChapter(
  diaryContent: string,
  diaryTitle: string = '',
  genre: string = 'Novel / Memoir',
  engine: AIEngineType = 'gemini-turbo'
): Promise<{
  suggestedChapterTitle: string;
  subtitle?: string;
  polishedChapterContent: string;
  extractedStoryIdeas: string[];
  _isFallback?: boolean;
  _notice?: string;
  engineUsed?: string;
}> {
  const res = await fetchWithRetry('/api/ai/diary-to-chapter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ diaryContent, diaryTitle, genre, engine }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(parseErrorMessage(errorData, res.status));
  }

  return res.json();
}

export async function solveProblemWithMultiAgent(
  problem: string,
  chapterContext: string = '',
  genre: string = 'Novel / Fiction',
  bookTitle: string = '',
  engine: AIEngineType = 'hybrid'
): Promise<MultiAgentCouncilResult> {
  const res = await fetchWithRetry('/api/ai/multi-agent-solve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problem, chapterContext, genre, bookTitle, engine }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(parseErrorMessage(errorData, res.status));
  }

  return res.json();
}

export async function syncToCloud(
  manuscript: BookProject,
  authorId: string = 'default-author'
): Promise<{ success: boolean; lastSynced: string; message: string }> {
  const res = await fetchWithRetry('/api/sync/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authorId, manuscript }),
  });

  if (!res.ok) {
    throw new Error('Cloud sync failed');
  }

  return res.json();
}

export async function loadFromCloud(
  authorId: string = 'default-author'
): Promise<{ success: boolean; data: BookProject | null; lastSynced: string | null }> {
  const res = await fetchWithRetry(`/api/sync/load?authorId=${encodeURIComponent(authorId)}`, {
    method: 'GET',
  });
  if (!res.ok) {
    throw new Error('Failed to retrieve cloud manuscript');
  }
  return res.json();
}
