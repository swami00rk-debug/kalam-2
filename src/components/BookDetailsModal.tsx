import React, { useState } from 'react';
import { X, Book, User, Bookmark, Award, Target, Check } from 'lucide-react';
import { BookProject } from '../types/manuscript';

interface BookDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: BookProject;
  onUpdateProjectDetails: (details: Partial<BookProject>) => void;
  uiLanguage: 'hi' | 'en';
}

export const BookDetailsModal: React.FC<BookDetailsModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProjectDetails,
  uiLanguage,
}) => {
  const [title, setTitle] = useState(project.title);
  const [subtitle, setSubtitle] = useState(project.subtitle || '');
  const [authorName, setAuthorName] = useState(project.authorName || '');
  const [genre, setGenre] = useState(project.genre || '');
  const [targetWordCount, setTargetWordCount] = useState(project.targetWordCount || 50000);
  const [primaryLanguage, setPrimaryLanguage] = useState(project.primaryLanguage || 'Hindi');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProjectDetails({
      title,
      subtitle,
      authorName,
      genre,
      targetWordCount: Number(targetWordCount),
      primaryLanguage,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-amber-900/20">
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-amber-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Book className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel font-bold text-lg text-amber-50">
                {uiLanguage === 'hi' ? 'किताब की जानकारी व सेटिंग्स' : 'Book Details & Target'}
              </h2>
              <p className="text-xs text-amber-300/80">
                {uiLanguage === 'hi' ? 'शीर्षक, लेखक का नाम और शब्द संख्या लक्ष्य निर्धारित करें' : 'Configure manuscript title, pen name, and goal'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-amber-900 text-amber-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs bg-stone-50/50">
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              {uiLanguage === 'hi' ? 'किताब का मुख्य शीर्षक (Title):' : 'Book Title:'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-800 text-sm font-semibold focus:outline-none focus:border-amber-700 font-devanagari"
            />
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">
              {uiLanguage === 'hi' ? 'उपशीर्षक / टैगलाइन (Subtitle):' : 'Subtitle / Tagline:'}
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-lg p-2 text-stone-800 text-xs focus:outline-none focus:border-amber-700 font-devanagari"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {uiLanguage === 'hi' ? 'लेखक / कलमकार (Author):' : 'Author Name:'}
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg p-2 text-stone-800 text-xs focus:outline-none focus:border-amber-700"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {uiLanguage === 'hi' ? 'विधा (Genre):' : 'Genre:'}
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="उदा. उपन्यास, संस्मरण, कविता, जीवनी"
                className="w-full bg-white border border-stone-300 rounded-lg p-2 text-stone-800 text-xs focus:outline-none focus:border-amber-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {uiLanguage === 'hi' ? 'शब्द संख्या लक्ष्य (Target Words):' : 'Target Word Count:'}
              </label>
              <input
                type="number"
                step="1000"
                value={targetWordCount}
                onChange={(e) => setTargetWordCount(Number(e.target.value))}
                className="w-full bg-white border border-stone-300 rounded-lg p-2 text-stone-800 text-xs focus:outline-none focus:border-amber-700"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {uiLanguage === 'hi' ? 'मुख्य भाषा:' : 'Primary Language:'}
              </label>
              <input
                type="text"
                value={primaryLanguage}
                onChange={(e) => setPrimaryLanguage(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg p-2 text-stone-800 text-xs focus:outline-none focus:border-amber-700"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-700 font-medium"
            >
              {uiLanguage === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-800 hover:bg-amber-700 text-white font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{uiLanguage === 'hi' ? 'सेव करें' : 'Save Details'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
