import React, { useState } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  RefreshCw,
  Download,
  Upload,
  FileText,
  FileCode,
  Printer,
  ShieldCheck,
  HardDrive,
  Database,
} from 'lucide-react';
import { BookProject } from '../types/manuscript';
import { syncToCloud, loadFromCloud } from '../services/aiService';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: BookProject;
  onRestoreProject: (restored: BookProject) => void;
  onUpdateProjectSync: (lastSyncAt: string) => void;
  uiLanguage: 'hi' | 'en';
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  project,
  onRestoreProject,
  onUpdateProjectSync,
  uiLanguage,
}) => {
  const [syncing, setSyncing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleSyncNow = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await syncToCloud(project);
      onUpdateProjectSync(res.lastSynced);
      setMessage({
        text: uiLanguage === 'hi' ? 'आपकी किताब का क्लाउड बैकअप सफलतापूर्वक सुरक्षित हो गया है!' : 'Book manuscript successfully backed up to cloud!',
        type: 'success',
      });
    } catch (err: any) {
      setMessage({
        text: err.message || (uiLanguage === 'hi' ? 'क्लाउड सिंक विफल हुआ' : 'Cloud sync failed'),
        type: 'error',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleRestoreFromCloud = async () => {
    if (!window.confirm(uiLanguage === 'hi' ? 'क्या आप क्लाउड बैकअप से किताब लोड करना चाहते हैं?' : 'Load manuscript from cloud backup?')) {
      return;
    }
    setRestoring(true);
    setMessage(null);
    try {
      const res = await loadFromCloud();
      if (res.data) {
        onRestoreProject(res.data);
        setMessage({
          text: uiLanguage === 'hi' ? 'क्लाउड बैकअप से किताब सफलतापूर्वक बहाल की गई।' : 'Manuscript restored from cloud.',
          type: 'success',
        });
      } else {
        setMessage({
          text: uiLanguage === 'hi' ? 'क्लाउड पर कोई पूर्व बैकअप नहीं मिला।' : 'No prior cloud backup found.',
          type: 'error',
        });
      }
    } catch (err: any) {
      setMessage({
        text: err.message || 'Failed to restore',
        type: 'error',
      });
    } finally {
      setRestoring(false);
    }
  };

  // Export functions
  const exportAsMarkdown = () => {
    let md = `# ${project.title}\n\n`;
    if (project.subtitle) md += `*${project.subtitle}*\n\n`;
    md += `**Author:** ${project.authorName}\n`;
    md += `**Genre:** ${project.genre}\n\n---\n\n`;

    project.chapters.forEach((ch, idx) => {
      md += `## ${ch.title}\n\n`;
      if (ch.subtitle) md += `*${ch.subtitle}*\n\n`;
      if (ch.epigraphQuote) {
        md += `> "${ch.epigraphQuote.quote}"\n> — ${ch.epigraphQuote.author}${ch.epigraphQuote.source ? ` (${ch.epigraphQuote.source})` : ''}\n\n`;
      }
      md += `${ch.content}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '_')}_Manuscript.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPlainText = () => {
    let txt = `====================================================\n`;
    txt += `${project.title}\n${project.subtitle || ''}\nलेखक / Author: ${project.authorName}\n`;
    txt += `====================================================\n\n`;

    project.chapters.forEach((ch, idx) => {
      txt += `----------------------------------------------------\n`;
      txt += `[${ch.type.toUpperCase()}] ${ch.title}\n`;
      if (ch.date) txt += `दिनांक / Date: ${ch.date}\n`;
      txt += `----------------------------------------------------\n\n`;
      if (ch.epigraphQuote) {
        txt += `"${ch.epigraphQuote.quote}"\n— ${ch.epigraphQuote.author}\n\n`;
      }
      txt += `${ch.content}\n\n\n`;
    });

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsJsonBackup = () => {
    const jsonStr = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '_')}_backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.title && Array.isArray(parsed.chapters)) {
          onRestoreProject(parsed);
          setMessage({
            text: uiLanguage === 'hi' ? 'बैकअप फ़ाइल सफलतापूर्वक लोड हुई!' : 'Backup JSON imported successfully!',
            type: 'success',
          });
        } else {
          throw new Error('Invalid manuscript format');
        }
      } catch (err) {
        setMessage({
          text: uiLanguage === 'hi' ? 'अमान्य बैकअप फ़ाइल।' : 'Invalid JSON file format.',
          type: 'error',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-amber-900/20">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel font-bold text-lg text-emerald-50">
                {uiLanguage === 'hi' ? 'क्लाउड सिंक व पुस्तक एक्सपोर्ट (Cloud Sync & Backup)' : 'Cloud Sync & Manuscript Export'}
              </h2>
              <p className="text-xs text-emerald-300/80">
                {uiLanguage === 'hi'
                  ? 'आपकी पुस्तक और डायरी का सुरक्षित क्लाउड बैकअप व विभिन्न प्रारूपों में डाउनलोड'
                  : 'Automatic backup persistence, cloud sync status, and multi-format manuscript exports'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-emerald-900 text-emerald-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`px-6 py-2.5 text-xs flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-b border-rose-200'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-rose-600" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50/50">
          {/* Cloud Sync Card */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-800">
                    {uiLanguage === 'hi' ? 'क्लाउड सिंक स्थिति (Cloud Storage Status)' : 'Cloud Manuscript Sync'}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {uiLanguage === 'hi' ? 'अंतिम क्लाउड बैकअप: ' : 'Last Cloud Backup: '}
                    <span className="font-semibold text-stone-700">
                      {project.lastCloudSyncAt ? new Date(project.lastCloudSyncAt).toLocaleString() : 'Not yet synced'}
                    </span>
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium mt-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{uiLanguage === 'hi' ? 'लोकल स्टोरेज में ऑटो-सेव सक्रिय है' : 'Auto-saving enabled in local storage'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSyncNow}
                  disabled={syncing}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  <span>{syncing ? (uiLanguage === 'hi' ? 'सिंक हो रहा है...' : 'Syncing...') : (uiLanguage === 'hi' ? 'अभी क्लाउड पर सेव करें' : 'Sync to Cloud Now')}</span>
                </button>
                <button
                  onClick={handleRestoreFromCloud}
                  disabled={restoring}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium border border-stone-200 transition-colors"
                  title="Restore from last cloud backup"
                >
                  <span>{uiLanguage === 'hi' ? 'क्लाउड से पुनः लोड करें' : 'Restore'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-500 mb-3 font-cinzel">
              {uiLanguage === 'hi' ? 'पुस्तक एक्सपोर्ट व डाउनलोड (Download Manuscript)' : 'Export Book Formats'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Markdown */}
              <button
                onClick={exportAsMarkdown}
                className="p-4 rounded-xl border border-stone-200 hover:border-amber-400 bg-white hover:bg-amber-50/30 text-left transition-all flex items-start gap-3 group"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 shrink-0 group-hover:scale-105 transition-transform">
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-stone-800 group-hover:text-amber-950">
                    {uiLanguage === 'hi' ? 'मार्कडाउन फ़ाइल (.md)' : 'Markdown Manuscript (.md)'}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {uiLanguage === 'hi' ? 'शीर्षक, उद्धरण व अध्याय संरचना सहित' : 'Standard markdown with chapter headings & quotes'}
                  </p>
                </div>
              </button>

              {/* Plain text */}
              <button
                onClick={exportAsPlainText}
                className="p-4 rounded-xl border border-stone-200 hover:border-amber-400 bg-white hover:bg-amber-50/30 text-left transition-all flex items-start gap-3 group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-800 shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-stone-800 group-hover:text-blue-950">
                    {uiLanguage === 'hi' ? 'सादा टेक्स्ट फ़ाइल (.txt)' : 'Plain Text Book (.txt)'}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {uiLanguage === 'hi' ? 'नोटपैड या किसी भी वर्ड प्रोसेसर में पढ़ने योग्य' : 'Simple readable text for any device'}
                  </p>
                </div>
              </button>

              {/* Print layout */}
              <button
                onClick={handlePrint}
                className="p-4 rounded-xl border border-stone-200 hover:border-amber-400 bg-white hover:bg-amber-50/30 text-left transition-all flex items-start gap-3 group"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0 group-hover:scale-105 transition-transform">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-stone-800 group-hover:text-emerald-950">
                    {uiLanguage === 'hi' ? 'प्रिंट / पीडीएफ लेआउट' : 'Print / Save as PDF'}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {uiLanguage === 'hi' ? 'ब्राउज़र के माध्यम से सुंदर पीडीएफ बनाएं' : 'Direct book printing via browser dialog'}
                  </p>
                </div>
              </button>

              {/* JSON Project Backup */}
              <button
                onClick={exportAsJsonBackup}
                className="p-4 rounded-xl border border-stone-200 hover:border-amber-400 bg-white hover:bg-amber-50/30 text-left transition-all flex items-start gap-3 group"
              >
                <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center text-violet-800 shrink-0 group-hover:scale-105 transition-transform">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-stone-800 group-hover:text-violet-950">
                    {uiLanguage === 'hi' ? 'संपूर्ण प्रोजेक्ट बैकअप (.json)' : 'Full Project Backup (.json)'}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {uiLanguage === 'hi' ? 'भविष्य में किसी भी ब्राउज़र में रीस्टोर करने हेतु' : 'Import back anytime with all metadata preserved'}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Import / Restore JSON file */}
          <div className="p-4 rounded-xl bg-white border border-stone-200 text-xs">
            <span className="font-bold text-stone-700 block mb-1">
              {uiLanguage === 'hi' ? 'प्रोजेक्ट बैकअप फ़ाइल इम्पोर्ट करें (Restore Backup)' : 'Restore from Backup File'}
            </span>
            <p className="text-stone-500 text-[11px] mb-2">
              {uiLanguage === 'hi'
                ? 'यदि आपके पास पूर्व में डाउनलोड की गई .json बैकअप फ़ाइल है, तो उसे यहाँ अपलोड करें:'
                : 'Upload a previously saved Kalam project .json file to restore your entire book:'}
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="text-xs text-stone-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-100 flex items-center justify-end text-xs">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-200 font-medium transition-colors"
          >
            {uiLanguage === 'hi' ? 'पूर्ण' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
