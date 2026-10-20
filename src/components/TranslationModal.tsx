import React, { useState } from 'react';
import {
  X,
  Languages,
  ArrowRight,
  Copy,
  Check,
  PlusCircle,
  Replace,
  Sparkles,
  BookOpen,
  Info,
} from 'lucide-react';
import { TranslationData } from '../types/manuscript';
import { translateText } from '../services/aiService';

interface TranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterText: string;
  chapterTitle: string;
  onReplaceContent: (newText: string) => void;
  onAppendContent: (appendContent: string) => void;
  onCreateNewTranslatedChapter: (title: string, content: string) => void;
  uiLanguage: 'hi' | 'en';
}

const POPULAR_LANGUAGES = [
  { code: 'Hindi', name: 'हिन्दी (Hindi)' },
  { code: 'English', name: 'English' },
  { code: 'Urdu', name: 'اردو (Urdu)' },
  { code: 'Hinglish', name: 'Hinglish (Conversational)' },
  { code: 'Marathi', name: 'मराठी (Marathi)' },
  { code: 'Bengali', name: 'বাংলা (Bengali)' },
  { code: 'Gujarati', name: 'ગુજરાતી (Gujarati)' },
  { code: 'Punjabi', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'Tamil', name: 'தமிழ் (Tamil)' },
  { code: 'Telugu', name: 'తెలుగు (Telugu)' },
  { code: 'Spanish', name: 'Español (Spanish)' },
  { code: 'French', name: 'Français (French)' },
  { code: 'German', name: 'Deutsch (German)' },
  { code: 'Arabic', name: 'العربية (Arabic)' },
  { code: 'Japanese', name: '日本語 (Japanese)' },
  { code: 'Russian', name: 'Русский (Russian)' },
];

export const TranslationModal: React.FC<TranslationModalProps> = ({
  isOpen,
  onClose,
  chapterText,
  chapterTitle,
  onReplaceContent,
  onAppendContent,
  onCreateNewTranslatedChapter,
  uiLanguage,
}) => {
  const [targetLang, setTargetLang] = useState('English');
  const [tone, setTone] = useState('expressive');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranslationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!chapterText.trim()) {
      setErrorMsg(uiLanguage === 'hi' ? 'अनुवाद के लिए पाठ की आवश्यकता है।' : 'Text is required for translation.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await translateText(chapterText, targetLang, 'auto', tone);
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Translation failed');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && !result && chapterText.trim()) {
      handleTranslate();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateNew = () => {
    if (!result) return;
    const newTitle = `${chapterTitle} (${targetLang} Translation)`;
    onCreateNewTranslatedChapter(newTitle, result.translatedText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-amber-900/20">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel font-bold text-lg text-blue-50">
                {uiLanguage === 'hi' ? 'साहित्यिक भाषा अनुवादक (Multilingual Translator)' : 'Literary Translator'}
              </h2>
              <p className="text-xs text-blue-300/80">
                {uiLanguage === 'hi'
                  ? 'भाव, लय, मुहावरों और कथानक के सौंदर्य को बनाए रखते हुए अनुवाद'
                  : 'Preserves emotional resonance, dialogue rhythm, and poetic nuance'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-blue-900 text-blue-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Translation Configuration Toolbar */}
        <div className="bg-stone-50 border-b border-stone-200 px-6 py-3 flex items-center justify-between flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Target Language selector */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-stone-700">
                {uiLanguage === 'hi' ? 'लक्ष्य भाषा:' : 'Target Language:'}
              </span>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-medium text-stone-800 focus:outline-none focus:border-blue-600"
              >
                {POPULAR_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tone selector */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-stone-700">
                {uiLanguage === 'hi' ? 'साहित्यिक शैली:' : 'Literary Tone:'}
              </span>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-medium text-stone-800 focus:outline-none focus:border-blue-600"
              >
                <option value="expressive">{uiLanguage === 'hi' ? 'काव्यात्मक व भावुक (Expressive)' : 'Poetic & Expressive'}</option>
                <option value="dialogue">{uiLanguage === 'hi' ? 'स्वाभाविक पात्र संवाद (Natural Dialogue)' : 'Natural Dialogue'}</option>
                <option value="classical">{uiLanguage === 'hi' ? 'गंभीर साहित्यिक गद्य (Literary Fiction)' : 'Literary Fiction'}</option>
                <option value="formal">{uiLanguage === 'hi' ? 'सरल व आधुनिक (Modern Prose)' : 'Modern Accessible'}</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleTranslate}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-700 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? (uiLanguage === 'hi' ? 'अनुवाद हो रहा है...' : 'Translating...') : (uiLanguage === 'hi' ? 'अनुवाद करें' : 'Translate Now')}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50/40">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
              <h3 className="font-semibold text-stone-800 text-sm">
                {uiLanguage === 'hi'
                  ? `${targetLang} में साहित्यिक अनुवाद तैयार हो रहा है...`
                  : `Crafting expressive literary translation in ${targetLang}...`}
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm">
                {uiLanguage === 'hi'
                  ? 'शब्दशः अनुवाद के स्थान पर मूल भाव और संवेदना को तराशा जा रहा है।'
                  : 'Re-weaving metaphors, cultural idioms, and character voices.'}
              </p>
            </div>
          ) : errorMsg ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
              <p className="font-semibold">{errorMsg}</p>
              <button
                onClick={handleTranslate}
                className="mt-2 text-rose-700 underline font-medium hover:text-rose-900"
              >
                {uiLanguage === 'hi' ? 'पुनः प्रयास करें' : 'Retry'}
              </button>
            </div>
          ) : result ? (
            <div className="space-y-5">
              {/* Language badges row */}
              <div className="flex items-center gap-2 text-xs text-stone-600">
                <span className="bg-stone-200 px-2 py-0.5 rounded font-medium">
                  {uiLanguage === 'hi' ? 'मूल:' : 'Source:'} {result.sourceLanguageDetected}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-bold">
                  {uiLanguage === 'hi' ? 'अनुवादित:' : 'Target:'} {result.targetLanguage}
                </span>
              </div>

              {/* Translated Text Preview Card */}
              <div className="p-5 rounded-xl bg-white border border-stone-300/80 shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    {uiLanguage === 'hi' ? 'अनुवादित पाठ' : 'Translated Excerpt'}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs text-stone-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? (uiLanguage === 'hi' ? 'कॉपी हुआ' : 'Copied') : (uiLanguage === 'hi' ? 'कॉपी करें' : 'Copy Text')}</span>
                  </button>
                </div>
                <div className="text-stone-800 text-sm font-devanagari leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
                  {result.translatedText}
                </div>
              </div>

              {/* Translation Nuances & Notes */}
              {result.translationNotes && result.translationNotes.length > 0 && (
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950">
                  <div className="font-bold flex items-center gap-1.5 mb-2 text-blue-900">
                    <Info className="w-4 h-4 text-blue-700" />
                    <span>{uiLanguage === 'hi' ? 'अनुवादक की साहित्यिक टिप्पणियाँ (Translator Notes)' : 'Literary & Idiom Notes'}</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-blue-900/90 leading-relaxed">
                    {result.translationNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Alternative Phrasings if available */}
              {result.alternativePhrasing && result.alternativePhrasing.length > 0 && (
                <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 text-xs">
                  <div className="font-bold text-stone-700 mb-1.5">
                    {uiLanguage === 'hi' ? 'वैकल्पिक काव्यात्मक वाक्य (Alternative Phrasings):' : 'Alternative Stylistic Choices:'}
                  </div>
                  <div className="space-y-1 text-stone-600 italic">
                    {result.alternativePhrasing.map((alt, idx) => (
                      <p key={idx}>• "{alt}"</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center text-stone-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>{uiLanguage === 'hi' ? 'अनुवाद शुरू करने के लिए ऊपर बटन दबाएं' : 'Ready to translate your prose'}</p>
            </div>
          )}
        </div>

        {/* Action Footer */}
        {result && (
          <div className="p-4 border-t border-stone-200 bg-stone-100 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-stone-500">
              {uiLanguage === 'hi' ? 'आप इस अनुवाद को अपने उपन्यास में कैसे जोड़ना चाहते हैं?' : 'How would you like to apply this translation?'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onReplaceContent(result.translatedText);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-200 text-stone-700 font-medium transition-colors"
                title="Replace chapter content"
              >
                <Replace className="w-3.5 h-3.5" />
                <span>{uiLanguage === 'hi' ? 'मौजूदा पाठ बदलें' : 'Replace Chapter'}</span>
              </button>
              <button
                onClick={() => {
                  onAppendContent(`\n\n--- [${targetLang} Translation] ---\n\n${result.translatedText}`);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-200 text-stone-700 font-medium transition-colors"
                title="Append to bottom of this chapter"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{uiLanguage === 'hi' ? 'नीचे जोड़ें' : 'Append to Bottom'}</span>
              </button>
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white font-semibold shadow-xs transition-colors"
                title="Create a new chapter with this translated text"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{uiLanguage === 'hi' ? 'नया अध्याय बनाएं' : 'New Chapter'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
