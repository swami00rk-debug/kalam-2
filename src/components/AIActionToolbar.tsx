import React from 'react';
import {
  CheckCheck,
  Languages,
  Camera,
  FileSpreadsheet,
  Quote,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface AIActionToolbarProps {
  onOpenGrammar: () => void;
  onOpenTranslation: () => void;
  onOpenOcr: () => void;
  onOpenSummarizer: () => void;
  onOpenQuotes: () => void;
  onOpenDiaryWriter: () => void;
  onOpenMultiAgent: () => void;
  isPlayingAudio: boolean;
  onToggleAudio: () => void;
  uiLanguage: 'hi' | 'en';
}

export const AIActionToolbar: React.FC<AIActionToolbarProps> = ({
  onOpenGrammar,
  onOpenTranslation,
  onOpenOcr,
  onOpenSummarizer,
  onOpenQuotes,
  onOpenDiaryWriter,
  onOpenMultiAgent,
  isPlayingAudio,
  onToggleAudio,
  uiLanguage,
}) => {
  return (
    <div className="bg-stone-100/90 border-b border-stone-200/80 px-4 py-2 flex items-center justify-between overflow-x-auto gap-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{uiLanguage === 'hi' ? 'AI लेखक टूल्स' : 'AI Studio Tools'}</span>
        </span>

        {/* 0. Dedicated Start Writing Diary Button */}
        <button
          onClick={onOpenDiaryWriter}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 shadow-xs transition-all hover:border-rose-400 active:scale-95"
          title="Open personal diary writing studio"
        >
          <span className="text-sm">📔</span>
          <span>{uiLanguage === 'hi' ? 'डायरी लिखना शुरू करें' : 'Write Diary Entry'}</span>
        </button>

        {/* 0.5 MULTIPLE AGENTS FOR PROBLEM SOLVING */}
        <button
          onClick={onOpenMultiAgent}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-xs transition-all active:scale-95"
          title="Multiple AI Agents council for plot, character, and pacing problem solving"
        >
          <span>🤖</span>
          <span>{uiLanguage === 'hi' ? 'AI समस्या निवारण मंडल' : 'Multi-Agent Council'}</span>
        </button>

        {/* 1. Grammar & Spelling */}
        <button
          onClick={onOpenGrammar}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs transition-all hover:border-emerald-400 active:scale-95"
          title="Spellcheck & grammatical error detection in Hindi & English"
        >
          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{uiLanguage === 'hi' ? 'व्याकरण व वर्तनी जाँच' : 'Spelling & Grammar'}</span>
        </button>

        {/* 2. Translation */}
        <button
          onClick={onOpenTranslation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-blue-50 text-blue-800 border border-blue-300 shadow-xs transition-all hover:border-blue-400 active:scale-95"
          title="Literary translation to Hindi, English, Urdu, Marathi, etc."
        >
          <Languages className="w-3.5 h-3.5 text-blue-600" />
          <span>{uiLanguage === 'hi' ? 'भाषा अनुवाद' : 'Translate Language'}</span>
        </button>

        {/* 3. Diary OCR Scanner */}
        <button
          onClick={onOpenOcr}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-rose-50 text-rose-800 border border-rose-300 shadow-xs transition-all hover:border-rose-400 active:scale-95"
          title="Upload or snap handwritten diary photo to convert into formatted book chapter"
        >
          <Camera className="w-3.5 h-3.5 text-rose-600" />
          <span>{uiLanguage === 'hi' ? 'डायरी फोटो स्कैन (OCR)' : 'Scan Diary (OCR)'}</span>
        </button>

        {/* 4. Summarizer */}
        <button
          onClick={onOpenSummarizer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-violet-50 text-violet-800 border border-violet-300 shadow-xs transition-all hover:border-violet-400 active:scale-95"
          title="AI-powered summarization and character beats for notes & chapters"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-violet-600" />
          <span>{uiLanguage === 'hi' ? 'अध्याय सारांश' : 'AI Summarizer'}</span>
        </button>

        {/* 5. Contextual Quotes */}
        <button
          onClick={onOpenQuotes}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 shadow-xs transition-all hover:border-amber-400 active:scale-95"
          title="Find philosophical, Hindi Sahitya, or Urdu Shayari quotes matching your scene"
        >
          <Quote className="w-3.5 h-3.5 text-amber-700" />
          <span>{uiLanguage === 'hi' ? 'प्रासंगिक उद्धरण' : 'Suggest Quotes'}</span>
        </button>
      </div>

      {/* Audio Playback Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleAudio}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border shadow-xs transition-all ${
            isPlayingAudio
              ? 'bg-amber-600 text-white border-amber-700 animate-pulse'
              : 'bg-white hover:bg-stone-200 text-stone-700 border-stone-300'
          }`}
          title="Listen to your chapter read aloud"
        >
          {isPlayingAudio ? (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>{uiLanguage === 'hi' ? 'रोकें' : 'Pause Audio'}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-stone-600" />
              <span>{uiLanguage === 'hi' ? 'बोलकर सुनें' : 'Read Aloud'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
