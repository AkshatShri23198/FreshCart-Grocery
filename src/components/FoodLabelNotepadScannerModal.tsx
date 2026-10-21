import React, { useState, useRef, useEffect } from 'react';
import { PantryItem, ShoppingItem, CategoryType, LocationType } from '../types';
import { useTheme } from '../context/ThemeContext';
import { 
  X, 
  Camera, 
  Upload, 
  FileText, 
  Sparkles, 
  Check, 
  Copy, 
  Download, 
  Plus, 
  ShoppingCart, 
  Package, 
  RefreshCw,
  Info
} from 'lucide-react';

interface FoodLabelNotepadScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPantryItems: (items: Omit<PantryItem, 'id'>[]) => void;
  onAddShoppingItems: (items: Omit<ShoppingItem, 'id'>[]) => void;
}

interface ScannedProduct {
  name: string;
  category: CategoryType;
  location: LocationType;
  quantity: number;
  unit: string;
  estimatedPcs?: string;
  price: number;
  expirationDaysFromNow?: number | null;
  nutritionHighlights?: string;
  rawNotepadLine?: string;
}

export const FoodLabelNotepadScannerModal: React.FC<FoodLabelNotepadScannerModalProps> = ({
  isOpen,
  onClose,
  onAddPantryItems,
  onAddShoppingItems,
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'camera' | 'notepad_file' | 'notepad_view'>('camera');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [notepadContent, setNotepadContent] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedProduct[]>([]);
  const [notepadSummary, setNotepadSummary] = useState<string>('');
  const [selectedItemIndices, setSelectedItemIndices] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Camera handling
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      showToast('Camera access permission denied or unavailable.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setImageSrc(dataUrl);
      stopCamera();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setImageSrc(evt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setNotepadContent(evt.target.result as string);
        showToast(`Loaded ${file.name} successfully!`);
      }
    };
    reader.readAsText(file);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleScan = async (targetDestination: 'pantry' | 'shopping' = 'pantry') => {
    if (!imageSrc && !notepadContent.trim()) {
      showToast('Please take/upload a photo of a label or enter notepad text.');
      return;
    }

    setIsScanning(true);
    try {
      const response = await fetch('/api/ai/scan-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageSrc || undefined,
          notepadText: notepadContent.trim() || undefined,
          targetDestination,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to scan food label');
      }

      const data = await response.json();
      const items: ScannedProduct[] = data.scannedItems || [];
      setScannedItems(items);
      setNotepadSummary(data.notepadNotes || '');
      setSelectedItemIndices(items.map((_, idx) => idx));
      setActiveTab('notepad_view');
      showToast(`Scanned ${items.length} item(s) successfully!`);
    } catch (err: any) {
      console.error('Scan error:', err);
      showToast('Error scanning label. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddSelectedToPantry = () => {
    const selected = scannedItems.filter((_, idx) => selectedItemIndices.includes(idx));
    if (selected.length === 0) return;

    const todayStr = '2026-07-23';
    const newItems: Omit<PantryItem, 'id'>[] = selected.map((item) => {
      let expDate: string | undefined = undefined;
      if (item.expirationDaysFromNow && item.expirationDaysFromNow > 0) {
        const d = new Date('2026-07-23T00:00:00');
        d.setDate(d.getDate() + item.expirationDaysFromNow);
        expDate = d.toISOString().split('T')[0];
      }

      return {
        name: item.name,
        category: item.category || 'Produce',
        location: item.location || 'Fridge',
        quantity: item.quantity || 1,
        unit: item.unit || 'pack',
        estimatedPcs: item.estimatedPcs || undefined,
        expirationDate: expDate,
        purchaseDate: todayStr,
        price: item.price || 50,
        lowStockThreshold: 1,
        notes: item.nutritionHighlights || 'Added via Food Label Scanner',
      };
    });

    onAddPantryItems(newItems);
    showToast(`Added ${newItems.length} item(s) directly to Pantry!`);
    onClose();
  };

  const handleAddSelectedToShopping = () => {
    const selected = scannedItems.filter((_, idx) => selectedItemIndices.includes(idx));
    if (selected.length === 0) return;

    const newItems: Omit<ShoppingItem, 'id'>[] = selected.map((item) => ({
      name: item.name,
      category: item.category || 'Produce',
      quantity: item.quantity || 1,
      unit: item.unit || 'pack',
      estimatedPcs: item.estimatedPcs || undefined,
      estimatedPrice: item.price || 50,
      isPurchased: false,
      priority: 'medium',
      notes: item.nutritionHighlights || 'Added via Label Scan',
    }));

    onAddShoppingItems(newItems);
    showToast(`Added ${newItems.length} item(s) to Shopping List!`);
    onClose();
  };

  const handleDownloadNotepad = () => {
    const textToSave = notepadSummary || notepadContent || 'Food Label Scan Log';
    const blob = new Blob([textToSave], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `food_label_notes_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Notepad text file downloaded!');
  };

  const handleCopyNotepad = () => {
    const textToCopy = notepadSummary || notepadContent;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied to clipboard!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className={`${theme.modalBg} w-full max-w-3xl rounded-[2.5rem] shadow-2xl border ${theme.cardBorder} overflow-hidden my-auto flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className={`p-5 sm:p-6 ${theme.modalHeaderBg} text-white flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-2xl border border-emerald-400/30 text-emerald-300">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <span>Food Label Photo & Notepad Scanner</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                  AI OCR
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Snap food labels, upload photos, or import Notepad text files to extract accurate items & pcs!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-slate-300 hover:text-white p-2 rounded-2xl bg-white/10 hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-emerald-500 text-white text-xs font-bold py-2 px-4 text-center animate-fade-in">
            {toastMessage}
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-4 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('camera');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs transition-all border-b-2 ${
              activeTab === 'camera'
                ? 'bg-white text-emerald-900 border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 border-transparent'
            }`}
          >
            <Camera className="w-4 h-4 text-emerald-600" />
            <span>1. Food Label Photo / Camera</span>
          </button>

          <button
            onClick={() => {
              stopCamera();
              setActiveTab('notepad_file');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs transition-all border-b-2 ${
              activeTab === 'notepad_file'
                ? 'bg-white text-emerald-900 border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 border-transparent'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-600" />
            <span>2. Notepad Text / File (.txt)</span>
          </button>

          <button
            onClick={() => {
              stopCamera();
              setActiveTab('notepad_view');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs transition-all border-b-2 ${
              activeTab === 'notepad_view'
                ? 'bg-white text-emerald-900 border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 border-transparent'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>3. Scanned Notepad & Pcs ({scannedItems.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: CAMERA & PHOTO UPLOAD */}
          {activeTab === 'camera' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Take a photo of nutrition facts / label or select an image file:
                </span>
                {!isCameraActive ? (
                  <button
                    onClick={startCamera}
                    className="px-3.5 py-1.5 bg-emerald-900 text-white font-bold text-xs rounded-xl hover:bg-emerald-800 transition-all flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Open Live Web Camera</span>
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="px-3 py-1 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-300"
                  >
                    Close Camera
                  </button>
                )}
              </div>

              {/* Camera Video Stream */}
              {isCameraActive && (
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border-2 border-emerald-500 max-h-64 flex items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover max-h-64" />
                  <button
                    onClick={capturePhoto}
                    className="absolute bottom-4 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-full shadow-lg flex items-center gap-2 text-xs"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Snap Food Label Photo</span>
                  </button>
                </div>
              )}

              {/* Uploaded / Captured Image Preview */}
              {imageSrc ? (
                <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 p-3 flex flex-col items-center gap-3">
                  <img
                    src={imageSrc}
                    alt="Food Label Preview"
                    className="max-h-56 object-contain rounded-xl border border-slate-300 shadow-xs"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setImageSrc(null)}
                      className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl"
                    >
                      Clear Image
                    </button>
                    <button
                      onClick={() => handleScan('pantry')}
                      disabled={isScanning}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md flex items-center gap-2"
                    >
                      {isScanning ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>AI Scanning Food Label...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>AI Extract Items & Pcs</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Drag & Drop Image Box */
                <label className="border-2 border-dashed border-emerald-300/80 hover:border-emerald-500 bg-emerald-50/30 hover:bg-emerald-50/60 rounded-[2rem] p-8 flex flex-col items-center justify-center cursor-pointer transition-all text-center">
                  <Upload className="w-10 h-10 text-emerald-600 mb-2" />
                  <span className="font-bold text-slate-800 text-sm">Upload Food Label Image</span>
                  <span className="text-xs text-slate-500 mt-1">Supports JPG, PNG, WEBP photo of packages or labels</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}

          {/* TAB 2: NOTEPAD FILE / TEXT IMPORT */}
          {activeTab === 'notepad_file' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Import text file (.txt, .md) or paste raw notepad notes:
                </span>
                <label className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Browse Notepad (.txt) File</span>
                  <input type="file" accept=".txt,.md,.text" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <textarea
                value={notepadContent}
                onChange={(e) => setNotepadContent(e.target.value)}
                placeholder={`Paste your Notepad text notes here... E.g.:
Amul Toned Milk Pack - 2 Liters (2 Accurate Pcs) - Expiry 7 days
Dark Fantasy Biscuits Box - 3 Packs (36 Accurate Pcs)
Organic Eggs - 1 Tray (12 Pcs) - ₹90`}
                className="w-full h-44 p-4 border border-slate-300 rounded-2xl text-xs font-mono bg-slate-900 text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setNotepadContent('')}
                  className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Clear Notes
                </button>
                <button
                  onClick={() => handleScan('pantry')}
                  disabled={isScanning || !notepadContent.trim()}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-slate-950 font-bold text-xs rounded-2xl shadow-md flex items-center gap-2"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Parsing Notepad Notes...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>Extract Items & Pcs from Notepad</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: NOTEPAD VIEW & SCANNED ITEMS */}
          {activeTab === 'notepad_view' && (
            <div className="space-y-5">
              {/* Notepad Output Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-amber-200 space-y-3 font-mono text-xs shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-amber-400 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Food Label Notepad Log (.txt)</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyNotepad}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-200 rounded-lg text-[10px] font-bold flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleDownloadNotepad}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-[10px] font-bold flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Save as .txt</span>
                    </button>
                  </div>
                </div>

                <textarea
                  value={notepadSummary || notepadContent}
                  onChange={(e) => setNotepadSummary(e.target.value)}
                  className="w-full h-28 bg-transparent text-amber-100 font-mono text-xs border-0 focus:outline-none resize-none"
                  placeholder="Scanned food label notepad notes will appear here..."
                />
              </div>

              {/* Scanned Items Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                    <span>Parsed Food Items ({scannedItems.length})</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                      Quantity & Pcs Detected
                    </span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setSelectedItemIndices(
                          selectedItemIndices.length === scannedItems.length
                            ? []
                            : scannedItems.map((_, i) => i)
                        )
                      }
                      className="text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      {selectedItemIndices.length === scannedItems.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                </div>

                {scannedItems.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-xs">
                    No items scanned yet. Take a photo or upload notepad notes above!
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                    <div className="max-h-60 overflow-y-auto">
                      <table className="w-full text-left">
                        <thead className="bg-emerald-50 text-emerald-950 font-bold text-[11px] border-b border-emerald-100">
                          <tr>
                            <th className="p-3 w-8"></th>
                            <th className="p-3">Item & Category</th>
                            <th className="p-3">Quantity & Unit</th>
                            <th className="p-3">Est/Accurate Pcs</th>
                            <th className="p-3">Expiration</th>
                            <th className="p-3">Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                          {scannedItems.map((item, idx) => {
                            const isSelected = selectedItemIndices.includes(idx);
                            return (
                              <tr key={idx} className={isSelected ? 'bg-emerald-50/40' : 'hover:bg-slate-50'}>
                                <td className="p-3">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedItemIndices([...selectedItemIndices, idx]);
                                      } else {
                                        setSelectedItemIndices(selectedItemIndices.filter((i) => i !== idx));
                                      }
                                    }}
                                    className="rounded text-emerald-600 focus:ring-0"
                                  />
                                </td>
                                <td className="p-3">
                                  <div className="font-bold text-slate-900">{item.name}</div>
                                  <div className="text-[10px] text-slate-500">
                                    {item.location} • {item.category}
                                  </div>
                                </td>
                                <td className="p-3 font-bold text-emerald-900">
                                  {item.quantity} {item.unit}
                                </td>
                                <td className="p-3">
                                  <span className="text-[11px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-lg border border-amber-200">
                                    {item.estimatedPcs || `${item.quantity} Pcs`}
                                  </span>
                                </td>
                                <td className="p-3 text-[11px] text-slate-600">
                                  {item.expirationDaysFromNow && item.expirationDaysFromNow > 0
                                    ? `~${item.expirationDaysFromNow} days`
                                    : 'Optional / No Expiry'}
                                </td>
                                <td className="p-3 font-bold text-slate-900">₹{item.price}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>Quantity is stored separately from Estimated/Accurate Pcs count.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-2xl hover:bg-slate-100 text-xs"
            >
              Cancel
            </button>

            {scannedItems.length > 0 && (
              <>
                <button
                  onClick={handleAddSelectedToShopping}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-amber-300" />
                  <span>Add Selected ({selectedItemIndices.length}) to Cart</span>
                </button>

                <button
                  onClick={handleAddSelectedToPantry}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-200"
                >
                  <Package className="w-3.5 h-3.5 text-white" />
                  <span>Add Selected ({selectedItemIndices.length}) to Pantry</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
