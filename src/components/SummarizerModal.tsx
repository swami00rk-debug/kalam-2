import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Sparkles,
  Copy,
  Check,
  BookmarkCheck,
  Compass,
  Lightbulb,
  ListOrdered,
  UserCheck,
} from 'lucide-react';
import { SummaryData } from '../types/manuscript';
import { summarizeContent } from '../services/aiService';

interface SummarizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterText: string;
  chapterTitle: string;
  onSaveSummaryToChapter: (summaryText: string) => void;
  uiLanguage: 'hi' | 'en';
}

export const SummarizerModal: React.FC<SummarizerModalProps> = ({
  isOpen,
  onClose,
  chapterText,
  chapterTitle,
  onSaveSummaryToChapter,
  uiLanguage,
}) => {
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [depth, setDepth] = useState<'short' | 'medium' | 'detailed'>('medium');

  const handleSummarize = async () => {
    if (!chapterText.trim()) {
      setErrorMsg(uiLanguage === 'hi' ? 'सारांश के लिए पाठ आवश्यक है।' : 'Text is required for summarization.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await summarizeContent(chapterText, chapterTitle, depth);
      setSummaryData(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Summarization failed');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && !summaryData && chapterText.trim()) {
      handleSummarize();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!summaryData) return;
    const fullText = `[लॉगलाइन / Logline]: ${summaryData.oneSentenceLogline}\n\n[सारांश / Synopsis]: ${summaryData.synopsis}\n\n[मुख्य बिंदु / Key Points]:\n${summaryData.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToChapter = () => {
    if (!summaryData) return;
    onSaveSummaryToChapter(summaryData.synopsis);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-violet-900/20">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-violet-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-violet-300">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel font-bold text-lg text-violet-50">
                {uiLanguage === 'hi' ? 'अध्याय सारांश व विकास समीक्षा (AI Summarizer)' : 'AI Chapter Summarizer & Narrative Arc'}
              </h2>
              <p className="text-xs text-violet-300/80">
                {uiLanguage === 'hi'
                  ? 'अध्याय की मुख्य घटनाओं, पात्रों की मानसिक स्थिति और कथानक का संक्षेप'
                  : 'Synthesize plot beats, character arcs, emotional atmosphere, and developmental insights'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-violet-900 text-violet-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-stone-50 border-b border-stone-200 px-6 py-2.5 flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-600">
              {uiLanguage === 'hi' ? 'विश्लेषण स्तर:' : 'Summary Depth:'}
            </span>
            <div className="flex bg-stone-200 p-0.5 rounded-lg font-medium">
              <button
                onClick={() => setDepth('short')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  depth === 'short' ? 'bg-white shadow-xs text-violet-900 font-bold' : 'text-stone-600'
                }`}
              >
                {uiLanguage === 'hi' ? 'संक्षिप्त (Quick)' : 'Quick'}
              </button>
              <button
                onClick={() => setDepth('medium')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  depth === 'medium' ? 'bg-white shadow-xs text-violet-900 font-bold' : 'text-stone-600'
                }`}
              >
                {uiLanguage === 'hi' ? 'संतुलित (Balanced)' : 'Standard'}
              </button>
              <button
                onClick={() => setDepth('detailed')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  depth === 'detailed' ? 'bg-white shadow-xs text-violet-900 font-bold' : 'text-stone-600'
                }`}
              >
                {uiLanguage === 'hi' ? 'विस्तृत (Detailed)' : 'Deep Arc'}
              </button>
            </div>
          </div>

          <button
            onClick={handleSummarize}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-violet-700 hover:bg-violet-600 text-white font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? (uiLanguage === 'hi' ? 'सारांश बन रहा है...' : 'Generating...') : (uiLanguage === 'hi' ? 'ताज़ा सारांश बनाएं' : 'Refresh Summary')}</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50/40">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 border-3 border-violet-600 border-t-transparent rounded-full animate-spin mb-4" />
              <h4 className="font-bold text-stone-800 text-sm">
                {uiLanguage === 'hi' ? 'अध्याय के कथानक और भावों का विश्लेषण हो रहा है...' : 'Analyzing narrative structure and emotional beats...'}
              </h4>
              <p className="text-xs text-stone-500 mt-1 max-w-sm">
                {uiLanguage === 'hi'
                  ? 'घटनाओं की कड़ी, पात्रों के द्वंद्व और केंद्रीय संदेश का सार निकाला जा रहा है।'
                  : 'Distilling storyline milestones and developmental themes.'}
              </p>
            </div>
          ) : errorMsg ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
              <p className="font-semibold">{errorMsg}</p>
              <button onClick={handleSummarize} className="mt-2 text-rose-700 underline font-medium">
                {uiLanguage === 'hi' ? 'पुनः प्रयास करें' : 'Retry'}
              </button>
            </div>
          ) : summaryData ? (
            <div className="space-y-4">
              {/* One Sentence Logline Card */}
              <div className="p-4 rounded-xl bg-violet-50/80 border border-violet-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-violet-800 block mb-1">
                  {uiLanguage === 'hi' ? 'एक-पंक्ति सार (Logline)' : 'One-Sentence Logline'}
                </span>
                <p className="text-stone-900 font-serif italic text-base leading-snug">
                  "{summaryData.oneSentenceLogline}"
                </p>
              </div>

              {/* Main Narrative Synopsis */}
              <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-violet-600" />
                    <span>{uiLanguage === 'hi' ? 'कथा सारांश (Narrative Synopsis)' : 'Narrative Synopsis'}</span>
                  </h4>
                  <span className="text-xs text-stone-400">
                    {uiLanguage === 'hi' ? 'मूड:' : 'Mood:'} <span className="font-semibold text-violet-900">{summaryData.toneAndMood}</span>
                  </span>
                </div>
                <div className="text-stone-800 text-xs sm:text-sm leading-relaxed font-devanagari whitespace-pre-wrap">
                  {summaryData.synopsis}
                </div>
              </div>

              {/* Key Milestones & Chronological beats */}
              {summaryData.keyPoints && summaryData.keyPoints.length > 0 && (
                <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5 mb-3">
                    <ListOrdered className="w-3.5 h-3.5 text-violet-600" />
                    <span>{uiLanguage === 'hi' ? 'मुख्य घटनाक्रम व बिंदु (Key Plot Points)' : 'Key Chronological Milestones'}</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-stone-700">
                    {summaryData.keyPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed font-devanagari">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Character Arcs & Psychological Observations */}
              {summaryData.characterArcs && summaryData.characterArcs.length > 0 && (
                <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5 mb-3">
                    <UserCheck className="w-3.5 h-3.5 text-violet-600" />
                    <span>{uiLanguage === 'hi' ? 'पात्र विकास व मनोदशा (Character Arcs)' : 'Character Developments'}</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-700">
                    {summaryData.characterArcs.map((arc, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-violet-600 font-bold">•</span>
                        <span className="leading-relaxed font-devanagari">{arc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Editorial Advice */}
              {summaryData.writingCraftAdvice && (
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900 block mb-0.5">
                      {uiLanguage === 'hi' ? 'संपादक का लेखक के लिए परामर्श (Craft Advice):' : 'Developmental Craft Feedback:'}
                    </span>
                    <p className="leading-relaxed font-devanagari text-stone-700">
                      {summaryData.writingCraftAdvice}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center text-stone-400">
              <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-xs">
                {uiLanguage === 'hi' ? 'अध्याय का विश्लेषण करने के लिए बटन दबाएं' : 'Ready to analyze narrative milestones'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {summaryData && (
          <div className="p-4 border-t border-stone-200 bg-stone-100 flex items-center justify-between flex-wrap gap-2 text-xs">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-stone-600 hover:text-stone-900 font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (uiLanguage === 'hi' ? 'कॉपी हुआ' : 'Copied') : (uiLanguage === 'hi' ? 'पूरा सारांश कॉपी करें' : 'Copy All')}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveToChapter}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-violet-700 hover:bg-violet-600 text-white font-semibold shadow-xs transition-colors"
              >
                {saved ? <Check className="w-3.5 h-3.5" /> : <BookmarkCheck className="w-3.5 h-3.5" />}
                <span>{saved ? (uiLanguage === 'hi' ? 'सहेजा गया!' : 'Saved to Chapter!') : (uiLanguage === 'hi' ? 'अध्याय नोट्स में पिन करें' : 'Save to Chapter Notes')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
