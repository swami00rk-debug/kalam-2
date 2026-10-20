import React, { useState, useRef, useEffect } from 'react';
import {
  Chapter,
} from '../types/manuscript';
import {
  Quote,
  Trash2,
  Copy,
  Check,
  Type,
  Calendar,
  Sparkles,
  Palette,
  Highlighter,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Eraser,
  ChevronDown,
} from 'lucide-react';

interface EditorProps {
  chapter: Chapter;
  onUpdateChapter: (updated: Partial<Chapter>) => void;
  uiLanguage: 'hi' | 'en';
  onOpenGrammar: () => void;
  onOpenTranslation: () => void;
  onOpenQuotes: () => void;
  onOpenDiaryWriter?: () => void;
}

export const WORD_COLORS = [
  { name: 'काला (Charcoal)', color: '#1e293b', bgClass: 'bg-slate-900', label: 'Default' },
  { name: 'शाही नीला (Royal Blue)', color: '#1d4ed8', bgClass: 'bg-blue-600', label: 'Blue' },
  { name: 'सिंदूरी लाल (Crimson)', color: '#dc2626', bgClass: 'bg-red-600', label: 'Red' },
  { name: 'गहरा हरा (Forest Green)', color: '#16a34a', bgClass: 'bg-emerald-600', label: 'Green' },
  { name: 'स्वर्णिम (Golden Amber)', color: '#d97706', bgClass: 'bg-amber-600', label: 'Amber' },
  { name: 'बैंगनी (Deep Purple)', color: '#9333ea', bgClass: 'bg-purple-600', label: 'Purple' },
  { name: 'गुलाबी (Rose Pink)', color: '#db2777', bgClass: 'bg-pink-600', label: 'Pink' },
  { name: 'फ़िरोज़ी (Teal Cyan)', color: '#0891b2', bgClass: 'bg-cyan-600', label: 'Teal' },
  { name: 'भूरा (Vintage Sepia)', color: '#78350f', bgClass: 'bg-amber-900', label: 'Sepia' },
];

export const HIGHLIGHT_COLORS = [
  { name: 'पीला (Yellow Marker)', color: '#fef08a', bgClass: 'bg-yellow-200' },
  { name: 'हरा (Mint Marker)', color: '#bbf7d0', bgClass: 'bg-emerald-200' },
  { name: 'गुलाबी (Rose Marker)', color: '#fbcfe8', bgClass: 'bg-pink-200' },
  { name: 'नीला (Sky Marker)', color: '#bae6fd', bgClass: 'bg-blue-200' },
  { name: 'हटाएं (None)', color: 'transparent', bgClass: 'bg-white border border-stone-300' },
];

export const Editor: React.FC<EditorProps> = ({
  chapter,
  onUpdateChapter,
  uiLanguage,
  onOpenGrammar,
  onOpenTranslation,
  onOpenQuotes,
  onOpenDiaryWriter,
}) => {
  const [copied, setCopied] = useState(false);
  const [fontFamily, setFontFamily] = useState<'serif' | 'devanagari' | 'sans'>('devanagari');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('lg');
  const [lineHeight, setLineHeight] = useState<'normal' | 'relaxed' | 'loose'>('relaxed');

  // Word color & highlight controls state
  const [currentColor, setCurrentColor] = useState('#1e293b');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isHighlightPickerOpen, setIsHighlightPickerOpen] = useState(false);
  const [globalInkColor, setGlobalInkColor] = useState('#1e293b');

  const contentRef = useRef<HTMLDivElement>(null);

  // Sync content when switching chapters
  useEffect(() => {
    if (contentRef.current) {
      const raw = chapter.content || '';
      // If plain text with newlines and without HTML tags, convert to paragraphs / br
      if (!raw.includes('<p>') && !raw.includes('<br>') && !raw.includes('<div>') && !raw.includes('<span')) {
        contentRef.current.innerHTML = raw ? raw.replace(/\n\n/g, '<p><br></p>').replace(/\n/g, '<br>') : '';
      } else {
        contentRef.current.innerHTML = raw;
      }
    }
  }, [chapter.id]);

  const handleInput = () => {
    if (contentRef.current) {
      onUpdateChapter({ content: contentRef.current.innerHTML });
    }
  };

  const getPlainText = (html: string) => {
    if (!html) return '';
    return html
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();
  };

  const plainContent = getPlainText(chapter.content);
  const words = plainContent ? plainContent.split(/\s+/).filter(Boolean).length : 0;
  const chars = plainContent.length;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  const handleCopyContent = () => {
    navigator.clipboard.writeText(plainContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Word Color Application
  const applyTextColor = (color: string) => {
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand('foreColor', false, color);
    setCurrentColor(color);
    setIsColorPickerOpen(false);
    if (contentRef.current) {
      onUpdateChapter({ content: contentRef.current.innerHTML });
    }
  };

  // Word Highlight Application
  const applyHighlightColor = (color: string) => {
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand('hiliteColor', false, color);
    setIsHighlightPickerOpen(false);
    if (contentRef.current) {
      onUpdateChapter({ content: contentRef.current.innerHTML });
    }
  };

  // Inline format commands (Bold, Italic, Underline)
  const applyFormat = (command: 'bold' | 'italic' | 'underline' | 'strikeThrough') => {
    document.execCommand(command, false);
    if (contentRef.current) {
      onUpdateChapter({ content: contentRef.current.innerHTML });
    }
  };

  // Clear word formatting
  const handleRemoveFormat = () => {
    document.execCommand('removeFormat', false);
    if (contentRef.current) {
      onUpdateChapter({ content: contentRef.current.innerHTML });
    }
  };

  const getFontClass = () => {
    switch (fontFamily) {
      case 'serif':
        return 'font-serif-literary';
      case 'sans':
        return 'font-sans';
      case 'devanagari':
      default:
        return 'font-devanagari';
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-sm';
      case 'base':
        return 'text-base';
      case 'xl':
        return 'text-xl';
      case 'lg':
      default:
        return 'text-lg';
    }
  };

  const getLineHeightClass = () => {
    switch (lineHeight) {
      case 'normal':
        return 'leading-normal';
      case 'loose':
        return 'leading-loose';
      case 'relaxed':
      default:
        return 'leading-relaxed';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden parchment-bg">
      {/* Top chapter settings & formatting bar */}
      <div className="bg-white/90 backdrop-blur-xs border-b border-amber-900/10 px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-stone-600 gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Chapter Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400 font-medium">
              {uiLanguage === 'hi' ? 'स्थिति:' : 'Status:'}
            </span>
            <select
              value={chapter.status}
              onChange={(e) => onUpdateChapter({ status: e.target.value as any })}
              className="bg-stone-50 border border-stone-200 rounded px-2 py-1 text-xs text-stone-700 font-medium focus:outline-none focus:border-amber-600"
            >
              <option value="draft">{uiLanguage === 'hi' ? 'प्रारूप (Draft)' : 'Draft'}</option>
              <option value="in_progress">{uiLanguage === 'hi' ? 'प्रगति पर (In Progress)' : 'In Progress'}</option>
              <option value="revised">{uiLanguage === 'hi' ? 'संशोधित (Revised)' : 'Revised'}</option>
              <option value="completed">{uiLanguage === 'hi' ? 'पूर्ण (Completed)' : 'Completed'}</option>
            </select>
          </div>

          {/* Chapter Type */}
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400 font-medium">
              {uiLanguage === 'hi' ? 'प्रकार:' : 'Type:'}
            </span>
            <select
              value={chapter.type}
              onChange={(e) => onUpdateChapter({ type: e.target.value as any })}
              className="bg-stone-50 border border-stone-200 rounded px-2 py-1 text-xs text-stone-700 font-medium focus:outline-none focus:border-amber-600"
            >
              <option value="chapter">{uiLanguage === 'hi' ? 'अध्याय (Book Chapter)' : 'Book Chapter'}</option>
              <option value="diary">{uiLanguage === 'hi' ? 'डायरी प्रविष्टि (Diary Entry)' : 'Diary Entry'}</option>
              <option value="characters">{uiLanguage === 'hi' ? 'पात्र परिचय (Character Sketch)' : 'Character Sketch'}</option>
              <option value="notes">{uiLanguage === 'hi' ? 'कथा विचार व नोट्स (Notes)' : 'Story Notes'}</option>
            </select>
          </div>

          {/* Date for diary */}
          {chapter.type === 'diary' && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-rose-600" />
              <input
                type="date"
                value={chapter.date || ''}
                onChange={(e) => onUpdateChapter({ date: e.target.value })}
                className="bg-stone-50 border border-stone-200 rounded px-2 py-0.5 text-xs text-stone-700"
              />
            </div>
          )}
        </div>

        {/* Font styling and Word Colour Tools */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* WORD COLOUR PALETTE (शब्द का रंग) */}
          <div className="relative">
            <button
              onClick={() => {
                setIsColorPickerOpen(!isColorPickerOpen);
                setIsHighlightPickerOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-stone-300 hover:bg-stone-100 bg-white font-medium text-xs text-stone-800 transition-colors shadow-2xs"
              title="Change color of selected word(s)"
            >
              <div
                className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-2xs"
                style={{ backgroundColor: currentColor }}
              />
              <span className="font-semibold">{uiLanguage === 'hi' ? 'अक्षर रंग' : 'Word Color'}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {/* Word Color Dropdown */}
            {isColorPickerOpen && (
              <div
                className="absolute right-0 mt-2 p-3 bg-white text-stone-900 rounded-xl shadow-2xl border border-stone-200 z-50 w-64 animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setIsColorPickerOpen(false)}
              >
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>{uiLanguage === 'hi' ? 'शब्द / अक्षर का रंग चुनें' : 'Select Word Color'}</span>
                  <Palette className="w-3.5 h-3.5 text-amber-700" />
                </div>
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {WORD_COLORS.map((wc) => (
                    <button
                      key={wc.color}
                      onClick={() => applyTextColor(wc.color)}
                      className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-stone-100 text-left text-[11px] transition-colors"
                      title={wc.name}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: wc.color }}
                      />
                      <span className="truncate text-stone-700">{wc.label}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Color Input */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-500 text-[11px]">{uiLanguage === 'hi' ? 'कस्टम रंग:' : 'Custom:'}</span>
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => applyTextColor(e.target.value)}
                    className="w-8 h-6 rounded cursor-pointer border border-stone-300"
                    title="Choose any custom color"
                  />
                </div>
              </div>
            )}
          </div>

          {/* HIGHLIGHTER MARKER (हाइलाइटर) */}
          <div className="relative">
            <button
              onClick={() => {
                setIsHighlightPickerOpen(!isHighlightPickerOpen);
                setIsColorPickerOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-stone-300 hover:bg-stone-100 bg-white font-medium text-xs text-stone-800 transition-colors shadow-2xs"
              title="Highlight selected word(s)"
            >
              <Highlighter className="w-3.5 h-3.5 text-amber-600" />
              <span>{uiLanguage === 'hi' ? 'हाइलाइटर' : 'Highlight'}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {/* Highlight Dropdown */}
            {isHighlightPickerOpen && (
              <div
                className="absolute right-0 mt-2 p-3 bg-white text-stone-900 rounded-xl shadow-2xl border border-stone-200 z-50 w-56 animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setIsHighlightPickerOpen(false)}
              >
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                  {uiLanguage === 'hi' ? 'हाइलाइटर मार्कर' : 'Highlighter Marker'}
                </div>
                <div className="space-y-1">
                  {HIGHLIGHT_COLORS.map((hc) => (
                    <button
                      key={hc.name}
                      onClick={() => applyHighlightColor(hc.color)}
                      className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-stone-100 text-left text-xs transition-colors"
                    >
                      <span className={`w-4 h-4 rounded-full ${hc.bgClass} shadow-2xs shrink-0`} />
                      <span className="text-stone-800 font-medium">{hc.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Inline Format Buttons: B, I, U, S, Eraser */}
          <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200 text-stone-700">
            <button
              onClick={() => applyFormat('bold')}
              className="p-1 hover:bg-white rounded transition-colors"
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applyFormat('italic')}
              className="p-1 hover:bg-white rounded transition-colors"
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applyFormat('underline')}
              className="p-1 hover:bg-white rounded transition-colors"
              title="Underline"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applyFormat('strikeThrough')}
              className="p-1 hover:bg-white rounded transition-colors"
              title="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRemoveFormat}
              className="p-1 hover:bg-white rounded text-rose-600 transition-colors"
              title="Clear formatting"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Typography font switcher */}
          <div className="hidden sm:flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200">
            <button
              onClick={() => setFontFamily('devanagari')}
              className={`px-2 py-1 rounded text-[11px] font-devanagari transition-colors ${
                fontFamily === 'devanagari' ? 'bg-white shadow-xs font-semibold text-amber-950' : 'text-stone-600'
              }`}
              title="Devanagari Font"
            >
              देवनागरी
            </button>
            <button
              onClick={() => setFontFamily('serif')}
              className={`px-2 py-1 rounded text-[11px] font-serif transition-colors ${
                fontFamily === 'serif' ? 'bg-white shadow-xs font-semibold text-amber-950' : 'text-stone-600'
              }`}
              title="Serif Literary Font"
            >
              Serif
            </button>
            <button
              onClick={() => setFontFamily('sans')}
              className={`px-2 py-1 rounded text-[11px] transition-colors ${
                fontFamily === 'sans' ? 'bg-white shadow-xs font-semibold text-amber-950' : 'text-stone-600'
              }`}
              title="Sans-serif Font"
            >
              Sans
            </button>
          </div>

          {/* Font Size */}
          <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200 text-xs">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-1.5 py-0.5 rounded text-[10px] ${fontSize === 'sm' ? 'bg-white font-bold' : ''}`}
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('base')}
              className={`px-1.5 py-0.5 rounded text-xs ${fontSize === 'base' ? 'bg-white font-bold' : ''}`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-1.5 py-0.5 rounded text-sm ${fontSize === 'lg' ? 'bg-white font-bold' : ''}`}
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xl')}
              className={`px-1.5 py-0.5 rounded text-base ${fontSize === 'xl' ? 'bg-white font-bold' : ''}`}
            >
              A++
            </button>
          </div>

          {/* Quick Copy button */}
          <button
            onClick={handleCopyContent}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 transition-colors"
            title="Copy plain text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
            <span>{copied ? (uiLanguage === 'hi' ? 'कॉपी हुआ' : 'Copied') : (uiLanguage === 'hi' ? 'कॉपी' : 'Copy')}</span>
          </button>
        </div>
      </div>

      {/* Main Parchment Paper Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 flex justify-center">
        <div className="w-full max-w-4xl parchment-sheet rounded-2xl p-8 sm:p-12 md:p-16 border border-stone-300/60 transition-all flex flex-col">
          {/* Diary Special Ribbon if this is a diary entry */}
          {chapter.type === 'diary' && (
            <div className="mb-6 p-3 bg-rose-50/80 border border-rose-200 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-base">📔</span>
                <div>
                  <span className="font-bold text-rose-950 block">
                    {uiLanguage === 'hi' ? 'लेखक की निजी डायरी प्रविष्टि' : 'Private Diary Entry'}
                  </span>
                  <span className="text-stone-500 text-[11px]">
                    {chapter.date ? `${uiLanguage === 'hi' ? 'दिनांक: ' : 'Date: '}${chapter.date}` : ''}
                  </span>
                </div>
              </div>

              {onOpenDiaryWriter && (
                <button
                  onClick={onOpenDiaryWriter}
                  className="px-3 py-1 bg-rose-700 hover:bg-rose-600 text-white rounded-lg font-medium text-[11px] shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{uiLanguage === 'hi' ? 'डायरी स्टूडियो में लिखें' : 'Open Diary Studio'}</span>
                </button>
              )}
            </div>
          )}

          {/* Chapter Title Input */}
          <div className="mb-4">
            <input
              type="text"
              value={chapter.title}
              onChange={(e) => onUpdateChapter({ title: e.target.value })}
              placeholder={uiLanguage === 'hi' ? 'अध्याय का शीर्षक...' : 'Chapter Title...'}
              className="w-full text-2xl sm:text-3xl font-bold font-cinzel text-stone-900 border-b border-transparent hover:border-stone-300 focus:border-amber-700 focus:outline-none pb-2 transition-colors bg-transparent placeholder-stone-400"
            />
          </div>

          {/* Subtitle / Context Input */}
          <div className="mb-6">
            <input
              type="text"
              value={chapter.subtitle || ''}
              onChange={(e) => onUpdateChapter({ subtitle: e.target.value })}
              placeholder={uiLanguage === 'hi' ? 'उपशीर्षक या दृश्य का विवरण (वैकल्पिक)...' : 'Subtitle or scene setting (optional)...'}
              className="w-full text-sm font-devanagari text-stone-500 italic border-b border-transparent hover:border-stone-200 focus:border-amber-600 focus:outline-none pb-1 transition-colors bg-transparent placeholder-stone-400"
            />
          </div>

          {/* Epigraph Quote Banner if present */}
          {chapter.epigraphQuote ? (
            <div className="my-6 p-4 rounded-xl bg-amber-50/70 border-l-4 border-amber-600 relative group">
              <div className="flex items-start gap-3">
                <Quote className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-stone-800 italic font-serif text-sm leading-relaxed">
                    "{chapter.epigraphQuote.quote}"
                  </p>
                  <p className="text-xs text-amber-900 font-semibold mt-1">
                    — {chapter.epigraphQuote.author}
                    {chapter.epigraphQuote.source && (
                      <span className="font-normal text-stone-500"> ({chapter.epigraphQuote.source})</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => onUpdateChapter({ epigraphQuote: undefined })}
                  className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-600 transition-opacity p-1"
                  title="Remove Epigraph Quote"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="my-2">
              <button
                onClick={onOpenQuotes}
                className="text-[11px] text-amber-800 hover:text-amber-950 flex items-center gap-1 font-medium italic transition-colors py-1"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>
                  {uiLanguage === 'hi'
                    ? '+ इस अध्याय के लिए प्रासंगिक साहित्यिक उद्धरण जोड़ें (Add Quote)'
                    : '+ Add a Literary Epigraph Quote for this chapter'}
                </span>
              </button>
            </div>
          )}

          {/* Quick Color Swatches Bar above Canvas */}
          <div className="my-2 py-1.5 px-3 bg-stone-100/70 rounded-xl border border-stone-200/80 flex items-center justify-between text-xs text-stone-600 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-stone-500 flex items-center gap-1">
                <Palette className="w-3 h-3 text-amber-600" />
                <span>{uiLanguage === 'hi' ? 'त्वरित शब्द रंग (Quick Ink):' : 'Quick Word Colors:'}</span>
              </span>
              <div className="flex items-center gap-1.5">
                {WORD_COLORS.slice(0, 6).map((wc) => (
                  <button
                    key={wc.color}
                    onClick={() => applyTextColor(wc.color)}
                    className="w-4 h-4 rounded-full border border-black/20 hover:scale-125 transition-transform shadow-2xs"
                    style={{ backgroundColor: wc.color }}
                    title={wc.name}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-stone-500">
                {uiLanguage === 'hi' ? 'हाइलाइट:' : 'Highlight:'}
              </span>
              <div className="flex items-center gap-1">
                {HIGHLIGHT_COLORS.slice(0, 4).map((hc) => (
                  <button
                    key={hc.name}
                    onClick={() => applyHighlightColor(hc.color)}
                    className={`w-3.5 h-3.5 rounded-full ${hc.bgClass} hover:scale-125 transition-transform shadow-2xs border border-stone-300`}
                    title={hc.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Rich ContentEditable Manuscript Canvas */}
          <div className="relative mt-2 flex-1">
            <div
              ref={contentRef}
              contentEditable
              onInput={handleInput}
              suppressContentEditableWarning
              className={`w-full min-h-[480px] bg-transparent focus:outline-none text-stone-800 ${getFontClass()} ${getFontSizeClass()} ${getLineHeightClass()} tracking-wide cursor-text selection:bg-amber-200 selection:text-amber-950`}
              data-placeholder={
                uiLanguage === 'hi'
                  ? 'अपनी किताब लिखना शुरू करें... किसी भी शब्द को चुनकर रंग या हाइलाइटर बदल सकते हैं।'
                  : 'Start writing your book... Select any word to apply custom colors or highlights.'
              }
            />
          </div>
        </div>
      </div>

      {/* Bottom Status & Quick Action Bar */}
      <footer className="bg-white/90 border-t border-amber-900/10 px-6 py-2 flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-medium text-stone-700">
            {words} {uiLanguage === 'hi' ? 'शब्द' : 'words'}
          </span>
          <span className="text-stone-300">•</span>
          <span>
            {chars} {uiLanguage === 'hi' ? 'वर्ण' : 'characters'}
          </span>
          <span className="text-stone-300">•</span>
          <span>
            ~{readingTime} {uiLanguage === 'hi' ? 'मिनट पठन समय' : 'min read'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
            <Palette className="w-3 h-3 text-amber-700" />
            <span>{uiLanguage === 'hi' ? 'शब्द रंग व हाइलाइटर सक्रिय है' : 'Word Coloring Active'}</span>
          </div>
          <span className="text-stone-300">•</span>
          <button
            onClick={onOpenGrammar}
            className="text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-1 transition-colors"
          >
            <span>{uiLanguage === 'hi' ? 'व्याकरण जाँचें' : 'Check Grammar'}</span>
          </button>
          <span className="text-stone-300">•</span>
          <button
            onClick={onOpenTranslation}
            className="text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1 transition-colors"
          >
            <span>{uiLanguage === 'hi' ? 'अनुवाद करें' : 'Translate'}</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
