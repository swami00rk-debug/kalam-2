import React, { useState } from 'react';
import {
  X,
  Quote,
  Sparkles,
  Copy,
  Check,
  BookmarkPlus,
  Send,
  BookOpen,
  Filter,
} from 'lucide-react';
import { QuoteItem } from '../types/manuscript';
import { fetchContextualQuotes } from '../services/aiService';

interface QuotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterText: string;
  chapterTitle: string;
  onSetChapterEpigraph: (quote: { quote: string; author: string; source?: string }) => void;
  onInsertQuoteToContent: (quoteText: string) => void;
  uiLanguage: 'hi' | 'en';
}

export const QuotesModal: React.FC<QuotesModalProps> = ({
  isOpen,
  onClose,
  chapterText,
  chapterTitle,
  onSetChapterEpigraph,
  onInsertQuoteToContent,
  uiLanguage,
}) => {
  const [loading, setLoading] = useState(false);
  const [detectedTheme, setDetectedTheme] = useState('');
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [customTheme, setCustomTheme] = useState('');
  const [quoteStyle, setQuoteStyle] = useState('mixed');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleFetchQuotes = async (themeParam?: string) => {
    if (!chapterText.trim() && !themeParam) {
      setErrorMsg(uiLanguage === 'hi' ? 'उद्धरण खोजने के लिए अध्याय में कुछ पाठ लिखें।' : 'Please write text in chapter to analyze context.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await fetchContextualQuotes(chapterText, themeParam || customTheme, quoteStyle);
      setDetectedTheme(result.detectedTheme);
      setQuotes(result.quotes || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch quotes');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && quotes.length === 0 && chapterText.trim()) {
      handleFetchQuotes();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (q: QuoteItem, idx: number) => {
    const text = `"${q.quote}"\n— ${q.author}${q.sourceOrWork ? ` (${q.sourceOrWork})` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(idx);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApplyEpigraph = (q: QuoteItem) => {
    onSetChapterEpigraph({
      quote: q.quote,
      author: q.author,
      source: q.sourceOrWork,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-amber-900/20">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-amber-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Quote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel font-bold text-lg text-amber-50">
                {uiLanguage === 'hi' ? 'प्रासंगिक साहित्यिक उद्धरण व शेरो-शायरी' : 'Contextual Literary Quotes & Shayari'}
              </h2>
              <p className="text-xs text-amber-300/80">
                {uiLanguage === 'hi'
                  ? 'अध्याय के भाव, दर्शन और कथानक के अनुरूप प्रतिष्ठित रचनाकारों के विचार'
                  : 'AI curates quotes from Hindi Sahitya, Urdu Shayari, and World Literature matching your scene'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-amber-900 text-amber-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Theme Search Bar */}
        <div className="bg-stone-50 border-b border-stone-200 px-6 py-3 flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <input
              type="text"
              value={customTheme}
              onChange={(e) => setCustomTheme(e.target.value)}
              placeholder={
                uiLanguage === 'hi'
                  ? 'थीम या भाव (उदा. विरह, संघर्ष, बनारस, एकांत, उम्मीद)...'
                  : 'Theme or emotion (e.g. Hope, Solitude, Banaras, Memory)...'
              }
              className="w-full bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-stone-800 text-xs focus:outline-none focus:border-amber-700"
              onKeyDown={(e) => e.key === 'Enter' && handleFetchQuotes(customTheme)}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={quoteStyle}
              onChange={(e) => setQuoteStyle(e.target.value)}
              className="bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-medium text-stone-700 focus:outline-none focus:border-amber-700"
            >
              <option value="mixed">{uiLanguage === 'hi' ? 'सभी परंपराएं (Hindi, Urdu, World)' : 'Mixed Traditions'}</option>
              <option value="hindi_sahitya">{uiLanguage === 'hi' ? 'हिंदी साहित्य (प्रेमचंद, दिनकर, अज्ञेय)' : 'Hindi Sahitya'}</option>
              <option value="urdu_shayari">{uiLanguage === 'hi' ? 'उर्दू शायरी (गालिब, फ़ैज़, राहत)' : 'Urdu Shayari'}</option>
              <option value="world_classics">{uiLanguage === 'hi' ? 'विश्व साहित्य (World Classics)' : 'World Classics'}</option>
              <option value="philosophical">{uiLanguage === 'hi' ? 'दार्शनिक चिंतन (Philosophical)' : 'Philosophical'}</option>
            </select>

            <button
              onClick={() => handleFetchQuotes()}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-800 hover:bg-amber-700 text-amber-50 font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? (uiLanguage === 'hi' ? 'खोज रहे हैं...' : 'Curating...') : (uiLanguage === 'hi' ? 'उद्धरण खोजें' : 'Suggest Quotes')}</span>
            </button>
          </div>
        </div>

        {/* Theme pill if detected */}
        {detectedTheme && (
          <div className="bg-amber-50/60 px-6 py-2 border-b border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-1.5">
              <span className="font-bold">{uiLanguage === 'hi' ? 'पहचानी गई विषयवस्तु:' : 'Detected Theme:'}</span>
              <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-semibold border border-amber-300/70">
                {detectedTheme}
              </span>
            </div>
            <span className="text-stone-500 italic text-[11px]">
              {uiLanguage === 'hi' ? 'अध्याय के भाव से मेल खाते उद्धरण' : 'Thematically linked to your chapter'}
            </span>
          </div>
        )}

        {/* Quotes List Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50/40">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 border-3 border-amber-700 border-t-transparent rounded-full animate-spin mb-4" />
              <h4 className="font-bold text-stone-800 text-sm">
                {uiLanguage === 'hi'
                  ? 'साहित्यिक ग्रंथों व काव्य संग्रहों से प्रासंगिक पंक्तियाँ खोजी जा रही हैं...'
                  : 'Searching literary traditions for resonant reflections...'}
              </h4>
              <p className="text-xs text-stone-500 mt-1 max-w-sm">
                {uiLanguage === 'hi'
                  ? 'आपके अध्याय के मूल दर्शन और पात्रों के द्वंद्व से तालमेल बैठाया जा रहा है।'
                  : 'Matching the cadence and emotional weight of your excerpt.'}
              </p>
            </div>
          ) : errorMsg ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
              <p className="font-semibold">{errorMsg}</p>
              <button onClick={() => handleFetchQuotes()} className="mt-2 text-rose-700 underline font-medium">
                {uiLanguage === 'hi' ? 'पुनः प्रयास करें' : 'Retry'}
              </button>
            </div>
          ) : quotes.length > 0 ? (
            <div className="space-y-4">
              {quotes.map((q, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-amber-400/80 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Placement Suggestion Badge */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                          {q.suggestedPlacement}
                        </span>
                        {q.language && (
                          <span className="text-[10px] text-stone-400 capitalize">
                            {q.language}
                          </span>
                        )}
                      </div>

                      {/* The Quote itself */}
                      <p className="font-serif-literary text-stone-900 text-base sm:text-lg italic leading-relaxed my-2">
                        "{q.quote}"
                      </p>

                      {/* Author & Source */}
                      <div className="text-xs font-bold text-amber-950 mt-1 flex items-center gap-2">
                        <span>— {q.author}</span>
                        {q.sourceOrWork && (
                          <span className="text-stone-500 font-normal italic">
                            ({q.sourceOrWork})
                          </span>
                        )}
                      </div>

                      {/* Meaning / Translation if available */}
                      {q.translationOrMeaning && (
                        <p className="text-xs text-stone-600 mt-2 bg-stone-50 p-2.5 rounded-lg border border-stone-100 font-devanagari">
                          <span className="font-semibold text-stone-700">
                            {uiLanguage === 'hi' ? 'भावार्थ / अनुवाद: ' : 'Meaning / Nuance: '}
                          </span>
                          {q.translationOrMeaning}
                        </p>
                      )}

                      {/* Why it fits this scene */}
                      <p className="text-xs text-amber-900/90 mt-2 flex items-start gap-1.5 font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{q.resonanceReason}</span>
                      </p>
                    </div>

                    {/* Actions on this quote card */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => handleApplyEpigraph(q)}
                        className="px-3 py-1.5 bg-amber-800 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                        title="Set as Chapter Epigraph banner"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        <span>{uiLanguage === 'hi' ? 'शीर्ष उद्धरण बनाएं' : 'Set as Epigraph'}</span>
                      </button>

                      <button
                        onClick={() => {
                          onInsertQuoteToContent(`\n\n> "${q.quote}"\n> — ${q.author}${q.sourceOrWork ? ` (${q.sourceOrWork})` : ''}\n\n`);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium border border-stone-200 transition-colors"
                        title="Insert quote directly into current chapter text"
                      >
                        <span>{uiLanguage === 'hi' ? 'अध्याय में जोड़ें' : 'Insert in Text'}</span>
                      </button>

                      <button
                        onClick={() => handleCopy(q, idx)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg text-center flex items-center justify-center gap-1 text-xs"
                      >
                        {copiedId === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === idx ? (uiLanguage === 'hi' ? 'कॉपी हुआ' : 'Copied') : (uiLanguage === 'hi' ? 'कॉपी' : 'Copy')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-stone-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-xs">
                {uiLanguage === 'hi'
                  ? 'अध्याय के अनुकूल उद्धरण खोजने के लिए ऊपर बटन दबाएं'
                  : 'Click Suggest Quotes to discover resonant literary lines'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-100 flex items-center justify-between text-xs">
          <span className="text-stone-500">
            {uiLanguage === 'hi' ? 'उद्धरणों को सीधे अध्याय के शीर्ष या बीच में जोड़ सकते हैं' : 'You can insert quotes as chapter epigraphs or body reflections'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-200 font-medium transition-colors"
          >
            {uiLanguage === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
