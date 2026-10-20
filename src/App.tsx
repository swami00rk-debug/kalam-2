import React, { useState, useEffect, useRef } from 'react';
import { BookProject, Chapter, AIEngineType } from './types/manuscript';
import { INITIAL_BOOKS_LIBRARY } from './utils/sampleData';
import { syncToCloud, loadFromCloud } from './services/aiService';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AIActionToolbar } from './components/AIActionToolbar';
import { Editor } from './components/Editor';
import { GrammarModal } from './components/GrammarModal';
import { TranslationModal } from './components/TranslationModal';
import { OcrScannerModal } from './components/OcrScannerModal';
import { SummarizerModal } from './components/SummarizerModal';
import { QuotesModal } from './components/QuotesModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { BookDetailsModal } from './components/BookDetailsModal';
import { DiaryWriterModal } from './components/DiaryWriterModal';
import { BooksLibraryModal } from './components/BooksLibraryModal';
import { MultiAgentModal } from './components/MultiAgentModal';

const BOOKS_STORAGE_KEY = 'kalam_books_library_v1';
const ACTIVE_BOOK_KEY = 'kalam_active_book_id_v1';

export default function App() {
  // Multi-books library state
  const [books, setBooks] = useState<BookProject[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      // Check legacy single project key
      const legacy = localStorage.getItem('kalam_author_studio_project_v1');
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        if (parsedLegacy.chapters) {
          return [parsedLegacy, ...INITIAL_BOOKS_LIBRARY.slice(1)];
        }
      }
    } catch (e) {
      console.error('Failed to load books library', e);
    }
    return INITIAL_BOOKS_LIBRARY;
  });

  const [activeBookId, setActiveBookId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_BOOK_KEY);
      if (savedId) return savedId;
    } catch (e) {}
    return 'book-project-1';
  });

  const activeProject = books.find((b) => b.id === activeBookId) || books[0];
  const project = activeProject;

  const [uiLanguage, setUiLanguage] = useState<'hi' | 'en'>('hi');
  const [activeEngine, setActiveEngine] = useState<AIEngineType>('gemini-turbo');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Modals state
  const [isGrammarOpen, setIsGrammarOpen] = useState(false);
  const [isTranslationOpen, setIsTranslationOpen] = useState(false);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [isSummarizerOpen, setIsSummarizerOpen] = useState(false);
  const [isQuotesOpen, setIsQuotesOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [isBookDetailsOpen, setIsBookDetailsOpen] = useState(false);
  const [isDiaryWriterOpen, setIsDiaryWriterOpen] = useState(false);
  const [isBooksLibraryOpen, setIsBooksLibraryOpen] = useState(false);
  const [isMultiAgentOpen, setIsMultiAgentOpen] = useState(false);

  // Audio Speech Synthesis state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Active chapter
  const activeChapter =
    project.chapters.find((ch) => ch.id === project.activeChapterId) || project.chapters[0];

  // Save books library & activeBookId to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
      localStorage.setItem(ACTIVE_BOOK_KEY, activeBookId);
    } catch (e) {
      console.error('LocalStorage write error', e);
    }
  }, [books, activeBookId]);

  // Periodic background sync check for the current active book
  useEffect(() => {
    const timer = setTimeout(() => {
      syncToCloud(project).catch(() => {});
    }, 5000);
    return () => clearTimeout(timer);
  }, [project.chapters]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Helper to update active book
  const updateActiveBook = (updater: (prevBook: BookProject) => BookProject) => {
    setBooks((prevBooks) => {
      const targetId = activeBookId;
      return prevBooks.map((b) => (b.id === targetId ? updater(b) : b));
    });
  };

  const handleUpdateChapter = (updatedFields: Partial<Chapter>) => {
    updateActiveBook((prev) => ({
      ...prev,
      lastSavedAt: new Date().toISOString(),
      chapters: prev.chapters.map((ch) =>
        ch.id === activeChapter.id
          ? {
              ...ch,
              ...updatedFields,
              updatedAt: new Date().toISOString(),
            }
          : ch
      ),
    }));
  };

  const handleAddChapter = (type: Chapter['type']) => {
    const chapterCount = project.chapters.filter((c) => c.type === 'chapter').length;
    const diaryCount = project.chapters.filter((c) => c.type === 'diary').length;

    let newTitle = '';
    let initialContent = '';

    if (type === 'diary') {
      newTitle =
        uiLanguage === 'hi'
          ? `डायरी प्रविष्टि ${diaryCount + 1}`
          : `Diary Entry ${diaryCount + 1}`;
      initialContent =
        uiLanguage === 'hi'
          ? `दिनांक: ${new Date().toISOString().slice(0, 10)}\n\nआज के विचार, अवलोकन और घटनाक्रम...`
          : `Date: ${new Date().toISOString().slice(0, 10)}\n\nToday's thoughts, observations, and milestones...`;
    } else if (type === 'characters') {
      newTitle = uiLanguage === 'hi' ? 'नया पात्र परिचय' : 'New Character Profile';
      initialContent =
        uiLanguage === 'hi'
          ? 'नाम:\nउम्र:\nस्वभाव व भूमिका:\nपृष्ठभूमि:\nमहत्वपूर्ण संवाद:'
          : 'Name:\nAge:\nRole & Personality:\nBackstory:\nKey Dialogues:';
    } else if (type === 'notes') {
      newTitle = uiLanguage === 'hi' ? 'कथा विचार व नोट्स' : 'Story Outline & Idea';
      initialContent =
        uiLanguage === 'hi'
          ? 'कथानक का मुख्य मोड़ (Plot Twist):\nदृश्य विचार:'
          : 'Plot Twists & Scene Concepts:';
    } else {
      newTitle =
        uiLanguage === 'hi'
          ? `अध्याय ${chapterCount + 1}: नया परिच्छेद`
          : `Chapter ${chapterCount + 1}: Untitled`;
      initialContent = '';
    }

    const newId = `ch-${Date.now()}`;
    const newChapter: Chapter = {
      id: newId,
      title: newTitle,
      content: initialContent,
      type,
      status: 'draft',
      date: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateActiveBook((prev) => ({
      ...prev,
      activeChapterId: newId,
      chapters: [...prev.chapters, newChapter],
    }));
  };

  const handleDeleteChapter = (id: string) => {
    if (project.chapters.length <= 1) {
      alert(
        uiLanguage === 'hi'
          ? 'आप अपनी पुस्तक का अंतिम अध्याय नहीं हटा सकते।'
          : 'You cannot delete the last chapter of your book.'
      );
      return;
    }

    updateActiveBook((prev) => {
      const remaining = prev.chapters.filter((c) => c.id !== id);
      const nextActiveId =
        prev.activeChapterId === id ? remaining[0].id : prev.activeChapterId;
      return {
        ...prev,
        activeChapterId: nextActiveId,
        chapters: remaining,
      };
    });
  };

  // Multi-Book Library Actions
  const handleCreateNewBook = (data: {
    title: string;
    subtitle?: string;
    authorName?: string;
    genre: string;
    targetWordCount: number;
    primaryLanguage: string;
    coverColor: string;
  }) => {
    const newBookId = `book-${Date.now()}`;
    const initialChapterId = `ch-1-${Date.now()}`;
    const newBook: BookProject = {
      id: newBookId,
      title: data.title,
      subtitle: data.subtitle || '',
      authorName: data.authorName || 'लेखक',
      genre: data.genre,
      targetWordCount: data.targetWordCount,
      primaryLanguage: data.primaryLanguage,
      activeChapterId: initialChapterId,
      coverColor: data.coverColor,
      lastSavedAt: new Date().toISOString(),
      syncedToCloud: false,
      chapters: [
        {
          id: initialChapterId,
          title: uiLanguage === 'hi' ? 'अध्याय १: प्रस्तावना' : 'Chapter 1: Prologue',
          subtitle: '',
          content: '',
          type: 'chapter',
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    setBooks((prev) => [...prev, newBook]);
    setActiveBookId(newBookId);
  };

  const handleDuplicateBook = (bookId: string) => {
    const sourceBook = books.find((b) => b.id === bookId);
    if (!sourceBook) return;

    const duplicatedId = `book-copy-${Date.now()}`;
    const duplicatedBook: BookProject = {
      ...sourceBook,
      id: duplicatedId,
      title: `${sourceBook.title} (${uiLanguage === 'hi' ? 'प्रतिलिपि' : 'Copy'})`,
      chapters: sourceBook.chapters.map((ch) => ({
        ...ch,
        id: `ch-copy-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      })),
      lastSavedAt: new Date().toISOString(),
    };
    duplicatedBook.activeChapterId = duplicatedBook.chapters[0]?.id || '';

    setBooks((prev) => [...prev, duplicatedBook]);
    setActiveBookId(duplicatedId);
  };

  const handleDeleteBook = (bookId: string) => {
    if (books.length <= 1) {
      alert(
        uiLanguage === 'hi'
          ? 'आप अपनी एकमात्र किताब को नहीं हटा सकते।'
          : 'You cannot delete your only book in the library.'
      );
      return;
    }
    const remaining = books.filter((b) => b.id !== bookId);
    setBooks(remaining);
    if (activeBookId === bookId) {
      setActiveBookId(remaining[0].id);
    }
  };

  // Audio Read-Aloud
  const handleToggleAudio = () => {
    if (!window.speechSynthesis) {
      alert(uiLanguage === 'hi' ? 'आपके ब्राउज़र में ऑडियो पठन उपलब्ध नहीं है।' : 'Text-to-speech not supported.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const textToRead = `${activeChapter.title}. ${activeChapter.content}`;
    if (!textToRead.trim()) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;

    // Detect if text contains Hindi characters
    const hasHindi = /[\u0900-\u097F]/.test(textToRead);
    const voices = window.speechSynthesis.getVoices();
    if (hasHindi) {
      const hindiVoice = voices.find((v) => v.lang.includes('hi') || v.lang.includes('Hindi'));
      if (hindiVoice) utterance.voice = hindiVoice;
    }

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-stone-100 text-stone-900 overflow-hidden font-sans">
      {/* 1. Top Navbar with Multi-Book Selector */}
      <Navbar
        project={project}
        allBooks={books}
        syncing={syncing}
        onOpenSync={() => setIsSyncOpen(true)}
        onOpenBookSettings={() => setIsBookDetailsOpen(true)}
        onExport={() => setIsSyncOpen(true)}
        isFocusMode={isFocusMode}
        onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
        uiLanguage={uiLanguage}
        onToggleUiLanguage={() => setUiLanguage(uiLanguage === 'hi' ? 'en' : 'hi')}
        onOpenDiaryWriter={() => setIsDiaryWriterOpen(true)}
        onOpenBooksLibrary={() => setIsBooksLibraryOpen(true)}
        onQuickSelectBook={(bookId) => setActiveBookId(bookId)}
        activeEngine={activeEngine}
        onSelectEngine={(engine) => setActiveEngine(engine)}
      />

      {/* 2. AI Action Toolbar */}
      {!isFocusMode && (
        <AIActionToolbar
          onOpenGrammar={() => setIsGrammarOpen(true)}
          onOpenTranslation={() => setIsTranslationOpen(true)}
          onOpenOcr={() => setIsOcrOpen(true)}
          onOpenSummarizer={() => setIsSummarizerOpen(true)}
          onOpenQuotes={() => setIsQuotesOpen(true)}
          onOpenDiaryWriter={() => setIsDiaryWriterOpen(true)}
          onOpenMultiAgent={() => setIsMultiAgentOpen(true)}
          isPlayingAudio={isPlayingAudio}
          onToggleAudio={handleToggleAudio}
          uiLanguage={uiLanguage}
        />
      )}

      {/* 3. Main Workspace: Sidebar + Editor */}
      <div className="flex-1 flex overflow-hidden relative">
        {!isFocusMode && (
          <Sidebar
            project={project}
            activeChapterId={activeChapter.id}
            onSelectChapter={(id) =>
              updateActiveBook((prev) => ({ ...prev, activeChapterId: id }))
            }
            onAddChapter={handleAddChapter}
            onDeleteChapter={handleDeleteChapter}
            uiLanguage={uiLanguage}
            onOpenOcr={() => setIsOcrOpen(true)}
          />
        )}

        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          <Editor
            chapter={activeChapter}
            onUpdateChapter={handleUpdateChapter}
            uiLanguage={uiLanguage}
            onOpenGrammar={() => setIsGrammarOpen(true)}
            onOpenTranslation={() => setIsTranslationOpen(true)}
            onOpenQuotes={() => setIsQuotesOpen(true)}
            onOpenDiaryWriter={() => setIsDiaryWriterOpen(true)}
          />
        </main>
      </div>

      {/* 4. Interactive AI & System Modals */}
      {/* Multi-Book Library Shelf Modal */}
      <BooksLibraryModal
        isOpen={isBooksLibraryOpen}
        onClose={() => setIsBooksLibraryOpen(false)}
        books={books}
        activeBookId={activeBookId}
        onSelectBook={(bookId) => setActiveBookId(bookId)}
        onCreateNewBook={handleCreateNewBook}
        onDuplicateBook={handleDuplicateBook}
        onDeleteBook={handleDeleteBook}
        uiLanguage={uiLanguage}
      />

      {/* Spelling & Grammar Review Modal */}
      <GrammarModal
        isOpen={isGrammarOpen}
        onClose={() => setIsGrammarOpen(false)}
        chapterText={activeChapter.content}
        onApplyCorrection={(corrected) => handleUpdateChapter({ content: corrected })}
        uiLanguage={uiLanguage}
        engine={activeEngine}
      />

      {/* Multilingual Translation Modal */}
      <TranslationModal
        isOpen={isTranslationOpen}
        onClose={() => setIsTranslationOpen(false)}
        chapterText={activeChapter.content}
        chapterTitle={activeChapter.title}
        onReplaceContent={(newContent) => handleUpdateChapter({ content: newContent })}
        onAppendContent={(appendContent) =>
          handleUpdateChapter({ content: activeChapter.content + appendContent })
        }
        onCreateNewTranslatedChapter={(title, content) => {
          const newId = `ch-trans-${Date.now()}`;
          const newCh: Chapter = {
            id: newId,
            title,
            content,
            type: 'chapter',
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          updateActiveBook((prev) => ({
            ...prev,
            activeChapterId: newId,
            chapters: [...prev.chapters, newCh],
          }));
        }}
        uiLanguage={uiLanguage}
      />

      {/* Handwritten Diary OCR Modal */}
      <OcrScannerModal
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onAppendToCurrentChapter={(textToAppend) =>
          handleUpdateChapter({ content: activeChapter.content + textToAppend })
        }
        onCreateNewChapterFromDiary={(title, content, date) => {
          const newId = `ch-ocr-${Date.now()}`;
          const newCh: Chapter = {
            id: newId,
            title,
            content,
            type: 'diary',
            status: 'draft',
            date: date || new Date().toISOString().slice(0, 10),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          updateActiveBook((prev) => ({
            ...prev,
            activeChapterId: newId,
            chapters: [...prev.chapters, newCh],
          }));
        }}
        uiLanguage={uiLanguage}
      />

      {/* AI Summarizer Modal */}
      <SummarizerModal
        isOpen={isSummarizerOpen}
        onClose={() => setIsSummarizerOpen(false)}
        chapterText={activeChapter.content}
        chapterTitle={activeChapter.title}
        onSaveSummaryToChapter={(summaryText) => handleUpdateChapter({ summary: summaryText })}
        uiLanguage={uiLanguage}
      />

      {/* Contextual Quotes Modal */}
      <QuotesModal
        isOpen={isQuotesOpen}
        onClose={() => setIsQuotesOpen(false)}
        chapterText={activeChapter.content}
        chapterTitle={activeChapter.title}
        onSetChapterEpigraph={(quoteObj) => handleUpdateChapter({ epigraphQuote: quoteObj })}
        onInsertQuoteToContent={(quoteText) =>
          handleUpdateChapter({ content: activeChapter.content + quoteText })
        }
        uiLanguage={uiLanguage}
      />

      {/* Dedicated Personal Diary Writer Studio */}
      <DiaryWriterModal
        isOpen={isDiaryWriterOpen}
        onClose={() => setIsDiaryWriterOpen(false)}
        onSaveDiaryEntry={({ title, content, date, mood }) => {
          const newId = `ch-diary-${Date.now()}`;
          const newDiaryChapter: Chapter = {
            id: newId,
            title,
            content,
            type: 'diary',
            status: 'draft',
            date: date || new Date().toISOString().slice(0, 10),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          updateActiveBook((prev) => ({
            ...prev,
            activeChapterId: newId,
            chapters: [newDiaryChapter, ...prev.chapters],
          }));
        }}
        onConvertToChapter={(title, content) => {
          const newId = `ch-book-${Date.now()}`;
          const newBookChapter: Chapter = {
            id: newId,
            title,
            content,
            type: 'chapter',
            status: 'in_progress',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          updateActiveBook((prev) => ({
            ...prev,
            activeChapterId: newId,
            chapters: [...prev.chapters, newBookChapter],
          }));
        }}
        uiLanguage={uiLanguage}
      />

      {/* Cloud Sync & Export Modal */}
      <CloudSyncModal
        isOpen={isSyncOpen}
        onClose={() => setIsSyncOpen(false)}
        project={project}
        onRestoreProject={(restored) =>
          updateActiveBook(() => restored)
        }
        onUpdateProjectSync={(lastSyncAt) =>
          updateActiveBook((prev) => ({
            ...prev,
            syncedToCloud: true,
            lastCloudSyncAt: lastSyncAt,
          }))
        }
        uiLanguage={uiLanguage}
      />

      {/* Book Metadata & Goal Settings Modal */}
      <BookDetailsModal
        isOpen={isBookDetailsOpen}
        onClose={() => setIsBookDetailsOpen(false)}
        project={project}
        onUpdateProjectDetails={(details) =>
          updateActiveBook((prev) => ({ ...prev, ...details }))
        }
        uiLanguage={uiLanguage}
      />

      {/* Multi-Agent Problem Solving Council Modal */}
      <MultiAgentModal
        isOpen={isMultiAgentOpen}
        onClose={() => setIsMultiAgentOpen(false)}
        chapterText={activeChapter.content}
        chapterTitle={activeChapter.title}
        bookTitle={project.title}
        genre={project.genre}
        onAppendToChapter={(snippet) =>
          handleUpdateChapter({ content: activeChapter.content + snippet })
        }
        onSaveAsStoryNote={(noteTitle, noteContent) => {
          const newId = `note-${Date.now()}`;
          const newNote: Chapter = {
            id: newId,
            title: noteTitle,
            content: noteContent,
            type: 'notes',
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          updateActiveBook((prev) => ({
            ...prev,
            activeChapterId: newId,
            chapters: [...prev.chapters, newNote],
          }));
        }}
        uiLanguage={uiLanguage}
        initialEngine={activeEngine}
      />
    </div>
  );
}
