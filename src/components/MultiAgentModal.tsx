import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Users,
  Check,
  Copy,
  Bookmark,
  ShieldCheck,
  Zap,
  Cpu,
  Brain,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { MultiAgentCouncilResult, AIEngineType, AI_ENGINES } from '../types/manuscript';
import { solveProblemWithMultiAgent } from '../services/aiService';

interface MultiAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterText: string;
  chapterTitle: string;
  bookTitle: string;
  genre: string;
  onAppendToChapter: (textToAppend: string) => void;
  onSaveAsStoryNote: (title: string, noteContent: string) => void;
  uiLanguage: 'hi' | 'en';
  initialEngine?: AIEngineType;
}

const COMMON_PROBLEMS = [
  {
    titleHi: 'रोमांचक मोड़ (Plot Twist) की कमी',
    titleEn: 'Need a Compelling Plot Twist',
    prompt: 'कहानी में आगे क्या होगा यह पाठक आसानी से भांप सकते हैं। मुझे इस अध्याय के अंत में एक अप्रत्याशित, रोमांचक मोड़ (Twist) चाहिए जो पाठक को स्तब्ध कर दे।',
  },
  {
    titleHi: 'संवादों में कृत्रिमता व सपाटपन (Stiff Dialogue)',
    titleEn: 'Stiff or Unnatural Dialogue',
    prompt: 'पात्रों के बीच की बातचीत बहुत औपचारिक और सपाट लग रही है। इसमें अंतर्निहित तनाव (Subtext), भावनात्मक कशमकश और स्वाभाविक बोलचाल का पुट कैसे जोड़ें?',
  },
  {
    titleHi: 'कहानी की गति धीमी (Slow Pacing / Saggy Middle)',
    titleEn: 'Pacing Lag / Writer Block',
    prompt: 'घटनाक्रम आगे नहीं बढ़ रहा है और दृश्य में खिंचाव आ गया है। इस दृश्य में गति, जिज्ञासा और तात्कालिकता (Urgency) कैसे पैदा की जाए?',
  },
  {
    titleHi: 'वर्तमान अध्याय की खामियों का ऑडिट (Full Audit)',
    titleEn: 'Audit Chapter Weaknesses',
    prompt: 'इस लिखे गए अध्याय का समग्र मूल्यांकन करें। बताएं कि कथानक, पात्रों के भाव, भाषा की सुंदरता और पाठक की रुचि के लिहाज से इसमें क्या कमियां हैं और उन्हें कैसे ठीक करें।',
  },
];

export const MultiAgentModal: React.FC<MultiAgentModalProps> = ({
  isOpen,
  onClose,
  chapterText,
  chapterTitle,
  bookTitle,
  genre,
  onAppendToChapter,
  onSaveAsStoryNote,
  uiLanguage,
  initialEngine = 'hybrid',
}) => {
  const [problemInput, setProblemInput] = useState('');
  const [includeContext, setIncludeContext] = useState(true);
  const [selectedEngine, setSelectedEngine] = useState<AIEngineType>(initialEngine);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MultiAgentCouncilResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSolve = async (customPrompt?: string, overrideEngine?: AIEngineType) => {
    const textToSolve = customPrompt || problemInput;
    if (!textToSolve.trim()) {
      setErrorMsg(uiLanguage === 'hi' ? 'कृपया अपनी समस्या का विवरण लिखें या ऊपर से कोई विषय चुनें।' : 'Please describe your writing hurdle.');
      return;
    }

    const engineToUse = overrideEngine || selectedEngine;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await solveProblemWithMultiAgent(
        textToSolve,
        includeContext ? chapterText : '',
        genre,
        bookTitle,
        engineToUse
      );
      setResult(res);
      if (res.engineUsed) {
        showToast(
          uiLanguage === 'hi'
            ? `परामर्श पूरा हुआ (${res.engineUsed})`
            : `Deliberation complete (${res.engineUsed})`
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Multi-agent deliberation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApplySnippet = (snippet: string, agentName: string) => {
    const formatted = `\n\n[${agentName} का सुझाया गया दृश्य / Dialogue]:\n${snippet}\n\n`;
    onAppendToChapter(formatted);
    showToast(uiLanguage === 'hi' ? 'सुझाया गया संवाद अध्याय में जोड़ दिया गया है!' : 'Snippet appended to current chapter!');
  };

  const handleApplyConsensus = () => {
    if (!result) return;
    const formatted = `\n\n--- [साहित्यिक परामर्श मंडल - कार्य योजना / Editorial Council Plan] ---\n${result.consensusActionPlan}\n\n`;
    onAppendToChapter(formatted);
    onClose();
  };

  const handleSaveToNotes = () => {
    if (!result) return;
    const noteTitle = `परामर्श: ${result.problemDigest.slice(0, 35)}...`;
    let body = `[समस्या]: ${problemInput}\n\n[सर्वसम्मत समाधान]:\n${result.consensusActionPlan}\n\n[एजेंट्स की राय]:\n`;
    result.agents.forEach((ag) => {
      body += `\n* ${ag.agentName} (${ag.agentRole}) [${ag.aiEngineBadge || 'AI'}]:\n${ag.solution}\n`;
      if (ag.sampleSnippet) body += `नमूना: "${ag.sampleSnippet}"\n`;
    });
    onSaveAsStoryNote(noteTitle, body);
    onClose();
  };

  const handleCopy = () => {
    if (!result) return;
    const all = `[समस्या निदान]: ${result.problemDigest}\n\n[सर्वसम्मत समाधान]:\n${result.consensusActionPlan}\n\n` +
      result.agents.map((a) => `${a.agentName} (${a.agentRole}) [${a.aiEngineBadge || ''}]:\nनिदान: ${a.diagnosis}\nसमाधान: ${a.solution}\n`).join('\n\n');
    navigator.clipboard.writeText(all);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-amber-900/20 animate-in fade-in zoom-in-95 duration-150 relative">
        {/* Toast notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-60 bg-stone-900/95 text-amber-200 px-4 py-2 rounded-xl text-xs font-semibold shadow-lg border border-amber-500/40 animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-amber-950 shadow-md font-bold">
              <Users className="w-5 h-5 text-amber-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-cinzel font-bold text-lg text-amber-50">
                  {uiLanguage === 'hi' ? 'साहित्यिक परामर्श मंडल (Multi-Agent Editorial Council)' : 'Multi-Agent Problem Solving Council'}
                </h2>
                <span className="text-[10px] bg-amber-900/80 text-amber-300 px-2 py-0.5 rounded-full font-medium border border-amber-700/60">
                  4 AI Agents
                </span>
                <span className="text-[10px] bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded-full font-medium border border-emerald-700/60 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" />
                  <span>Gemini & Anthropic Module</span>
                </span>
              </div>
              <p className="text-xs text-amber-300/80 mt-0.5">
                {uiLanguage === 'hi'
                  ? 'कथानक, पात्र मनोविज्ञान, भाषा शैली और पाठक समीक्षक मिलकर समस्या का समाधान तराशते हैं'
                  : '4 elite specialized agents collaborate, debate, and resolve your narrative blocks with multi-model speed'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-amber-900 text-amber-300 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Engine & Module Selector Ribbon */}
        <div className="bg-stone-900 text-amber-100 px-4 py-2 border-b border-stone-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-stone-400 font-semibold text-[11px] uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>{uiLanguage === 'hi' ? 'AI इंजन मॉड्यूल:' : 'AI Engine Module:'}</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {AI_ENGINES.map((eng) => (
              <button
                key={eng.id}
                onClick={() => setSelectedEngine(eng.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer border ${
                  selectedEngine === eng.id
                    ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm'
                    : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700'
                }`}
                title={eng.description}
              >
                {eng.id === 'gemini-turbo' && <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />}
                {eng.id === 'gemini-advanced' && <Brain className="w-3 h-3 text-blue-400" />}
                {eng.id === 'anthropic-cloud' && <Sparkles className="w-3 h-3 text-amber-300" />}
                {eng.id === 'hybrid' && <Users className="w-3 h-3 text-purple-300" />}
                <span>{uiLanguage === 'hi' ? eng.nameHi.split('(')[0].trim() : eng.name.split('(')[0].trim()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4 Agent Introductions Bar */}
        <div className="bg-amber-900/10 border-b border-amber-900/15 px-6 py-2.5 flex items-center justify-between text-xs text-stone-700 overflow-x-auto gap-4">
          <div className="flex items-center gap-4 text-[11px] whitespace-nowrap">
            <span className="flex items-center gap-1 font-semibold text-amber-950">
              <span>🏛️</span> Dr. Vyas (कथानक डॉक्टर • <span className="text-emerald-700 text-[10px]">Gemini Turbo</span>)
            </span>
            <span className="text-stone-300">•</span>
            <span className="flex items-center gap-1 font-semibold text-violet-950">
              <span>🧠</span> Dr. Anand (पात्र मनोविज्ञानी • <span className="text-amber-700 text-[10px]">Anthropic Claude</span>)
            </span>
            <span className="text-stone-300">•</span>
            <span className="flex items-center gap-1 font-semibold text-emerald-950">
              <span>🖋️</span> Acharya Kavi (शैली विशेषज्ञ • <span className="text-blue-700 text-[10px]">Gemini 3.8</span>)
            </span>
            <span className="text-stone-300">•</span>
            <span className="flex items-center gap-1 font-semibold text-rose-950">
              <span>🎯</span> Devika (प्रकाशक समीक्षक • <span className="text-purple-700 text-[10px]">Cloud Ensemble</span>)
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50 space-y-6">
          {/* Problem Input Section */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div>
              <label className="font-bold text-xs text-stone-800 block mb-1">
                {uiLanguage === 'hi' ? 'आपकी लेखन समस्या या अड़चन क्या है?' : 'What is your writing hurdle or plot block?'}
              </label>
              <textarea
                value={problemInput}
                onChange={(e) => setProblemInput(e.target.value)}
                placeholder={
                  uiLanguage === 'hi'
                    ? 'अपनी समस्या यहाँ लिखें... उदा: "नायक और खलनायक की मुलाकात में रोमांच नहीं आ रहा", "कहानी बीच में लटक गई है", "संवाद कृत्रिम लग रहे हैं"...'
                    : 'Describe your writing problem... e.g. "Scene lacks tension", "Plot reached a dead-end", "Character dialogue feels unnatural"...'
                }
                rows={3}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-700 font-devanagari resize-none"
              />
            </div>

            {/* Quick Template Chips */}
            <div>
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                {uiLanguage === 'hi' ? 'त्वरित सामान्य समस्याएं (Click to Solve):' : 'Common Dilemma Templates:'}
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {COMMON_PROBLEMS.map((cp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setProblemInput(cp.prompt);
                      handleSolve(cp.prompt);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-950 border border-stone-200 text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <span>⚡</span>
                    <span>{uiLanguage === 'hi' ? cp.titleHi : cp.titleEn}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-100 flex-wrap gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-stone-600">
                <input
                  type="checkbox"
                  checked={includeContext}
                  onChange={(e) => setIncludeContext(e.target.checked)}
                  className="rounded text-amber-700 focus:ring-amber-500"
                />
                <span>
                  {uiLanguage === 'hi'
                    ? `वर्तमान अध्याय का संदर्भ साथ भेजें ("${chapterTitle}")`
                    : `Include current chapter text ("${chapterTitle}")`}
                </span>
              </label>

              <button
                onClick={() => handleSolve()}
                disabled={loading || !problemInput.trim()}
                className="px-5 py-2 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>
                  {loading
                    ? (uiLanguage === 'hi' ? 'एजेंट्स विचार-विमर्श कर रहे हैं...' : 'Council Deliberating...')
                    : (uiLanguage === 'hi' ? 'परामर्श मंडल से समाधान लें' : 'Convene Council')}
                </span>
              </button>
            </div>
          </div>

          {/* Deliberation Results View */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
              <h4 className="font-bold text-stone-800 text-sm">
                {uiLanguage === 'hi'
                  ? 'चारों विशेषज्ञ एजेंट्स मिलकर समस्या का समाधान तराश रहे हैं...'
                  : 'All 4 specialized AI agents are debating and structuring solutions...'}
              </h4>
              <p className="text-xs text-stone-500 mt-1 max-w-md">
                {uiLanguage === 'hi'
                  ? `मॉडल: ${selectedEngine.toUpperCase()} • कथानक डॉक्टर, पात्र मनोविज्ञानी, भाषा विशेषज्ञ और पाठक समीक्षक अपनी राय तैयार कर रहे हैं।`
                  : `Engine: ${selectedEngine.toUpperCase()} • Analyzing plot tension, psychological subtext, sensory phrasing, and pacing.`}
              </p>
            </div>
          ) : errorMsg ? (
            /* Enhanced 503 Resilient Error Box with Instant Retry Options */
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-rose-950">
                    {uiLanguage === 'hi' ? 'AI सेवा त्रुटि / 503 Overload सूचना' : 'AI Service Notice'}
                  </h4>
                  <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                    {errorMsg}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-rose-200/60 flex-wrap">
                <button
                  onClick={() => handleSolve()}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{uiLanguage === 'hi' ? 'पुनः प्रयास करें (Retry)' : 'Retry Request'}</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedEngine('gemini-turbo');
                    handleSolve(undefined, 'gemini-turbo');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{uiLanguage === 'hi' ? '⚡ Gemini Turbo (Fast & 503-Immune) से तुरंत हल करें' : '⚡ Switch to Gemini Turbo & Solve'}</span>
                </button>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Notice Banner if Fallback was triggered */}
              {result._notice && (
                <div className="p-3 bg-amber-500/15 border border-amber-400/40 rounded-xl text-amber-950 text-xs flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="font-medium">{result._notice}</span>
                </div>
              )}

              {/* Core Problem Digest Banner */}
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs flex items-start justify-between flex-wrap gap-2">
                <div>
                  <span className="font-bold text-amber-900 uppercase tracking-wider block mb-0.5">
                    {uiLanguage === 'hi' ? 'समस्या का मूल निदान (Diagnosed Hurdle):' : 'Core Dilemma:'}
                  </span>
                  <p className="text-stone-800 font-devanagari font-medium">{result.problemDigest}</p>
                </div>
                {result.engineUsed && (
                  <span className="text-[10px] font-mono bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">
                    {result.engineUsed}
                  </span>
                )}
              </div>

              {/* 4 Agent Solution Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.agents.map((ag, idx) => {
                  return (
                    <div
                      key={ag.agentId || idx}
                      className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Agent Header */}
                        <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{ag.avatar || '🤖'}</span>
                            <div>
                              <h4 className="font-bold text-xs text-stone-900">{ag.agentName}</h4>
                              <span className="text-[10px] text-amber-900 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                {ag.agentRole}
                              </span>
                            </div>
                          </div>
                          {ag.aiEngineBadge && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                              {ag.aiEngineBadge}
                            </span>
                          )}
                        </div>

                        {/* Diagnosis */}
                        <div className="text-xs">
                          <span className="font-bold text-stone-700 block mb-0.5">
                            {uiLanguage === 'hi' ? 'समस्या की जड़:' : 'Diagnosis:'}
                          </span>
                          <p className="text-stone-600 font-devanagari leading-relaxed">{ag.diagnosis}</p>
                        </div>

                        {/* Solution */}
                        <div className="text-xs">
                          <span className="font-bold text-amber-950 block mb-0.5">
                            {uiLanguage === 'hi' ? 'प्रस्तावित समाधान:' : 'Proposed Solution:'}
                          </span>
                          <p className="text-stone-800 font-devanagari leading-relaxed font-medium">
                            {ag.solution}
                          </p>
                        </div>

                        {/* Concrete Snippet if available */}
                        {ag.sampleSnippet && (
                          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-stone-500 text-[10px] uppercase">
                                {uiLanguage === 'hi' ? 'नमूना दृश्य / संवाद:' : 'Sample Scene / Dialogue:'}
                              </span>
                              <button
                                onClick={() => handleApplySnippet(ag.sampleSnippet!, ag.agentName)}
                                className="text-[10px] text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
                              >
                                {uiLanguage === 'hi' ? 'अध्याय में जोड़ें' : 'Insert to Chapter'}
                              </button>
                            </div>
                            <p className="text-stone-700 italic font-devanagari leading-relaxed">
                              "{ag.sampleSnippet}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Consensus Action Plan */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50 via-stone-50 to-amber-50 border border-amber-300 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-amber-950">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                  <h4 className="font-bold text-sm font-cinzel">
                    {uiLanguage === 'hi'
                      ? 'सर्वसम्मत संपादकीय कार्य योजना (Unified Consensus Plan)'
                      : 'Consensus Editorial Action Plan'}
                  </h4>
                </div>
                <div className="text-xs sm:text-sm text-stone-800 font-devanagari leading-relaxed whitespace-pre-wrap">
                  {result.consensusActionPlan}
                </div>

                {/* Immediate Next Steps */}
                {result.nextSteps && result.nextSteps.length > 0 && (
                  <div className="pt-3 border-t border-amber-200/60">
                    <span className="font-bold text-xs text-stone-700 block mb-1.5">
                      {uiLanguage === 'hi' ? 'लेखक के लिए त्वरित ३ कदम (Immediate Next Steps):' : 'Immediate Next Steps:'}
                    </span>
                    <ul className="space-y-1 text-xs text-stone-700">
                      {result.nextSteps.map((step, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            {sIdx + 1}
                          </span>
                          <span className="font-devanagari">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        {result && (
          <div className="p-4 border-t border-stone-200 bg-stone-100 flex items-center justify-between flex-wrap gap-2 text-xs">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-stone-600 hover:text-stone-900 font-medium transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (uiLanguage === 'hi' ? 'कॉपी हुआ' : 'Copied') : (uiLanguage === 'hi' ? 'पूरा परामर्श कॉपी करें' : 'Copy All')}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveToNotes}
                className="px-3.5 py-1.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-200 font-medium transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{uiLanguage === 'hi' ? 'कथा नोट्स में सहेजें' : 'Save to Story Notes'}</span>
              </button>

              <button
                onClick={handleApplyConsensus}
                className="px-5 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-700 text-white font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{uiLanguage === 'hi' ? 'समाधान अध्याय में लागू करें' : 'Apply to Chapter'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
