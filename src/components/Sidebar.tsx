import React, { useState } from 'react';
import {
  BookText,
  BookOpen,
  Calendar,
  FileText,
  Plus,
  Search,
  Trash2,
  Users,
  Sparkles,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  Edit3,
} from 'lucide-react';
import { Chapter, BookProject } from '../types/manuscript';

interface SidebarProps {
  project: BookProject;
  activeChapterId: string;
  onSelectChapter: (id: string) => void;
  onAddChapter: (type: 'chapter' | 'diary' | 'characters' | 'notes') => void;
  onDeleteChapter: (id: string) => void;
  uiLanguage: 'hi' | 'en';
  onOpenOcr: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  project,
  activeChapterId,
  onSelectChapter,
  onAddChapter,
  onDeleteChapter,
  uiLanguage,
  onOpenOcr,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'chapter' | 'diary' | 'characters'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChapters = project.chapters.filter((ch) => {
    const matchesFilter = filterType === 'all' || ch.type === filterType;
    const matchesSearch =
      ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: Chapter['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-2.5 h-2.5" />
            {uiLanguage === 'hi' ? 'पूर्ण' : 'Done'}
          </span>
        );
      case 'revised':
        return (
          <span className="flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
            <Edit3 className="w-2.5 h-2.5" />
            {uiLanguage === 'hi' ? 'संशोधित' : 'Revised'}
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
            <Clock className="w-2.5 h-2.5" />
            {uiLanguage === 'hi' ? 'प्रगति पर' : 'In Progress'}
          </span>
        );
      default:
        return (
          <span className="text-[10px] text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
            {uiLanguage === 'hi' ? 'प्रारूप' : 'Draft'}
          </span>
        );
    }
  };

  const getIconForType = (type: Chapter['type']) => {
    switch (type) {
      case 'diary':
        return <Calendar className="w-4 h-4 text-rose-600 shrink-0" />;
      case 'characters':
        return <Users className="w-4 h-4 text-violet-600 shrink-0" />;
      default:
        return <BookText className="w-4 h-4 text-amber-700 shrink-0" />;
    }
  };

  return (
    <aside className="w-72 lg:w-80 bg-stone-50/95 border-r border-stone-200/80 flex flex-col h-full shrink-0 select-none">
      {/* Top Header & Fast Action */}
      <div className="p-3.5 border-b border-stone-200 bg-stone-100/60">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 font-cinzel">
            {uiLanguage === 'hi' ? 'पांडुलिपि अनुभाग' : 'Manuscript Chapters'}
          </h2>
          <span className="text-[11px] bg-stone-200/80 text-stone-700 font-medium px-2 py-0.5 rounded-full">
            {project.chapters.length} {uiLanguage === 'hi' ? 'भाग' : 'items'}
          </span>
        </div>

        {/* Action Buttons: Add Chapter / Add Diary Photo */}
        <div className="grid grid-cols-2 gap-1.5 mb-2.5">
          <button
            onClick={() => onAddChapter('chapter')}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-amber-900 hover:bg-amber-800 text-amber-50 rounded-lg text-xs font-medium shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{uiLanguage === 'hi' ? '+ नया अध्याय' : '+ Chapter'}</span>
          </button>
          <button
            onClick={onOpenOcr}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-rose-800 hover:bg-rose-700 text-rose-50 rounded-lg text-xs font-medium shadow-sm transition-colors"
            title="Scan handwritten notebook/diary photo using AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-200" />
            <span>{uiLanguage === 'hi' ? 'डायरी स्कैन' : 'Scan Diary'}</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={uiLanguage === 'hi' ? 'अध्याय या प्रविष्टि खोजें...' : 'Search scenes, chapters...'}
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white rounded-lg border border-stone-300 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500 text-stone-800"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1 mt-2.5 overflow-x-auto pb-0.5 text-[11px]">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2 py-1 rounded-md whitespace-nowrap font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-amber-800 text-amber-50 shadow-xs'
                : 'bg-white hover:bg-stone-200 text-stone-600 border border-stone-200'
            }`}
          >
            {uiLanguage === 'hi' ? 'सभी' : 'All'}
          </button>
          <button
            onClick={() => setFilterType('chapter')}
            className={`px-2 py-1 rounded-md whitespace-nowrap font-medium transition-colors ${
              filterType === 'chapter'
                ? 'bg-amber-800 text-amber-50 shadow-xs'
                : 'bg-white hover:bg-stone-200 text-stone-600 border border-stone-200'
            }`}
          >
            {uiLanguage === 'hi' ? 'अध्याय' : 'Chapters'}
          </button>
          <button
            onClick={() => setFilterType('diary')}
            className={`px-2 py-1 rounded-md whitespace-nowrap font-medium transition-colors ${
              filterType === 'diary'
                ? 'bg-rose-800 text-rose-50 shadow-xs'
                : 'bg-white hover:bg-stone-200 text-stone-600 border border-stone-200'
            }`}
          >
            {uiLanguage === 'hi' ? 'डायरी' : 'Diaries'}
          </button>
          <button
            onClick={() => setFilterType('characters')}
            className={`px-2 py-1 rounded-md whitespace-nowrap font-medium transition-colors ${
              filterType === 'characters'
                ? 'bg-violet-800 text-violet-50 shadow-xs'
                : 'bg-white hover:bg-stone-200 text-stone-600 border border-stone-200'
            }`}
          >
            {uiLanguage === 'hi' ? 'पात्र' : 'Characters'}
          </button>
        </div>
      </div>

      {/* Chapters & Entries List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        {filteredChapters.length === 0 ? (
          <div className="p-6 text-center text-xs text-stone-400">
            {uiLanguage === 'hi' ? 'कोई प्रविष्टि नहीं मिली' : 'No chapters or entries found'}
          </div>
        ) : (
          filteredChapters.map((ch, idx) => {
            const isActive = ch.id === activeChapterId;
            const wordCount = ch.content.trim() ? ch.content.trim().split(/\s+/).length : 0;

            return (
              <div
                key={ch.id}
                onClick={() => onSelectChapter(ch.id)}
                className={`group p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  isActive
                    ? 'bg-amber-50/90 border-amber-400/80 shadow-xs'
                    : 'bg-white/80 hover:bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {getIconForType(ch.type)}
                    <h3
                      className={`text-xs font-semibold truncate ${
                        isActive ? 'text-amber-950 font-medium' : 'text-stone-800'
                      }`}
                    >
                      {ch.title || (uiLanguage === 'hi' ? 'अनाम प्रविष्टि' : 'Untitled Chapter')}
                    </h3>
                  </div>

                  {project.chapters.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            uiLanguage === 'hi'
                              ? `क्या आप सचमुच "${ch.title}" हटाना चाहते हैं?`
                              : `Delete "${ch.title}"?`
                          )
                        ) {
                          onDeleteChapter(ch.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 rounded transition-opacity"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Subtitle / date snippet */}
                {ch.subtitle && (
                  <p className="text-[11px] text-stone-500 truncate mt-0.5 pl-6">{ch.subtitle}</p>
                )}

                {/* Bottom stats row */}
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-stone-100 text-[10px] text-stone-400 pl-6">
                  <div className="flex items-center gap-2">
                    <span>
                      {wordCount} {uiLanguage === 'hi' ? 'शब्द' : 'words'}
                    </span>
                    {ch.date && (
                      <span className="text-stone-400">
                        • {ch.date}
                      </span>
                    )}
                  </div>
                  <div>{getStatusBadge(ch.status)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Add Other Items */}
      <div className="p-3 border-t border-stone-200 bg-stone-100/70 text-[11px] flex items-center justify-between">
        <button
          onClick={() => onAddChapter('diary')}
          className="text-stone-600 hover:text-rose-700 flex items-center gap-1 font-medium transition-colors"
        >
          <Plus className="w-3 h-3 text-rose-600" />
          <span>{uiLanguage === 'hi' ? '+ डायरी प्रविष्टि' : '+ Diary Note'}</span>
        </button>
        <button
          onClick={() => onAddChapter('characters')}
          className="text-stone-600 hover:text-violet-700 flex items-center gap-1 font-medium transition-colors"
        >
          <Plus className="w-3 h-3 text-violet-600" />
          <span>{uiLanguage === 'hi' ? '+ पात्र / विचार' : '+ Character'}</span>
        </button>
      </div>
    </aside>
  );
};
