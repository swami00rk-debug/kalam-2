import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Plus,
  Copy,
  Trash2,
  Check,
  Sparkles,
  BookMarked,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { BookProject } from '../types/manuscript';

interface BooksLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: BookProject[];
  activeBookId: string;
  onSelectBook: (bookId: string) => void;
  onCreateNewBook: (newBook: {
    title: string;
    subtitle?: string;
    authorName?: string;
    genre: string;
    targetWordCount: number;
    primaryLanguage: string;
    coverColor: string;
  }) => void;
  onDuplicateBook: (bookId: string) => void;
  onDeleteBook: (bookId: string) => void;
  uiLanguage: 'hi' | 'en';
}

const BOOK_TEMPLATES = [
  {
    genre: 'उपन्यास / Novel',
    color: 'amber',
    words: 50000,
    descHi: 'गंभीर कथानक, अध्याय व पात्र संरचना',
    descEn: 'Narrative chapters, arcs & dialogues',
  },
  {
    genre: 'संस्मरण व डायरी / Memoir',
    color: 'rose',
    words: 40000,
    descHi: 'व्यक्तिगत यादें, अनुभव और डायरी प्रविष्टियाँ',
    descEn: 'Personal journal entries and reflections',
  },
  {
    genre: 'काव्य संकलन / Poetry',
    color: 'emerald',
    words: 15000,
    descHi: 'कविताएं, ग़ज़लें, छंद और भाव',
    descEn: 'Poems, couplets, nazms and rhymes',
  },
  {
    genre: 'रहस्य व थ्रिलर / Suspense',
    color: 'indigo',
    words: 60000,
    descHi: 'उलझन, सुराग, रहस्यमयी मोड़',
    descEn: 'Pacing, clues, tension and twists',
  },
];

const COVER_COLORS = [
  { id: 'amber', bg: 'from-amber-800 to-amber-950', border: 'border-amber-700', badge: 'bg-amber-100 text-amber-900' },
  { id: 'rose', bg: 'from-rose-800 to-rose-950', border: 'border-rose-700', badge: 'bg-rose-100 text-rose-900' },
  { id: 'indigo', bg: 'from-indigo-800 to-indigo-950', border: 'border-indigo-700', badge: 'bg-indigo-100 text-indigo-900' },
  { id: 'emerald', bg: 'from-emerald-800 to-emerald-950', border: 'border-emerald-700', badge: 'bg-emerald-100 text-emerald-900' },
  { id: 'stone', bg: 'from-stone-700 to-stone-900', border: 'border-stone-600', badge: 'bg-stone-200 text-stone-800' },
];

export const BooksLibraryModal: React.FC<BooksLibraryModalProps> = ({
  isOpen,
  onClose,
  books,
  activeBookId,
  onSelectBook,
  onCreateNewBook,
  onDuplicateBook,
  onDeleteBook,
  uiLanguage,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');

  // New Book Form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newGenre, setNewGenre] = useState('उपन्यास / Novel');
  const [newTargetWords, setNewTargetWords] = useState(50000);
  const [newLanguage, setNewLanguage] = useState('Hindi / हिन्दी');
  const [selectedColor, setSelectedColor] = useState('amber');

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onCreateNewBook({
      title: newTitle.trim(),
      subtitle: newSubtitle.trim(),
      authorName: newAuthor.trim() || 'लेखक',
      genre: newGenre,
      targetWordCount: Number(newTargetWords) || 50000,
      primaryLanguage: newLanguage,
      coverColor: selectedColor,
    });

    // Reset and close
    setNewTitle('');
    setNewSubtitle('');
    setViewMode('list');
    onClose();
  };

  const handleApplyTemplate = (tmpl: typeof BOOK_TEMPLATES[0]) => {
    setNewGenre(tmpl.genre);
    setNewTargetWords(tmpl.words);
    setSelectedColor(tmpl.color);
  };

  const totalWordsAcrossAll = books.reduce((total, b) => {
    return (
      total +
      b.chapters.reduce((sum, ch) => sum + (ch.content.trim() ? ch.content.trim().split(/\s+/).length : 0), 0)
    );
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-amber-900/20 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-amber-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-amber-950 shadow-md font-bold">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-cinzel font-bold text-lg text-amber-50">
                  {uiLanguage === 'hi' ? 'मेरी पुस्तकें व पुस्तकालय (My Books Library)' : 'My Books Library'}
                </h2>
                <span className="text-[10px] bg-amber-900 text-amber-300 px-2 py-0.5 rounded-full font-medium border border-amber-700/60">
                  {books.length} {uiLanguage === 'hi' ? 'किताबें' : 'Books'}
                </span>
              </div>
              <p className="text-xs text-amber-300/80 mt-0.5">
                {uiLanguage === 'hi'
                  ? 'एक साथ कई अलग-अलग किताबों पर काम करें और कभी भी स्विच करें'
                  : 'Manage, switch, and write multiple books simultaneously'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'list' && (
              <button
                onClick={() => setViewMode('create')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-amber-950 font-bold rounded-lg text-xs shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{uiLanguage === 'hi' ? '+ नई किताब शुरू करें' : '+ New Book'}</span>
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-amber-900 text-amber-300 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Library Statistics strip */}
        {viewMode === 'list' && (
          <div className="bg-amber-900/10 border-b border-amber-900/15 px-6 py-2.5 flex items-center justify-between text-xs text-stone-700 flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <span>
                <strong className="text-amber-950">{books.length}</strong> {uiLanguage === 'hi' ? 'सक्रिय किताबें' : 'Active Books'}
              </span>
              <span>•</span>
              <span>
                <strong className="text-amber-950">{totalWordsAcrossAll.toLocaleString()}</strong> {uiLanguage === 'hi' ? 'कुल शब्द लिखे गए' : 'Total Words Written'}
              </span>
            </div>
            <div className="text-stone-500 text-[11px] italic">
              {uiLanguage === 'hi' ? 'किसी भी किताब पर क्लिक करके तुरंत लिखना शुरू करें' : 'Click on any book card to switch workspace'}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50">
          {viewMode === 'create' ? (
            /* Create New Book Form */
            <form onSubmit={handleCreateSubmit} className="max-w-2xl mx-auto space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div>
                  <h3 className="font-bold text-base text-stone-900 font-cinzel">
                    {uiLanguage === 'hi' ? 'नई किताब की रचना शुरू करें' : 'Start a New Book Project'}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {uiLanguage === 'hi'
                      ? 'अपनी नई किताब का शीर्षक, विधा और शब्द लक्ष्य निर्धारित करें'
                      : 'Set up the title, genre, target word count, and cover style'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="text-xs text-stone-500 hover:text-stone-800 underline font-medium"
                >
                  {uiLanguage === 'hi' ? 'वापस पुस्तकालय पर जाएँ' : 'Back to Library'}
                </button>
              </div>

              {/* Template quick picks */}
              <div>
                <label className="font-bold text-xs text-stone-700 block mb-2">
                  {uiLanguage === 'hi' ? 'पुस्तक विधा टेम्पलेट चुनें:' : 'Quick Genre Template:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BOOK_TEMPLATES.map((tmpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        newGenre === tmpl.genre
                          ? 'border-amber-700 bg-amber-50 shadow-xs'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="font-bold text-stone-900 truncate">{tmpl.genre}</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">{tmpl.words.toLocaleString()} {uiLanguage === 'hi' ? 'शब्द' : 'words'}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Subtitle */}
              <div>
                <label className="font-bold text-xs text-stone-700 block mb-1">
                  {uiLanguage === 'hi' ? 'किताब का नाम / मुख्य शीर्षक *:' : 'Book Title *:'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={uiLanguage === 'hi' ? 'उदा. मौन के पार, रास्तों की तलाश, डायरी के पन्ने...' : 'e.g. Beyond the Silence, Echoes of Dawn...'}
                  className="w-full bg-white border border-stone-300 rounded-xl p-3 text-stone-900 font-bold text-base focus:outline-none focus:border-amber-700 font-devanagari"
                />
              </div>

              <div>
                <label className="font-bold text-xs text-stone-700 block mb-1">
                  {uiLanguage === 'hi' ? 'उपशीर्षक / टैगलाइन (वैकल्पिक):' : 'Subtitle / Tagline (Optional):'}
                </label>
                <input
                  type="text"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder={uiLanguage === 'hi' ? 'उदा. एक अनकही प्रेम कहानी, व्यक्तिगत जीवन के संस्मरण...' : 'e.g. A journey of self-discovery...'}
                  className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-stone-800 text-xs focus:outline-none focus:border-amber-700 font-devanagari"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-xs text-stone-700 block mb-1">
                    {uiLanguage === 'hi' ? 'लेखक का नाम:' : 'Author / Pen Name:'}
                  </label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="लेखक / Author"
                    className="w-full bg-white border border-stone-300 rounded-xl p-2 text-stone-800 text-xs focus:outline-none focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-xs text-stone-700 block mb-1">
                    {uiLanguage === 'hi' ? 'शब्द संख्या लक्ष्य (Target):' : 'Word Count Target:'}
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={newTargetWords}
                    onChange={(e) => setNewTargetWords(Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded-xl p-2 text-stone-800 text-xs focus:outline-none focus:border-amber-700"
                  />
                </div>
              </div>

              {/* Cover Color theme */}
              <div>
                <label className="font-bold text-xs text-stone-700 block mb-1.5">
                  {uiLanguage === 'hi' ? 'किताब की जिल्द का रंग (Cover Theme):' : 'Book Cover Style:'}
                </label>
                <div className="flex gap-3">
                  {COVER_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColor(c.id)}
                      className={`w-10 h-14 rounded-md bg-gradient-to-b ${c.bg} border-2 transition-transform shadow-xs flex items-center justify-center ${
                        selectedColor === c.id ? 'scale-110 ring-2 ring-amber-500 border-white' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                    >
                      {selectedColor === c.id && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-medium hover:bg-stone-100"
                >
                  {uiLanguage === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-6 py-2 bg-amber-800 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{uiLanguage === 'hi' ? 'किताब बनाएं व लिखना शुरू करें' : 'Create Book & Start Writing'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Multi-Book Cards Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {books.map((b) => {
                const isActive = b.id === activeBookId;
                const bookWords = b.chapters.reduce(
                  (acc, ch) => acc + (ch.content.trim() ? ch.content.trim().split(/\s+/).length : 0),
                  0
                );
                const percent = Math.min(100, Math.round((bookWords / (b.targetWordCount || 1)) * 100));

                const colorConfig =
                  COVER_COLORS.find((c) => c.id === b.coverColor) || COVER_COLORS[0];

                return (
                  <div
                    key={b.id}
                    className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                      isActive
                        ? 'border-amber-600 ring-2 ring-amber-500/30 bg-amber-50/20'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    {/* Top Spine / Cover Banner */}
                    <div className={`p-4 bg-gradient-to-r ${colorConfig.bg} text-white relative`}>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-black/40 text-amber-200 px-2 py-0.5 rounded backdrop-blur-xs">
                          {b.genre}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" />
                            {uiLanguage === 'hi' ? 'सक्रिय पुस्तक' : 'Currently Open'}
                          </span>
                        )}
                      </div>

                      <h3 className="font-cinzel font-bold text-base mt-3 leading-snug line-clamp-2 text-amber-50">
                        {b.title}
                      </h3>
                      {b.subtitle && (
                        <p className="text-xs text-amber-200/80 line-clamp-1 italic font-devanagari mt-0.5">
                          {b.subtitle}
                        </p>
                      )}
                      <p className="text-[11px] text-amber-300/70 mt-2">
                        {b.authorName || 'लेखक'}
                      </p>
                    </div>

                    {/* Book Stats */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        {/* Word Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between text-xs text-stone-600 mb-1">
                            <span>
                              <strong>{bookWords.toLocaleString()}</strong> / {b.targetWordCount.toLocaleString()} {uiLanguage === 'hi' ? 'शब्द' : 'words'}
                            </span>
                            <span className="font-bold text-amber-900">{percent}%</span>
                          </div>
                          <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-amber-600 h-full rounded-full transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        {/* Breakdown pills */}
                        <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-1">
                          <span className="bg-stone-100 px-2 py-0.5 rounded">
                            {b.chapters.filter((c) => c.type === 'chapter').length} {uiLanguage === 'hi' ? 'अध्याय' : 'chapters'}
                          </span>
                          <span className="bg-rose-50 text-rose-800 px-2 py-0.5 rounded">
                            {b.chapters.filter((c) => c.type === 'diary').length} {uiLanguage === 'hi' ? 'डायरी नोट्स' : 'diaries'}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons row */}
                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          {/* Duplicate */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDuplicateBook(b.id);
                            }}
                            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                            title={uiLanguage === 'hi' ? 'इस किताब की प्रतिलिपि (कॉपी) बनाएं' : 'Duplicate this book'}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          {books.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  window.confirm(
                                    uiLanguage === 'hi'
                                      ? `क्या आप सचमुच "${b.title}" पुस्तक को हटाना चाहते हैं?`
                                      : `Delete book "${b.title}"?`
                                  )
                                ) {
                                  onDeleteBook(b.id);
                                }
                              }}
                              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              title={uiLanguage === 'hi' ? 'किताब हटाएं' : 'Delete Book'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Switch / Open Button */}
                        <button
                          onClick={() => {
                            onSelectBook(b.id);
                            onClose();
                          }}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            isActive
                              ? 'bg-amber-800 text-white cursor-default'
                              : 'bg-stone-100 hover:bg-amber-700 hover:text-white text-stone-800'
                          }`}
                        >
                          <span>{isActive ? (uiLanguage === 'hi' ? 'वर्तमान पुस्तक' : 'Currently Open') : (uiLanguage === 'hi' ? 'इस पर लिखें' : 'Open Book')}</span>
                          {!isActive && <ArrowRight className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add New Book Card Prompt */}
              <div
                onClick={() => setViewMode('create')}
                className="border-2 border-dashed border-stone-300 hover:border-amber-600 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-stone-50/50 hover:bg-amber-50/20 transition-all min-h-[220px] group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-2xs">
                  <Plus className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-stone-800 group-hover:text-amber-900">
                  {uiLanguage === 'hi' ? '+ एक और नई किताब जोड़ें' : '+ Add Another Book'}
                </h4>
                <p className="text-xs text-stone-500 mt-1 max-w-[200px]">
                  {uiLanguage === 'hi'
                    ? 'उपन्यास, संस्मरण या कविता की नई पांडुलिपि शुरू करें'
                    : 'Start a separate novel, poetry collection, or memoir'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-100 flex items-center justify-between text-xs">
          <span className="text-stone-500">
            {uiLanguage === 'hi' ? 'आपकी सभी किताबें लोकल स्टोरेज और क्लाउड में सुरक्षित रहती हैं' : 'All your books are persisted locally and synced with cloud'}
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
