import React, { useState } from 'react';
import {
  Feather,
  Cloud,
  RefreshCw,
  Download,
  BookOpen,
  Maximize2,
  Minimize2,
  Settings,
  Languages,
  ChevronDown,
  Library,
  Zap,
  Brain,
  Sparkles,
  Cpu,
} from 'lucide-react';
import { BookProject, AIEngineType, AI_ENGINES } from '../types/manuscript';

interface NavbarProps {
  project: BookProject;
  allBooks: BookProject[];
  syncing: boolean;
  onOpenSync: () => void;
  onOpenBookSettings: () => void;
  onExport: () => void;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  uiLanguage: 'hi' | 'en';
  onToggleUiLanguage: () => void;
  onOpenDiaryWriter: () => void;
  onOpenBooksLibrary: () => void;
  onQuickSelectBook: (bookId: string) => void;
  activeEngine: AIEngineType;
  onSelectEngine: (engine: AIEngineType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  project,
  allBooks,
  syncing,
  onOpenSync,
  onOpenBookSettings,
  onExport,
  isFocusMode,
  onToggleFocusMode,
  uiLanguage,
  onToggleUiLanguage,
  onOpenDiaryWriter,
  onOpenBooksLibrary,
  onQuickSelectBook,
  activeEngine,
  onSelectEngine,
}) => {
  const [isBookMenuOpen, setIsBookMenuOpen] = useState(false);
  const [isEngineMenuOpen, setIsEngineMenuOpen] = useState(false);

  const totalWords = project.chapters.reduce(
    (acc, ch) => acc + (ch.content.trim() ? ch.content.trim().split(/\s+/).length : 0),
    0
  );

  const currentEngineObj = AI_ENGINES.find((e) => e.id === activeEngine) || AI_ENGINES[0];

  return (
    <header className="bg-amber-950 text-amber-50 border-b border-amber-900/60 px-4 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
      {/* Brand & Multi-Book Selector */}
      <div className="flex items-center gap-3 relative">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-amber-950 shadow-inner font-bold shrink-0">
            <Feather className="w-5 h-5 text-amber-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel font-bold text-lg tracking-wider text-amber-100">
                KALAM <span className="text-amber-400 text-sm font-devanagari font-semibold">कलम</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-900/80 text-amber-300 border border-amber-700/50 hidden sm:inline-block">
                Author Studio
              </span>
            </div>

            {/* Interactive Book Switcher Button */}
            <div className="relative">
              <button
                onClick={() => setIsBookMenuOpen(!isBookMenuOpen)}
                className="flex items-center gap-1.5 text-xs text-amber-200 hover:text-white bg-amber-900/50 hover:bg-amber-900 px-2 py-0.5 rounded border border-amber-700/50 transition-colors max-w-[240px] sm:max-w-xs text-left cursor-pointer"
                title="Switch between your books or add a new book"
              >
                <BookOpen className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate font-semibold">{project.title}</span>
                <ChevronDown className="w-3 h-3 text-amber-400 shrink-0 ml-0.5" />
              </button>

              {/* Book Quick Switcher Dropdown */}
              {isBookMenuOpen && (
                <div
                  className="absolute left-0 mt-2 w-72 bg-white text-stone-900 rounded-xl shadow-2xl border border-stone-300 py-1.5 z-50 text-xs animate-in fade-in duration-100"
                  onMouseLeave={() => setIsBookMenuOpen(false)}
                >
                  <div className="px-3 py-1.5 border-b border-stone-100 flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    <span>{uiLanguage === 'hi' ? 'आपकी पुस्तकें' : 'Your Books'}</span>
                    <span className="text-stone-400 font-normal">{allBooks.length} Total</span>
                  </div>

                  <div className="max-h-60 overflow-y-auto py-1">
                    {allBooks.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          onQuickSelectBook(b.id);
                          setIsBookMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-start justify-between gap-2 hover:bg-amber-50 transition-colors cursor-pointer ${
                          b.id === project.id ? 'bg-amber-100/60 font-bold text-amber-950' : 'text-stone-700'
                        }`}
                      >
                        <div className="truncate">
                          <div className="truncate">{b.title}</div>
                          <div className="text-[10px] text-stone-400 font-normal">{b.genre}</div>
                        </div>
                        {b.id === project.id && (
                          <span className="text-amber-800 text-xs mt-0.5">✓</span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="pt-1.5 border-t border-stone-100 px-2 space-y-1">
                    <button
                      onClick={() => {
                        setIsBookMenuOpen(false);
                        onOpenBooksLibrary();
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
                    >
                      <Library className="w-3.5 h-3.5 text-amber-800" />
                      <span>{uiLanguage === 'hi' ? 'सभी पुस्तकें देखें / प्रबंधित करें' : 'Manage All Books Shelf'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Center Word Stats */}
      <div className="hidden lg:flex items-center gap-3 bg-amber-900/40 px-3 py-1.5 rounded-lg border border-amber-800/40 text-xs">
        <div className="flex items-center gap-1.5 text-amber-200">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {totalWords.toLocaleString()} <span className="text-amber-400/80">/ {project.targetWordCount.toLocaleString()} {uiLanguage === 'hi' ? 'शब्द' : 'words'}</span>
          </span>
        </div>
        <div className="w-16 bg-amber-950 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-amber-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.round((totalWords / (project.targetWordCount || 1)) * 100))}%` }}
          />
        </div>
        <span className="text-amber-400 font-mono text-[11px]">
          {Math.min(100, Math.round((totalWords / (project.targetWordCount || 1)) * 100))}%
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Advance Gemini & Cloud Anthropic AI Engine Selector */}
        <div className="relative">
          <button
            onClick={() => setIsEngineMenuOpen(!isEngineMenuOpen)}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-stone-900/90 hover:bg-stone-800 text-amber-300 font-semibold border border-amber-600/50 transition-all cursor-pointer shadow-xs"
            title="Switch AI Engine (Advance Gemini vs Cloud Anthropic vs Gemini Turbo)"
          >
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline font-mono text-[11px]">
              {activeEngine === 'gemini-turbo' && '⚡ Gemini Turbo'}
              {activeEngine === 'gemini-advanced' && '🧠 Gemini 3.8'}
              {activeEngine === 'anthropic-cloud' && '🌟 Anthropic Claude'}
              {activeEngine === 'hybrid' && '🤝 Hybrid Council'}
            </span>
            <ChevronDown className="w-3 h-3 text-amber-400" />
          </button>

          {isEngineMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-80 bg-white text-stone-900 rounded-xl shadow-2xl border border-stone-300 py-2 z-50 text-xs animate-in fade-in duration-100"
              onMouseLeave={() => setIsEngineMenuOpen(false)}
            >
              <div className="px-3 py-1 border-b border-stone-100 flex items-center justify-between text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                <span>{uiLanguage === 'hi' ? 'AI इंजन मॉड्यूल चुनें' : 'Choose AI Engine Module'}</span>
                <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">Active</span>
              </div>

              <div className="p-1 space-y-1">
                {AI_ENGINES.map((eng) => (
                  <button
                    key={eng.id}
                    onClick={() => {
                      onSelectEngine(eng.id);
                      setIsEngineMenuOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg transition-all flex items-start gap-2.5 cursor-pointer ${
                      activeEngine === eng.id
                        ? 'bg-amber-50 border border-amber-300 text-amber-950 font-medium'
                        : 'hover:bg-stone-50 border border-transparent text-stone-700'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {eng.id === 'gemini-turbo' && <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />}
                      {eng.id === 'gemini-advanced' && <Brain className="w-4 h-4 text-blue-600" />}
                      {eng.id === 'anthropic-cloud' && <Sparkles className="w-4 h-4 text-amber-600" />}
                      {eng.id === 'hybrid' && <Cpu className="w-4 h-4 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-stone-900">
                          {uiLanguage === 'hi' ? eng.nameHi : eng.name}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                          {eng.speed}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                        {eng.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Multi-Book Library Shelf Button */}
        <button
          onClick={onOpenBooksLibrary}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-900 text-amber-100 font-semibold border border-amber-700/60 transition-all active:scale-95 cursor-pointer"
          title="Open Library to manage multiple books"
        >
          <Library className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">{uiLanguage === 'hi' ? 'मेरी पुस्तकें' : 'My Books'}</span>
        </button>

        {/* Prominent Write Diary Button */}
        <button
          onClick={onOpenDiaryWriter}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-700 to-amber-600 hover:from-rose-600 hover:to-amber-500 text-white font-semibold shadow-xs border border-rose-500/50 transition-all active:scale-95 cursor-pointer"
          title="Start writing a personal diary entry"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{uiLanguage === 'hi' ? 'डायरी लिखें (Write Diary)' : 'Write Diary'}</span>
        </button>

        {/* Language switch */}
        <button
          onClick={onToggleUiLanguage}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-amber-900/40 hover:bg-amber-900/80 text-amber-200 border border-amber-700/40 transition-colors cursor-pointer"
          title="Toggle Hindi/English labels"
        >
          <Languages className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-medium">{uiLanguage === 'hi' ? 'हिन्दी' : 'ENG'}</span>
        </button>

        {/* Cloud Sync Status Button */}
        <button
          onClick={onOpenSync}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
            syncing
              ? 'bg-amber-800/80 text-amber-200 border-amber-600 animate-pulse'
              : project.syncedToCloud
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50 hover:bg-emerald-900/40'
              : 'bg-amber-900/50 text-amber-300 border-amber-700/60 hover:bg-amber-900'
          }`}
          title="Cloud Sync & Backup"
        >
          {syncing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
          ) : (
            <Cloud className={`w-3.5 h-3.5 ${project.syncedToCloud ? 'text-emerald-400' : 'text-amber-400'}`} />
          )}
          <span className="hidden sm:inline">
            {syncing
              ? (uiLanguage === 'hi' ? 'सिंक हो रहा है...' : 'Syncing...')
              : (uiLanguage === 'hi' ? 'क्लाउड सिंक' : 'Cloud Sync')}
          </span>
        </button>

        {/* Export Button */}
        <button
          onClick={onExport}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-amber-900/40 hover:bg-amber-800/80 text-amber-200 border border-amber-700/40 transition-colors cursor-pointer"
          title="Export Book (Markdown, PDF, Text)"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">{uiLanguage === 'hi' ? 'एक्सपोर्ट' : 'Export'}</span>
        </button>

        {/* Book Details & Settings */}
        <button
          onClick={onOpenBookSettings}
          className="p-1.5 rounded-lg hover:bg-amber-900/60 text-amber-300 transition-colors cursor-pointer"
          title="Book Settings & Metadata"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Focus Mode */}
        <button
          onClick={onToggleFocusMode}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isFocusMode ? 'bg-amber-700 text-amber-100' : 'hover:bg-amber-900/60 text-amber-300'
          }`}
          title={isFocusMode ? 'Exit Distraction Free Mode' : 'Distraction Free Mode'}
        >
          {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
