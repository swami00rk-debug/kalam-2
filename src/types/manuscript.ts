export type AIEngineType = 'gemini-turbo' | 'gemini-advanced' | 'anthropic-cloud' | 'hybrid';

export interface AIEngineInfo {
  id: AIEngineType;
  name: string;
  nameHi: string;
  speed: 'Ultra Fast' | 'Balanced' | 'Deep Analysis';
  description: string;
  provider: 'Gemini' | 'Anthropic Claude' | 'Hybrid Council';
  badgeColor: string;
}

export const AI_ENGINES: AIEngineInfo[] = [
  {
    id: 'gemini-turbo',
    name: 'Gemini 3.1 Turbo (Ultra-Fast & 503 Immune)',
    nameHi: 'जेमिनी टर्बो (अति-तीव्र एवं 503-मुक्त)',
    speed: 'Ultra Fast',
    description: 'Instant response, zero queue delay, optimized for fast writing iterations.',
    provider: 'Gemini',
    badgeColor: 'bg-emerald-500/15 text-emerald-700 border-emerald-300',
  },
  {
    id: 'gemini-advanced',
    name: 'Gemini 3.8 Advanced (Literary Master)',
    nameHi: 'एडवांस्ड जेमिनी 3.8 (गहन साहित्यिक विश्लेषण)',
    speed: 'Deep Analysis',
    description: 'Deep vocabulary, intricate linguistic reasoning, and comprehensive chapter breakdowns.',
    provider: 'Gemini',
    badgeColor: 'bg-blue-500/15 text-blue-700 border-blue-300',
  },
  {
    id: 'anthropic-cloud',
    name: 'Cloud Anthropic Claude (Literary & Dialogue Subtext)',
    nameHi: 'क्लाउड एंथ्रोपिक क्लॉड (साहित्यिक संवेदनशीलता)',
    speed: 'Balanced',
    description: 'Master of human emotional subtext, believable dialogue, and nuanced character psychology.',
    provider: 'Anthropic Claude',
    badgeColor: 'bg-amber-500/15 text-amber-800 border-amber-300',
  },
  {
    id: 'hybrid',
    name: 'Hybrid Multi-Model Council (Gemini + Anthropic)',
    nameHi: 'हाइब्रिड काउंसिल (जेमिनी + एंथ्रोपिक संयुक्त शक्ति)',
    speed: 'Balanced',
    description: 'Orchestrates Gemini Speed + Anthropic Depth simultaneously for best possible solutions.',
    provider: 'Hybrid Council',
    badgeColor: 'bg-purple-500/15 text-purple-700 border-purple-300',
  },
];

export interface QuoteItem {
  quote: string;
  author: string;
  sourceOrWork?: string;
  language?: string;
  translationOrMeaning?: string;
  resonanceReason: string;
  suggestedPlacement: string;
}

export interface GrammarIssue {
  id: string;
  original: string;
  replacement: string;
  type: string;
  explanation: string;
  severity?: 'error' | 'warning' | 'suggestion';
}

export interface GrammarAnalysis {
  detectedLanguage: string;
  overallScore: number;
  summary: string;
  correctedText: string;
  issues: GrammarIssue[];
  editorTips?: string[];
  _isFallback?: boolean;
  _notice?: string;
  engineUsed?: string;
}

export interface TranslationData {
  sourceLanguageDetected: string;
  targetLanguage: string;
  translatedText: string;
  transliteration?: string;
  translationNotes?: string[];
  alternativePhrasing?: string[];
  _isFallback?: boolean;
  _notice?: string;
  engineUsed?: string;
}

export interface OcrDiaryResult {
  detectedDate?: string;
  detectedTitle?: string;
  detectedLanguage: string;
  rawTranscription: string;
  formattedChapterText: string;
  confidence: 'high' | 'medium' | 'low';
  unclearWords?: string[];
  keyThemes?: string[];
  sourceImagePreview?: string;
  _isFallback?: boolean;
  _notice?: string;
  engineUsed?: string;
}

export interface SummaryData {
  title?: string;
  wordCount?: number;
  oneSentenceLogline: string;
  synopsis: string;
  keyPoints: string[];
  characterArcs?: string[];
  toneAndMood: string;
  writingCraftAdvice?: string;
  _isFallback?: boolean;
  _notice?: string;
  engineUsed?: string;
}

export interface Chapter {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  type: 'chapter' | 'diary' | 'notes' | 'characters';
  status: 'draft' | 'in_progress' | 'revised' | 'completed';
  date?: string;
  summary?: string;
  epigraphQuote?: {
    quote: string;
    author: string;
    source?: string;
  };
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BookProject {
  id: string;
  title: string;
  subtitle: string;
  authorName: string;
  genre: string;
  targetWordCount: number;
  primaryLanguage: string;
  chapters: Chapter[];
  activeChapterId: string;
  lastSavedAt: string;
  syncedToCloud: boolean;
  lastCloudSyncAt?: string;
  coverColor?: string; // e.g. 'amber', 'emerald', 'indigo', 'rose', 'slate'
}

export interface BookLibrary {
  books: BookProject[];
  activeBookId: string;
}

export interface ProblemSolvingAgent {
  agentId: string;
  agentName: string;
  agentRole: string;
  avatar: string;
  diagnosis: string;
  solution: string;
  sampleSnippet?: string;
  aiEngineBadge?: string;
}

export interface MultiAgentCouncilResult {
  problemDigest: string;
  agents: ProblemSolvingAgent[];
  consensusActionPlan: string;
  nextSteps: string[];
  _isFallback?: boolean;
  _notice?: string;
  engineUsed?: string;
}
