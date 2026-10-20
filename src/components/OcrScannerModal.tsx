import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  UploadCloud,
  FileImage,
  Sparkles,
  ArrowRight,
  Check,
  Copy,
  AlertCircle,
  BookOpen,
  Calendar,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { OcrDiaryResult } from '../types/manuscript';
import { scanDiaryOcr } from '../services/aiService';
import { createSampleHandwrittenDiarySvg } from '../utils/sampleData';

interface OcrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppendToCurrentChapter: (text: string) => void;
  onCreateNewChapterFromDiary: (title: string, content: string, date?: string) => void;
  uiLanguage: 'hi' | 'en';
}

export const OcrScannerModal: React.FC<OcrScannerModalProps> = ({
  isOpen,
  onClose,
  onAppendToCurrentChapter,
  onCreateNewChapterFromDiary,
  uiLanguage,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OcrDiaryResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'formatted' | 'raw'>('formatted');
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedImage(base64);
      setResult(null);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleUseSample = (lang: 'hindi' | 'english') => {
    const sampleSvg = createSampleHandwrittenDiarySvg(lang);
    setSelectedImage(sampleSvg);
    setMimeType('image/svg+xml');
    setResult(null);
    setErrorMsg(null);
  };

  const handleStartCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      alert(uiLanguage === 'hi' ? 'कैमरा खोलने में असमर्थ। कृपया फोटो अपलोड करें।' : 'Could not access camera. Please upload an image.');
      setIsCameraActive(false);
    }
  };

  const handleCaptureCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setSelectedImage(dataUrl);
      setMimeType('image/jpeg');
    }
    // Stop camera stream
    const stream = videoRef.current.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
    setIsCameraActive(false);
  };

  const handleCancelCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
    }
    setIsCameraActive(false);
  };

  const handleProcessOCR = async () => {
    if (!selectedImage) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const ocrData = await scanDiaryOcr(selectedImage, mimeType, 'Author personal handwritten diary page');
      setResult({
        ...ocrData,
        sourceImagePreview: selectedImage,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Diary OCR failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = activeTab === 'formatted' ? result.formattedChapterText : result.rawTranscription;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateNewChapter = () => {
    if (!result) return;
    const title = result.detectedTitle || (uiLanguage === 'hi' ? 'डायरी से नया अध्याय' : 'Chapter from Diary Notes');
    onCreateNewChapterFromDiary(title, result.formattedChapterText, result.detectedDate);
    onClose();
  };

  const handleAppend = () => {
    if (!result) return;
    const header = result.detectedDate ? `\n\n[डायरी प्रविष्टि: ${result.detectedDate}]\n\n` : '\n\n';
    onAppendToCurrentChapter(header + result.formattedChapterText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-rose-900/20">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-rose-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-300">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel font-bold text-lg text-rose-50">
                {uiLanguage === 'hi' ? 'डायरी फोटो स्कैनर व डिजिटल रूपांतरण (Diary OCR)' : 'Handwritten Diary OCR Scanner'}
              </h2>
              <p className="text-xs text-rose-300/80">
                {uiLanguage === 'hi'
                  ? 'हाथ से लिखी डायरी या नोटबुक की फोटो को साफ, व्यवस्थित किताबी अध्याय में बदलें'
                  : 'Convert handwritten diary pages, cursive notes, & journals into publication-ready book chapters'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-rose-900 text-rose-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50">
          {isCameraActive ? (
            <div className="flex flex-col items-center justify-center p-6 bg-black rounded-xl">
              <video ref={videoRef} className="w-full max-w-md rounded-lg mb-4" playsInline autoPlay />
              <div className="flex gap-3">
                <button
                  onClick={handleCaptureCamera}
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>{uiLanguage === 'hi' ? 'फोटो खींचें (Snap Photo)' : 'Capture Photo'}</span>
                </button>
                <button
                  onClick={handleCancelCamera}
                  className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white rounded-xl text-sm font-medium"
                >
                  {uiLanguage === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
              </div>
            </div>
          ) : !selectedImage ? (
            /* Upload & Sample State */
            <div className="space-y-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-rose-300/80 hover:border-rose-500 bg-rose-50/30 hover:bg-rose-50/70 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-700 mb-3 group-hover:scale-105 transition-transform shadow-xs">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-stone-800 text-base mb-1">
                  {uiLanguage === 'hi' ? 'अपनी हाथ से लिखी डायरी का फोटो अपलोड करें' : 'Upload Handwritten Diary Photo'}
                </h3>
                <p className="text-xs text-stone-500 max-w-md mb-4 leading-relaxed">
                  {uiLanguage === 'hi'
                    ? 'हिंदी देवनागरी लिखावट, अंग्रेजी कर्सिव, या डायरी के पन्नों की फोटो यहाँ खींचें या चुनें (JPG, PNG, WEBP)'
                    : 'Supports Hindi Devanagari handwriting, English cursive, notebook margins, and mixed journal scribbles'}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
                  >
                    <FileImage className="w-3.5 h-3.5" />
                    <span>{uiLanguage === 'hi' ? 'गैलरी / फाइल से चुनें' : 'Choose File'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartCamera();
                    }}
                    className="px-4 py-2 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5 text-rose-600" />
                    <span>{uiLanguage === 'hi' ? 'कैमरा से खींचें' : 'Take Photo'}</span>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Sample Preloaded Diary options for Instant Testing */}
              <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-stone-500">
                      {uiLanguage === 'hi' ? 'तुरंत परीक्षण के लिए नमूना डायरी (Instant Sample)' : 'Instant Test Samples'}
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      {uiLanguage === 'hi'
                        ? 'यदि अभी आपके पास डायरी की फोटो नहीं है, तो इन नमूनों से AI की सटीकता देखें:'
                        : 'No notebook photo handy? Try with these pre-rendered handwritten diary samples:'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleUseSample('hindi')}
                    className="p-3.5 rounded-xl border border-rose-200 hover:border-rose-400 bg-rose-50/40 hover:bg-rose-50 text-left transition-all flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center font-serif text-lg font-bold text-amber-900 shrink-0">
                      अ
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-800 group-hover:text-rose-900">
                        {uiLanguage === 'hi' ? 'हिंदी हस्तलिखित डायरी नमूना' : 'Hindi Handwritten Diary Sample'}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {uiLanguage === 'hi' ? '१५ अक्टूबर की प्रविष्टि, नोटबुक लाइनें व हाशिए के नोट्स' : 'Lined vintage paper with Hindi diary entry'}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleUseSample('english')}
                    className="p-3.5 rounded-xl border border-blue-200 hover:border-blue-400 bg-blue-50/40 hover:bg-blue-50 text-left transition-all flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 border border-blue-300 flex items-center justify-center font-serif text-lg font-bold text-blue-900 shrink-0">
                      A
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-800 group-hover:text-blue-900">
                        {uiLanguage === 'hi' ? 'अंग्रेजी कर्सिव डायरी नमूना' : 'English Cursive Journal Sample'}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {uiLanguage === 'hi' ? 'कर्सिव राइटिंग व उपन्यास के विचार' : 'Cursive midnight thoughts for novel chapter'}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Image Preview & OCR Results */
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Left Side: Diary Photo Preview */}
                <div className="bg-white rounded-xl p-4 border border-stone-300/80 shadow-xs flex flex-col">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-100 text-xs">
                    <span className="font-bold text-stone-600 flex items-center gap-1.5">
                      <FileImage className="w-4 h-4 text-rose-600" />
                      <span>{uiLanguage === 'hi' ? 'डायरी का मूल फोटो' : 'Uploaded Diary Page'}</span>
                    </span>
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setResult(null);
                      }}
                      className="text-stone-400 hover:text-stone-700 text-xs font-medium"
                    >
                      {uiLanguage === 'hi' ? 'दूसरा फोटो चुनें' : 'Change Image'}
                    </button>
                  </div>

                  <div className="max-h-[380px] overflow-hidden rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center p-2">
                    <img
                      src={selectedImage}
                      alt="Handwritten Diary"
                      className="max-h-[360px] w-auto object-contain rounded shadow-xs"
                    />
                  </div>

                  {!result && !loading && (
                    <button
                      onClick={handleProcessOCR}
                      className="mt-4 w-full py-2.5 bg-rose-700 hover:bg-rose-600 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{uiLanguage === 'hi' ? 'AI द्वारा स्कैन व रूपांतरण करें' : 'Digitize & Format with AI'}</span>
                    </button>
                  )}
                </div>

                {/* Right Side: Transcription & Book Format */}
                <div className="bg-white rounded-xl p-4 border border-stone-300/80 shadow-xs flex flex-col min-h-[440px]">
                  {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                      <div className="w-12 h-12 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mb-4" />
                      <h4 className="font-bold text-stone-800 text-sm">
                        {uiLanguage === 'hi'
                          ? 'हस्तलिखित डायरी का विश्लेषण व रूपांतरण हो रहा है...'
                          : 'Scanning handwriting & formatting into book chapter...'}
                      </h4>
                      <p className="text-xs text-stone-500 mt-1 max-w-xs">
                        {uiLanguage === 'hi'
                          ? 'लिखावट को पहचान कर उसे सुंदर पैराग्राफ और शुद्ध वर्तनी में ढाला जा रहा है।'
                          : 'Gemini is reading cursive/Devanagari handwriting, repairing scribbles, and structuring paragraphs.'}
                      </p>
                    </div>
                  ) : errorMsg ? (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                      <p className="font-semibold">{errorMsg}</p>
                      <button
                        onClick={handleProcessOCR}
                        className="mt-2 text-rose-700 underline font-medium hover:text-rose-900"
                      >
                        {uiLanguage === 'hi' ? 'पुनः प्रयास करें' : 'Retry'}
                      </button>
                    </div>
                  ) : result ? (
                    <div className="flex-1 flex flex-col space-y-3">
                      {/* Detection Stats & Tags */}
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-stone-100 text-xs">
                        <div className="flex items-center gap-2">
                          {result.detectedDate && (
                            <span className="flex items-center gap-1 text-[11px] bg-rose-50 text-rose-800 px-2 py-0.5 rounded font-semibold border border-rose-200">
                              <Calendar className="w-3 h-3 text-rose-600" />
                              {result.detectedDate}
                            </span>
                          )}
                          <span className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-medium">
                            {result.detectedLanguage}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              result.confidence === 'high'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {result.confidence.toUpperCase()} CONFIDENCE
                          </span>
                        </div>

                        {/* Tabs: Formatted Book vs Raw Transcription */}
                        <div className="flex bg-stone-100 p-0.5 rounded-lg text-xs font-medium">
                          <button
                            onClick={() => setActiveTab('formatted')}
                            className={`px-2.5 py-1 rounded-md transition-colors ${
                              activeTab === 'formatted' ? 'bg-white shadow-xs text-rose-900 font-bold' : 'text-stone-600'
                            }`}
                          >
                            {uiLanguage === 'hi' ? 'किताबी स्वरूप (Formatted)' : 'Book Ready'}
                          </button>
                          <button
                            onClick={() => setActiveTab('raw')}
                            className={`px-2.5 py-1 rounded-md transition-colors ${
                              activeTab === 'raw' ? 'bg-white shadow-xs text-rose-900 font-bold' : 'text-stone-600'
                            }`}
                          >
                            {uiLanguage === 'hi' ? 'मूल लिखावट (Raw)' : 'Raw Line-by-Line'}
                          </button>
                        </div>
                      </div>

                      {/* Title Suggestion */}
                      {result.detectedTitle && (
                        <div className="text-xs text-stone-500 font-medium">
                          <span className="font-bold text-stone-700">
                            {uiLanguage === 'hi' ? 'सुझाया गया शीर्षक: ' : 'Suggested Title: '}
                          </span>
                          <span className="text-rose-900 font-semibold">{result.detectedTitle}</span>
                        </div>
                      )}

                      {/* Transcribed Text Display */}
                      <div className="flex-1 max-h-64 overflow-y-auto p-3.5 bg-stone-50 rounded-lg border border-stone-200 text-xs sm:text-sm text-stone-800 font-devanagari leading-relaxed whitespace-pre-wrap">
                        {activeTab === 'formatted' ? result.formattedChapterText : result.rawTranscription}
                      </div>

                      {/* Unclear Words or Margin Notes if detected */}
                      {result.unclearWords && result.unclearWords.length > 0 && (
                        <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" />
                          <div>
                            <span className="font-bold">
                              {uiLanguage === 'hi' ? 'कठिन शब्द / हाशिए के नोट्स: ' : 'Margin Notes / Uncertain words: '}
                            </span>
                            {result.unclearWords.join(', ')}
                          </div>
                        </div>
                      )}

                      {/* Quick copy */}
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={handleCopy}
                          className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 transition-colors"
                        >
                          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copied ? (uiLanguage === 'hi' ? 'कॉपी हुआ' : 'Copied') : (uiLanguage === 'hi' ? 'कॉपी करें' : 'Copy Text')}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-stone-400">
                      <Sparkles className="w-10 h-10 text-stone-300 mb-2" />
                      <p className="text-xs">
                        {uiLanguage === 'hi'
                          ? 'बाएं ओर "AI द्वारा स्कैन व रूपांतरण करें" बटन दबाएं'
                          : 'Click Digitize on the left to extract handwritten text'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {result && (
          <div className="p-4 border-t border-stone-200 bg-stone-100 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-stone-500">
              {uiLanguage === 'hi' ? 'डिजिटाइज्ड डायरी को पुस्तक में कहाँ जोड़ना चाहते हैं?' : 'How would you like to incorporate this digitised diary entry?'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAppend}
                className="px-3.5 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-200 text-stone-700 font-medium transition-colors"
              >
                {uiLanguage === 'hi' ? 'मौजूदा अध्याय में जोड़ें' : 'Append to Current Chapter'}
              </button>
              <button
                onClick={handleCreateNewChapter}
                className="px-4 py-1.5 rounded-lg bg-rose-800 hover:bg-rose-700 text-white font-semibold shadow-xs transition-colors"
              >
                {uiLanguage === 'hi' ? 'नया अध्याय बनाएं (New Chapter)' : 'Create as New Chapter'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
