import React, { useState } from 'react';
import {
  X,
  CheckCheck,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Zap,
  Cpu,
} from 'lucide-react';
import { GrammarAnalysis, GrammarIssue, AIEngineType, AI_ENGINES } from '../types/manuscript';
import { checkGrammarAndSpelling } from '../services/aiService';

interface GrammarModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterText: string;
  onApplyCorrection: (correctedText: string) => void;
  uiLanguage: 'hi' | 'en';
  engine?: AIEngineType;
}

export const GrammarModal: React.FC<GrammarModalProps> = ({
  isOpen,
  onClose,
  chapterText,
  onApplyCorrection,
  uiLanguage,
  engine = 'gemini-turbo',
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<AIEngineType>(engine);
  const [analysis, setAnalysis] = useState<GrammarAnalysis | null>(null);
  const [currentText, setCurrentText] = useState(chapterText);
  const [styleMode, setStyleMode] = useState<'literary' | 'casual' | 'strict'>('literary');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [appliedIssues, setAppliedIssues] = useState<Set<string>>(new Set());
  const [viewTab, setViewTab] = useState<'issues' | 'diff' | 'editorTips'>('issues');

  // Trigger analysis when opened or refreshed
  const handleAnalyze = async (overrideEngine?: AIEngineType) => {
    if (!currentText.trim()) {
      setErrorMsg(uiLanguage === 'hi' ? 'विश्लेषण के लिए अध्याय में कुछ पाठ लिखें।' : 'Please write some text to analyze.');
      return;
    }
    const engineToUse = overrideEngine || selectedEngine;
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await checkGrammarAndSpelling(currentText, 'auto', styleMode, engineToUse);
      setAnalysis(result);
      setAppliedIssues(new Set());
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to check grammar');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      setCurrentText(chapterText);
      if (!analysis) {
        handleAnalyze();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplySingle = (issue: GrammarIssue) => {
    if (!issue.original) return;
    const regex = new RegExp(issue.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const updated = currentText.replace(regex, issue.replacement);
    setCurrentText(updated);
    setAppliedIssues((prev) => new Set(prev).add(issue.id || issue.original));
  };

  const handleApplyAll = () => {
    if (!analysis) return;
    setCurrentText(analysis.correctedText);
    onApplyCorrection(analysis.correctedText);
    onClose();
  };

  const handleApplyCurrentToChapter = () => {
    onApplyCorrection(currentText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-amber-900/20 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <CheckCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-cinzel font-bold text-lg text-emerald-50">
                  {uiLanguage === 'hi' ? 'व्याकरण व वर्तनी सुधार (Proofreader)' : 'Spelling & Grammar Review'}
                </h2>
                <span className="text-[10px] font-mono bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-700/60">
                  {selectedEngine}
                </span>
              </div>
              <p className="text-xs text-emerald-300/80">
                {uiLanguage === 'hi'
                  ? 'हिंदी, अंग्रेजी व हिंग्लिश में अशुद्धियों की पहचान और साहित्यिक संपादन'
                  : 'AI-assisted literary proofreading, syntax refinement, and spellcheck'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAnalyze()}
              disabled={loading}
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-100 transition-colors disabled:opacity-50 cursor-pointer"
              title="Re-run analysis"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{uiLanguage === 'hi' ? 'पुनः जाँचें' : 'Re-check'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-emerald-900 text-emerald-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Engine Switcher Ribbon */}
        <div className="bg-emerald-950/20 border-b border-emerald-900/20 px-6 py-2 flex items-center justify-between text-xs text-stone-700 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-stone-600">
            <Cpu className="w-3.5 h-3.5 text-emerald-700" />
            <span>{uiLanguage === 'hi' ? 'मॉडल इंजन:' : 'AI Engine:'}</span>
          </div>

          <div className="flex items-center gap-1">
            {AI_ENGINES.map((eng) => (
              <button
                key={eng.id}
                onClick={() => {
                  setSelectedEngine(eng.id);
                  handleAnalyze(eng.id);
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer border ${
                  selectedEngine === eng.id
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {eng.id === 'gemini-turbo' && '⚡ Turbo (Fast)'}
                {eng.id === 'gemini-advanced' && '🧠 Gemini 3.8'}
                {eng.id === 'anthropic-cloud' && '🌟 Claude'}
                {eng.id === 'hybrid' && '🤝 Hybrid'}
              </button>
            ))}
          </div>
        </div>

        {/* Notice Banner if Fallback triggered */}
        {analysis?._notice && (
          <div className="p-3 bg-amber-500/15 border-b border-amber-300 text-amber-950 text-xs flex items-center gap-2 px-6">
            <Zap className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="font-medium">{analysis._notice}</span>
          </div>
        )}

        {/* Subheader / Tabs & Overall Score */}
        {analysis && !loading && (
          <div className="bg-stone-50 border-b border-stone-200 px-6 py-3 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    analysis.overallScore >= 85
                      ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-500'
                      : analysis.overallScore >= 65
                      ? 'bg-amber-100 text-amber-800 border-2 border-amber-500'
                      : 'bg-rose-100 text-rose-800 border-2 border-rose-500'
                  }`}
                >
                  {analysis.overallScore}
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-800">
                    {uiLanguage === 'hi' ? 'साहित्यिक गुणवत्ता स्कोर' : 'Literary Quality Score'}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {analysis.issues.length} {uiLanguage === 'hi' ? 'सुधार सुझाव पाए गए' : 'suggestions detected'}
                    {analysis.engineUsed && ` • ${analysis.engineUsed}`}
                  </div>
                </div>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex bg-stone-200/80 p-0.5 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setViewTab('issues')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    viewTab === 'issues' ? 'bg-white shadow-xs text-emerald-900' : 'text-stone-600'
                  }`}
                >
                  {uiLanguage === 'hi' ? 'सुधार सूची (Issues)' : 'Issues List'}
                </button>
                <button
                  onClick={() => setViewTab('diff')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    viewTab === 'diff' ? 'bg-white shadow-xs text-emerald-900' : 'text-stone-600'
                  }`}
                >
                  {uiLanguage === 'hi' ? 'तुलना (Diff Review)' : 'Side by Side'}
                </button>
                {analysis.editorTips && analysis.editorTips.length > 0 && (
                  <button
                    onClick={() => setViewTab('editorTips')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      viewTab === 'editorTips' ? 'bg-white shadow-xs text-emerald-900' : 'text-stone-600'
                    }`}
                  >
                    {uiLanguage === 'hi' ? 'संपादक सुझाव' : 'Editor Tips'}
                  </button>
                )}
              </div>
            </div>

            {/* Quick Apply All button */}
            {analysis.issues.length > 0 && (
              <button
                onClick={handleApplyAll}
                className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{uiLanguage === 'hi' ? 'सभी सुधार तुरंत लागू करें' : 'Accept All Edits'}</span>
              </button>
            )}
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-semibold text-stone-700">
                {uiLanguage === 'hi'
                  ? `मॉडल ${selectedEngine.toUpperCase()} द्वारा व्याकरण और वर्तनी का विश्लेषण हो रहा है...`
                  : `Checking spelling, grammar, and literary syntax with ${selectedEngine.toUpperCase()}...`}
              </p>
            </div>
          ) : errorMsg ? (
            /* Enhanced 503 Resilient Error Box */
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-rose-950">
                    {uiLanguage === 'hi' ? 'जांच में रुकावट / 503 Overload सूचना' : 'Grammar Review Notice'}
                  </h4>
                  <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                    {errorMsg}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-rose-200/60 flex-wrap">
                <button
                  onClick={() => handleAnalyze()}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{uiLanguage === 'hi' ? 'पुनः प्रयास करें (Retry)' : 'Retry'}</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedEngine('gemini-turbo');
                    handleAnalyze('gemini-turbo');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{uiLanguage === 'hi' ? '⚡ Gemini Turbo (Fastest & 503-Immune) से तुरंत जांचें' : '⚡ Switch to Gemini Turbo'}</span>
                </button>
              </div>
            </div>
          ) : analysis ? (
            <div>
              {/* Tab: Issues */}
              {viewTab === 'issues' && (
                <div className="space-y-3">
                  <div className="p-3 bg-white border border-stone-200 rounded-xl text-xs text-stone-700">
                    <span className="font-bold text-stone-900">
                      {uiLanguage === 'hi' ? 'संक्षेप:' : 'Summary:'}{' '}
                    </span>
                    {analysis.summary}
                  </div>

                  {analysis.issues.length === 0 ? (
                    <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900">
                      <CheckCheck className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                      <h4 className="font-bold text-sm">
                        {uiLanguage === 'hi' ? 'उत्कृष्ट! कोई बड़ी अशुद्धि नहीं पाई गई।' : 'Exemplary! No notable errors found.'}
                      </h4>
                      <p className="text-xs text-emerald-700 mt-1">
                        {uiLanguage === 'hi' ? 'आपकी भाषा और वर्तनी सुव्यवस्थित है।' : 'Your literary flow and grammar are sound.'}
                      </p>
                    </div>
                  ) : (
                    analysis.issues.map((issue, idx) => {
                      const isApplied = appliedIssues.has(issue.id || issue.original);
                      return (
                        <div
                          key={issue.id || idx}
                          className={`p-4 rounded-xl border transition-all ${
                            isApplied
                              ? 'bg-stone-50 border-stone-200 opacity-60'
                              : 'bg-white border-stone-200 shadow-2xs hover:border-emerald-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded line-through">
                                  {issue.original}
                                </span>
                                <span className="text-stone-400 text-xs">→</span>
                                <span className="font-bold text-xs bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                                  {issue.replacement}
                                </span>
                                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                                  {issue.type}
                                </span>
                              </div>
                              <p className="text-xs text-stone-600 leading-relaxed font-devanagari">
                                {issue.explanation}
                              </p>
                            </div>

                            <button
                              onClick={() => handleApplySingle(issue)}
                              disabled={isApplied}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1 cursor-pointer transition-colors ${
                                isApplied
                                  ? 'bg-stone-200 text-stone-500 cursor-default'
                                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
                              }`}
                            >
                              {isApplied ? (
                                <>
                                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{uiLanguage === 'hi' ? 'लागू हुआ' : 'Applied'}</span>
                                </>
                              ) : (
                                <span>{uiLanguage === 'hi' ? 'स्वीकार करें' : 'Accept'}</span>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Tab: Diff */}
              {viewTab === 'diff' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
                    <span className="font-bold text-xs text-stone-500 uppercase tracking-wider block mb-2">
                      {uiLanguage === 'hi' ? 'मूल पाठ (Original Text)' : 'Original Text'}
                    </span>
                    <div className="text-xs sm:text-sm text-stone-700 font-devanagari whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                      {chapterText}
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 shadow-2xs">
                    <span className="font-bold text-xs text-emerald-900 uppercase tracking-wider block mb-2">
                      {uiLanguage === 'hi' ? 'संशोधित संस्करण (Polished Text)' : 'Suggested Polished Version'}
                    </span>
                    <div className="text-xs sm:text-sm text-emerald-950 font-devanagari whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                      {analysis.correctedText}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Editor Tips */}
              {viewTab === 'editorTips' && analysis.editorTips && (
                <div className="space-y-3">
                  <span className="font-bold text-xs text-stone-700 block">
                    {uiLanguage === 'hi' ? 'वरिष्ठ साहित्यिक संपादक के craft सुझाव:' : 'Editorial Craft Advice:'}
                  </span>
                  {analysis.editorTips.map((tip, idx) => (
                    <div key={idx} className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-stone-800 leading-relaxed font-devanagari">{tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-100 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="text-stone-500 text-[11px]">
            {analysis?.detectedLanguage && (
              <span>
                {uiLanguage === 'hi' ? 'पहचानी गई भाषा:' : 'Language:'} {analysis.detectedLanguage}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
            >
              {uiLanguage === 'hi' ? 'बंद करें' : 'Close'}
            </button>
            <button
              onClick={handleApplyCurrentToChapter}
              className="px-4 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer"
            >
              {uiLanguage === 'hi' ? 'बदलाव अध्याय में सहेजें' : 'Save Changes to Chapter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
