import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Calendar,
  Sparkles,
  Clock,
  Sun,
  CloudRain,
  Moon,
  Coffee,
  Wind,
  Check,
  Bookmark,
  ArrowRight,
  Lightbulb,
  FileText,
  RotateCcw,
  Palette,
  Highlighter,
} from 'lucide-react';
import { fetchDiaryPrompts, convertDiaryToChapter } from '../services/aiService';

interface DiaryWriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDiaryEntry: (entry: {
    title: string;
    content: string;
    date: string;
    mood?: string;
  }) => void;
  onConvertToChapter: (title: string, content: string) => void;
  uiLanguage: 'hi' | 'en';
}

const MOODS = [
  { id: 'peaceful', labelHi: '☕ शांत व एकांत', labelEn: 'Peaceful Solitude', icon: Coffee },
  { id: 'nostalgic', labelHi: '🌧️ भावुक व यादें', labelEn: 'Nostalgic Memory', icon: CloudRain },
  { id: 'spark', labelHi: '💡 कहानी की प्रेरणा', labelEn: 'Story Spark', icon: Sparkles },
  { id: 'night', labelHi: '🌙 रात का चिंतन', labelEn: 'Midnight Musings', icon: Moon },
  { id: 'struggle', labelHi: '🔥 मन का द्वंद्व', labelEn: 'Inner Conflict', icon: Wind },
  { id: 'sun', labelHi: '☀️ आशा व उमंग', labelEn: 'Hope & Dawn', icon: Sun },
];

export const DiaryWriterModal: React.FC<DiaryWriterModalProps> = ({
  isOpen,
  onClose,
  onSaveDiaryEntry,
  onConvertToChapter,
  uiLanguage,
}) => {
  const todayFormatted = new Date().toISOString().slice(0, 10);
  const currentTimeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const [date, setDate] = useState(todayFormatted);
  const [time, setTime] = useState(currentTimeFormatted);
  const [selectedMood, setSelectedMood] = useState('peaceful');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [diaryInkColor, setDiaryInkColor] = useState('#1e293b');
  const [prompts, setPrompts] = useState<Array<{ promptHindi: string; promptEnglish: string; category: string }>>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);

  // Conversion to Chapter state
  const [converting, setConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState<{
    suggestedChapterTitle: string;
    subtitle?: string;
    polishedChapterContent: string;
    extractedStoryIdeas: string[];
  } | null>(null);

  // Load prompts on open
  useEffect(() => {
    if (isOpen && prompts.length === 0) {
      handleGetPrompts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGetPrompts = async (moodParam?: string) => {
    setLoadingPrompts(true);
    try {
      const res = await fetchDiaryPrompts(moodParam || selectedMood);
      setPrompts(res.prompts || []);
    } catch (e) {
      // Fallback default prompts if offline
      setPrompts([
        {
          promptHindi: 'आज ऐसा क्या हुआ जिसने मन को भीतर तक छू लिया या बेचैन किया?',
          promptEnglish: 'What happened today that deeply moved or stirred your thoughts?',
          category: 'Reflection',
        },
        {
          promptHindi: 'किताब के मुख्य पात्र के लिए आज कौन सी नई बात या दृश्य दिमाग में कौंधा?',
          promptEnglish: 'What new trait or scene flashed for your novel character today?',
          category: 'Story Spark',
        },
        {
          promptHindi: 'किस पुरानी याद या अधूरी बातचीत ने आज फिर से दस्तक दी?',
          promptEnglish: 'Which old memory or unspoken dialogue knocked on your heart today?',
          category: 'Memory',
        },
      ]);
    } finally {
      setLoadingPrompts(false);
    }
  };

  const handleApplyPrompt = (promptText: string) => {
    if (!content.trim()) {
      setContent(`प्रश्न: "${promptText}"\n\n`);
    } else {
      setContent((prev) => `${prev}\n\n[चिंतन / Reflection]: "${promptText}"\n`);
    }
  };

  const handleSave = () => {
    if (!content.trim()) {
      alert(uiLanguage === 'hi' ? 'कृपया डायरी में कुछ लिखें।' : 'Please write something in your diary entry.');
      return;
    }
    const finalTitle = title.trim() || (uiLanguage === 'hi' ? `डायरी प्रविष्टि: ${date}` : `Diary Entry: ${date}`);
    onSaveDiaryEntry({
      title: finalTitle,
      content,
      date,
      mood: selectedMood,
    });
    onClose();
  };

  const handleConvert = async () => {
    if (!content.trim()) {
      alert(uiLanguage === 'hi' ? 'रूपांतरण के लिए डायरी में कुछ विचार लिखें।' : 'Write some diary thoughts first.');
      return;
    }
    setConverting(true);
    try {
      const res = await convertDiaryToChapter(content, title, 'Literary Fiction / Memoir');
      setConversionResult(res);
    } catch (err: any) {
      alert(err.message || 'Conversion failed');
    } finally {
      setConverting(false);
    }
  };

  const handleAcceptConvertedChapter = () => {
    if (!conversionResult) return;
    onConvertToChapter(conversionResult.suggestedChapterTitle, conversionResult.polishedChapterContent);
    onClose();
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-rose-900/20 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-rose-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-700 to-amber-500 flex items-center justify-center text-white shadow-md font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-cinzel font-bold text-lg text-rose-50">
                  {uiLanguage === 'hi' ? 'लेखक की निजी डायरी (Author\'s Diary)' : 'Author\'s Personal Journal'}
                </h2>
                <span className="text-[10px] bg-rose-800/80 text-rose-200 px-2 py-0.5 rounded-full font-medium border border-rose-700">
                  {uiLanguage === 'hi' ? 'दैनिक लेखन' : 'Daily Writing'}
                </span>
              </div>
              <p className="text-xs text-rose-300/80 mt-0.5">
                {uiLanguage === 'hi'
                  ? 'दिल के जज़्बात, रोज़मर्रा के अवलोकन और किताब के लिए ताज़ा विचार यहाँ लिखें'
                  : 'Capture raw thoughts, daily scenes, and emotional sparks for your book'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-rose-900 text-rose-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date, Time & Mood Bar */}
        <div className="bg-rose-50/50 border-b border-stone-200 px-6 py-2.5 flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Date Input */}
            <div className="flex items-center gap-1.5 bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-stone-700">
              <Calendar className="w-3.5 h-3.5 text-rose-600" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none"
              />
            </div>

            {/* Time Stamp */}
            <div className="flex items-center gap-1.5 bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-stone-700">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Time"
                className="bg-transparent text-xs font-semibold focus:outline-none w-20"
              />
            </div>

            {/* Mood selector dropdown/pills */}
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium">
                {uiLanguage === 'hi' ? 'मनोदशा / मूड:' : 'Mood:'}
              </span>
              <select
                value={selectedMood}
                onChange={(e) => {
                  setSelectedMood(e.target.value);
                  handleGetPrompts(e.target.value);
                }}
                className="bg-white border border-stone-300 rounded-lg px-2 py-1 text-xs font-medium text-stone-800 focus:outline-none focus:border-rose-600"
              >
                {MOODS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {uiLanguage === 'hi' ? m.labelHi : m.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-500 text-xs font-medium">
              {wordCount} {uiLanguage === 'hi' ? 'शब्द' : 'words'}
            </span>
          </div>
        </div>

        {/* AI Thought Starters Ribbon */}
        <div className="bg-amber-50/70 border-b border-amber-200/80 px-6 py-2 flex items-center justify-between text-xs gap-2 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span className="font-bold text-amber-900">
              {uiLanguage === 'hi' ? 'AI डायरी विचार-प्रेरणा:' : 'AI Reflection Prompts:'}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            {prompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPrompt(uiLanguage === 'hi' ? p.promptHindi : p.promptEnglish)}
                className="bg-white/90 hover:bg-amber-100/90 text-amber-950 border border-amber-300 rounded-lg px-2.5 py-1 text-[11px] whitespace-nowrap transition-colors flex items-center gap-1 shadow-2xs font-medium"
                title="Click to write about this prompt"
              >
                <span>💡 {uiLanguage === 'hi' ? p.promptHindi : p.promptEnglish}</span>
              </button>
            ))}
            <button
              onClick={() => handleGetPrompts()}
              disabled={loadingPrompts}
              className="p-1 text-amber-800 hover:text-amber-950 transition-colors"
              title="Refresh prompts"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loadingPrompts ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Canvas Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-100 flex justify-center">
          {conversionResult ? (
            /* Converted Chapter Preview */
            <div className="w-full max-w-3xl bg-white rounded-2xl p-6 sm:p-8 border border-stone-300 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2 text-rose-900">
                  <Sparkles className="w-5 h-5 text-rose-600" />
                  <h3 className="font-bold text-base font-cinzel">
                    {uiLanguage === 'hi' ? 'डायरी से तैयार किया गया किताबी परिच्छेद' : 'Transformed Book Chapter Scene'}
                  </h3>
                </div>
                <button
                  onClick={() => setConversionResult(null)}
                  className="text-xs text-stone-500 hover:text-stone-800"
                >
                  {uiLanguage === 'hi' ? 'वापस डायरी पर जाएँ' : 'Back to Diary'}
                </button>
              </div>

              <div>
                <h4 className="text-xl font-bold font-cinzel text-stone-900">
                  {conversionResult.suggestedChapterTitle}
                </h4>
                {conversionResult.subtitle && (
                  <p className="text-xs italic text-stone-500 mt-0.5">{conversionResult.subtitle}</p>
                )}
              </div>

              {/* Extracted story ideas */}
              {conversionResult.extractedStoryIdeas?.length > 0 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                  <span className="font-bold text-amber-900 block mb-1">
                    {uiLanguage === 'hi' ? 'डायरी से निकाले गए उपन्यास के विचार (Extracted Ideas):' : 'Extracted Novel Sparks:'}
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-stone-700">
                    {conversionResult.extractedStoryIdeas.map((idea, i) => (
                      <li key={i}>{idea}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-sm leading-relaxed font-devanagari text-stone-800 whitespace-pre-wrap max-h-80 overflow-y-auto">
                {conversionResult.polishedChapterContent}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setConversionResult(null)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-medium text-stone-700"
                >
                  {uiLanguage === 'hi' ? 'संशोधन करें' : 'Keep Editing Diary'}
                </button>
                <button
                  onClick={handleAcceptConvertedChapter}
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{uiLanguage === 'hi' ? 'इस अध्याय को पुस्तक में शामिल करें' : 'Add Chapter to Book'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Nostalgic Ruled Notebook Paper Canvas */
            <div className="w-full max-w-3xl bg-[#fdfcf7] rounded-2xl shadow-md border border-stone-300/80 p-8 sm:p-12 relative flex flex-col">
              {/* Notebook Left Margin Line */}
              <div className="absolute left-10 sm:left-14 top-0 bottom-0 w-0.5 bg-rose-300/70 pointer-events-none" />

              {/* Diary Title */}
              <div className="pl-6 sm:pl-10 mb-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    uiLanguage === 'hi'
                      ? 'डायरी का शीर्षक (उदा. उस चाय की दुकान पर बीती शाम)...'
                      : 'Diary Heading (e.g. An evening at the corner tea stall)...'
                  }
                  className="w-full text-xl sm:text-2xl font-bold font-devanagari text-stone-900 border-b border-stone-200 focus:border-rose-600 focus:outline-none pb-2 bg-transparent placeholder-stone-400"
                />
              </div>

              {/* Diary Ink Color Picker Bar */}
              <div className="pl-6 sm:pl-10 mb-3 flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 text-rose-600" />
                  <span className="font-semibold text-stone-600 text-[11px]">
                    {uiLanguage === 'hi' ? 'स्याही का रंग (Ink Color):' : 'Pen Ink Color:'}
                  </span>
                  <div className="flex items-center gap-1.5 ml-1">
                    {[
                      { color: '#1e293b', label: 'Black' },
                      { color: '#1d4ed8', label: 'Royal Blue' },
                      { color: '#dc2626', label: 'Crimson' },
                      { color: '#16a34a', label: 'Emerald' },
                      { color: '#78350f', label: 'Sepia' },
                      { color: '#9333ea', label: 'Violet' },
                    ].map((c) => (
                      <button
                        key={c.color}
                        type="button"
                        onClick={() => setDiaryInkColor(c.color)}
                        className={`w-4 h-4 rounded-full border border-black/20 transition-transform ${
                          diaryInkColor === c.color ? 'scale-125 ring-2 ring-rose-400' : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: c.color }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Diary Entry Textarea */}
              <div className="pl-6 sm:pl-10 flex-1">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    uiLanguage === 'hi'
                      ? 'आज क्या महसूस हुआ? जो बातें किसी से नहीं कही जा सकतीं, वे डायरी के इन पन्नों पर बेझिझक लिखें... यहाँ से आपकी किताब के सबसे सच्चे किरदार और दृश्य जन्म लेंगे।'
                      : 'Write your thoughts freely... The feelings, dialogues, and secrets written here become the truest moments in your book.'
                  }
                  rows={14}
                  className="w-full bg-transparent resize-none focus:outline-none font-devanagari text-base sm:text-lg leading-relaxed placeholder-stone-400/80"
                  style={{ minHeight: '320px', color: diaryInkColor }}
                />
              </div>

              {/* Signature / Author Footer line */}
              <div className="pl-6 sm:pl-10 pt-4 mt-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-400 italic">
                <span>~ {uiLanguage === 'hi' ? 'डायरी के अंतरंग पन्ने' : 'Private Journal Pages'}</span>
                <span>{date} | {time}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!conversionResult && (
          <div className="p-4 border-t border-stone-200 bg-stone-100 flex items-center justify-between flex-wrap gap-2 text-xs">
            <button
              onClick={handleConvert}
              disabled={converting || !content.trim()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-700 hover:from-amber-500 hover:to-rose-600 text-white font-semibold shadow-xs transition-all disabled:opacity-50"
              title="AI expands and polishes this diary entry into a literary book chapter"
            >
              <Sparkles className={`w-3.5 h-3.5 ${converting ? 'animate-spin' : ''}`} />
              <span>{converting ? (uiLanguage === 'hi' ? 'अध्याय में ढाला जा रहा है...' : 'Transforming...') : (uiLanguage === 'hi' ? 'इसे किताब के अध्याय में बदलें (Convert to Chapter)' : 'Convert to Book Chapter')}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-200 font-medium"
              >
                {uiLanguage === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                onClick={handleSave}
                disabled={!content.trim()}
                className="px-5 py-2 bg-rose-800 hover:bg-rose-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{uiLanguage === 'hi' ? 'डायरी में सहेजें (Save Diary)' : 'Save to Diary'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
