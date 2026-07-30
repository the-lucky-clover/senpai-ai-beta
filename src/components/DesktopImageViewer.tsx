import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Minus,
  Square,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Sliders,
  History,
  Heart,
  RotateCcw,
  Sparkles,
  Layers,
  Copy,
  Check,
  Move
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

export interface ViewerImageItem {
  id: string;
  url: string;
  prompt: string;
  timestamp?: number;
  model?: string;
  aspectRatio?: string;
}

interface DesktopImageViewerProps {
  image: ViewerImageItem | null;
  history: ViewerImageItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectImage?: (img: ViewerImageItem) => void;
}

type FilterPreset = "normal" | "cyber" | "vhs" | "grayscale" | "sepia" | "anime" | "crt" | "invert";

export default function DesktopImageViewer({
  image,
  history,
  isOpen,
  onClose,
  onSelectImage
}: DesktopImageViewerProps) {
  const [currentImg, setCurrentImg] = useState<ViewerImageItem | null>(image);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterPreset>("normal");

  // Window positioning & dragging
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 50,
    posY: 50
  });

  // Zoom & Pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isMagnifierActive, setIsMagnifierActive] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0, show: false });

  // Slideshow state
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);
  const [slideshowInterval, setSlideshowInterval] = useState(3000); // 3 seconds
  const slideshowTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save setting
  const [autoSaveFavorites, setAutoSaveFavorites] = useState<boolean>(() => {
    return localStorage.getItem("senpai_autosave_favorites") === "true";
  });
  const [isSavedInFavorites, setIsSavedInFavorites] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Update currentImg when props change
  useEffect(() => {
    if (image) {
      setCurrentImg(image);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [image]);

  // Handle Auto-save on currentImg change
  useEffect(() => {
    if (currentImg && autoSaveFavorites) {
      saveToFavorites(currentImg);
    }
    checkFavoriteStatus(currentImg);
  }, [currentImg, autoSaveFavorites]);

  const checkFavoriteStatus = (img: ViewerImageItem | null) => {
    if (!img) return;
    try {
      const favs: ViewerImageItem[] = JSON.parse(localStorage.getItem("senpai_favorites") || "[]");
      setIsSavedInFavorites(favs.some((f) => f.id === img.id || f.url === img.url));
    } catch {
      setIsSavedInFavorites(false);
    }
  };

  const saveToFavorites = (img: ViewerImageItem) => {
    try {
      const favs: ViewerImageItem[] = JSON.parse(localStorage.getItem("senpai_favorites") || "[]");
      if (!favs.some((f) => f.id === img.id || f.url === img.url)) {
        const updated = [img, ...favs].slice(0, 100);
        localStorage.setItem("senpai_favorites", JSON.stringify(updated));
        setIsSavedInFavorites(true);
      }
    } catch (e) {
      console.warn("LocalStorage save error:", e);
    }
  };

  const toggleFavorite = () => {
    if (!currentImg) return;
    try {
      let favs: ViewerImageItem[] = JSON.parse(localStorage.getItem("senpai_favorites") || "[]");
      if (isSavedInFavorites) {
        favs = favs.filter((f) => f.id !== currentImg.id && f.url !== currentImg.url);
        setIsSavedInFavorites(false);
      } else {
        favs = [currentImg, ...favs];
        setIsSavedInFavorites(true);
      }
      localStorage.setItem("senpai_favorites", JSON.stringify(favs));
    } catch (e) {
      console.warn("Favorite toggle error:", e);
    }
  };

  const toggleAutoSaveSetting = (enabled: boolean) => {
    setAutoSaveFavorites(enabled);
    localStorage.setItem("senpai_autosave_favorites", enabled ? "true" : "false");
    if (enabled && currentImg) {
      saveToFavorites(currentImg);
    }
  };

  // Drag handlers for Window Header
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isFullscreen) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({
        x: Math.max(10, Math.min(window.innerWidth - 300, dragRef.current.posX + dx)),
        y: Math.max(10, Math.min(window.innerHeight - 200, dragRef.current.posY + dy))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Slideshow Logic
  useEffect(() => {
    if (isSlideshowActive && history.length > 0) {
      slideshowTimerRef.current = setInterval(() => {
        setCurrentImg((prev) => {
          if (!prev) return history[0];
          const currentIndex = history.findIndex((h) => h.id === prev.id || h.url === prev.url);
          const nextIndex = (currentIndex + 1) % history.length;
          return history[nextIndex];
        });
      }, slideshowInterval);
    } else if (slideshowTimerRef.current) {
      clearInterval(slideshowTimerRef.current);
    }
    return () => {
      if (slideshowTimerRef.current) clearInterval(slideshowTimerRef.current);
    };
  }, [isSlideshowActive, history, slideshowInterval]);

  // Magnifier Mouse Handler
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMagnifierActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMagnifierPos({ x, y, show: true });
  };

  // Export Filtered Image as PNG
  const exportHighResPNG = () => {
    if (!currentImg) return;
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = currentImg.url;

    img.onload = () => {
      canvas.width = img.naturalWidth || 1024;
      canvas.height = img.naturalHeight || 1024;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Apply CSS-like filter on canvas context
      let filterString = "none";
      if (activeFilter === "cyber") filterString = "hue-rotate(140deg) saturate(180%) contrast(120%)";
      if (activeFilter === "vhs") filterString = "contrast(140%) brightness(110%) saturate(150%)";
      if (activeFilter === "grayscale") filterString = "grayscale(100%) contrast(120%)";
      if (activeFilter === "sepia") filterString = "sepia(100%) saturate(120%)";
      if (activeFilter === "anime") filterString = "saturate(200%) contrast(115%) brightness(105%)";
      if (activeFilter === "crt") filterString = "sepia(30%) hue-rotate(-20deg) contrast(130%)";
      if (activeFilter === "invert") filterString = "invert(100%)";

      ctx.filter = filterString;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Trigger Download
      const link = document.createElement("a");
      link.download = `Senpai_AI_${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  };

  if (!isOpen || !currentImg) return null;

  // Filter Styles Map
  const getFilterCSS = (f: FilterPreset) => {
    switch (f) {
      case "cyber":
        return "hue-rotate(140deg) saturate(180%) contrast(120%)";
      case "vhs":
        return "contrast(140%) brightness(110%) saturate(150%)";
      case "grayscale":
        return "grayscale(100%) contrast(120%)";
      case "sepia":
        return "sepia(100%) saturate(120%)";
      case "anime":
        return "saturate(200%) contrast(115%) brightness(105%)";
      case "crt":
        return "sepia(30%) hue-rotate(-20deg) contrast(130%)";
      case "invert":
        return "invert(100%)";
      default:
        return "none";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center p-2 sm:p-6">
        {/* Backdrop for full modal experience */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          onClick={onClose}
        />

        {/* OS Desktop Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{
            scale: isMinimized ? 0.2 : 1,
            opacity: isMinimized ? 0 : 1,
            y: 0,
            width: isFullscreen ? "98vw" : "90vw",
            height: isFullscreen ? "96vh" : "85vh",
            maxWidth: isFullscreen ? "100vw" : "1300px"
          }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={cn(
            "pointer-events-auto bg-zinc-950/95 border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative z-10 backdrop-blur-2xl ring-1 ring-white/10",
            isFullscreen && "rounded-none"
          )}
          style={!isFullscreen ? { transform: `translate(${position.x - 50}px, ${position.y - 50}px)` } : {}}
        >
          {/* OS Title Bar */}
          <div
            onMouseDown={handleMouseDown}
            className="h-11 bg-zinc-900/90 border-b border-zinc-800/80 px-4 flex items-center justify-between select-none cursor-move group"
          >
            {/* Window Controls (Mac/OS style) */}
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="w-3.5 h-3.5 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-black transition-colors"
                title="Close Window"
              >
                <X className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 hover:bg-yellow-500 flex items-center justify-center text-black transition-colors"
                title="Minimize Window"
              >
                <Minus className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="w-3.5 h-3.5 rounded-full bg-green-500/80 hover:bg-green-500 flex items-center justify-center text-black transition-colors"
                title="Maximize Window"
              >
                <Square className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            {/* Window Title & Drag Handle */}
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 font-bold uppercase tracking-widest truncate">
              <Move className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
              <span>Senpai OS Image Viewer v2.0</span>
              <span className="text-[10px] text-zinc-500 font-normal">[{currentImg.aspectRatio || "1:1"}]</span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFavorite}
                className={cn(
                  "p-1.5 rounded-lg border transition-all text-xs font-semibold flex items-center gap-1",
                  isSavedInFavorites
                    ? "bg-pink-500/20 border-pink-500/50 text-pink-400"
                    : "bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:text-white"
                )}
                title="Bookmark to Local Favorites"
              >
                <Heart className={cn("w-3.5 h-3.5", isSavedInFavorites && "fill-pink-500 text-pink-500")} />
              </button>
              <button
                onClick={exportHighResPNG}
                className="p-1.5 rounded-lg bg-pink-500 text-black font-bold text-xs hover:bg-pink-400 transition-all flex items-center gap-1"
                title="Download High-Res PNG"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export PNG</span>
              </button>
            </div>
          </div>

          {/* Main Viewer Canvas Body */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Left Toolbar */}
            <div className="w-12 bg-zinc-900/60 border-r border-zinc-800/80 flex flex-col items-center py-3 gap-3">
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.25, 4))}
                className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                title="Zoom In (+25%)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                title="Zoom Out (-25%)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors text-[10px] font-mono"
                title="100% Reset Zoom"
              >
                1:1
              </button>
              <div className="w-6 h-px bg-zinc-800 my-1" />
              <button
                onClick={() => setIsMagnifierActive(!isMagnifierActive)}
                className={cn(
                  "p-2 rounded-xl transition-colors",
                  isMagnifierActive
                    ? "bg-pink-500/20 text-pink-400 border border-pink-500/40"
                    : "hover:bg-zinc-800 text-zinc-400 hover:text-white"
                )}
                title="Magnifier Glass Mode"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={cn(
                  "p-2 rounded-xl transition-colors",
                  showHistory
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
                    : "hover:bg-zinc-800 text-zinc-400 hover:text-white"
                )}
                title="Toggle Session History Sidebar"
              >
                <History className="w-4 h-4" />
              </button>
            </div>

            {/* Central Stage */}
            <div
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={() => setMagnifierPos((p) => ({ ...p, show: false }))}
              className="flex-1 bg-black/80 relative flex items-center justify-center overflow-hidden p-4 select-none"
            >
              {/* Image Container with Transforms */}
              <div
                className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-200"
                style={{
                  transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`
                }}
              >
                <img
                  src={currentImg.url}
                  alt={currentImg.prompt || "Generated Anime Art"}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl transition-all"
                  style={{
                    filter: getFilterCSS(activeFilter)
                  }}
                  referrerPolicy="no-referrer"
                />

                {/* CRT Scanline FX overlay if active */}
                {activeFilter === "crt" && (
                  <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
                )}
              </div>

              {/* Magnifier Lens */}
              {isMagnifierActive && magnifierPos.show && (
                <div
                  className="absolute w-40 h-40 rounded-full border-2 border-pink-500 shadow-2xl pointer-events-none overflow-hidden z-30"
                  style={{
                    left: magnifierPos.x - 80,
                    top: magnifierPos.y - 80,
                    backgroundImage: `url(${currentImg.url})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: `${1000}%`,
                    backgroundPosition: `${(magnifierPos.x / 800) * 100}% ${(magnifierPos.y / 600) * 100}%`
                  }}
                />
              )}

              {/* Overlay Prompt Pill */}
              <div className="absolute bottom-4 left-4 right-4 max-w-2xl mx-auto bg-zinc-900/90 border border-zinc-800/80 p-3 rounded-2xl backdrop-blur-xl flex items-center justify-between gap-3 shadow-xl">
                <div className="flex-1 truncate">
                  <p className="text-[9px] font-mono text-pink-400 font-bold uppercase tracking-widest">Active Prompt</p>
                  <p className="text-xs text-zinc-200 truncate font-mono">{currentImg.prompt}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentImg.prompt);
                    setCopiedPrompt(true);
                    setTimeout(() => setCopiedPrompt(false), 2000);
                  }}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copiedPrompt ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Right Panel: Filters, Controls & Favorites Settings */}
            <div className="w-64 bg-zinc-900/80 border-l border-zinc-800/80 p-4 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
              {/* Filter Suite */}
              <div className="space-y-2">
                <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3 h-3 text-pink-500" />
                  Real-time Filters
                </h5>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: "normal", label: "Normal" },
                      { id: "anime", label: "Anime Boost" },
                      { id: "cyber", label: "Cyber Neon" },
                      { id: "vhs", label: "VHS Glitch" },
                      { id: "crt", label: "Vintage CRT" },
                      { id: "sepia", label: "Sepia Warm" },
                      { id: "grayscale", label: "Grayscale" },
                      { id: "invert", label: "Invert" }
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setActiveFilter(f.id)}
                      className={cn(
                        "py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all text-left truncate",
                        activeFilter === f.id
                          ? "bg-pink-500 text-black border-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.3)]"
                          : "bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slideshow Controls */}
              <div className="space-y-2 pt-3 border-t border-zinc-800/80">
                <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Play className="w-3 h-3 text-cyan-400" />
                  Slideshow Mode
                </h5>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSlideshowActive(!isSlideshowActive)}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5",
                      isSlideshowActive
                        ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                        : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                    )}
                  >
                    {isSlideshowActive ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-black" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-cyan-400" /> Play Slideshow
                      </>
                    )}
                  </button>
                  <select
                    value={slideshowInterval}
                    onChange={(e) => setSlideshowInterval(Number(e.target.value))}
                    className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-[10px] rounded-xl px-2 py-2 focus:outline-none"
                  >
                    <option value={2000}>2s</option>
                    <option value={3000}>3s</option>
                    <option value={5000}>5s</option>
                    <option value={10000}>10s</option>
                  </select>
                </div>
              </div>

              {/* Auto-Save Favorites Setting */}
              <div className="space-y-2 pt-3 border-t border-zinc-800/80">
                <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-3 h-3 text-pink-500" />
                  Storage Cache Settings
                </h5>
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 cursor-pointer hover:border-zinc-700 transition-colors">
                  <span className="text-[11px] text-zinc-300 font-medium">Auto-save to Favorites</span>
                  <input
                    type="checkbox"
                    checked={autoSaveFavorites}
                    onChange={(e) => toggleAutoSaveSetting(e.target.checked)}
                    className="w-4 h-4 accent-pink-500 rounded"
                  />
                </label>
                <p className="text-[9px] text-zinc-500">
                  Automatically saves generated art to local browser cache so work isn't lost on refresh.
                </p>
              </div>
            </div>

            {/* Session History Sidebar Drawer */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 180, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="bg-zinc-900/90 border-l border-zinc-800/80 flex flex-col overflow-hidden"
                >
                  <div className="p-3 border-b border-zinc-800/80 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Session History</span>
                    <span className="text-[9px] font-mono text-zinc-500">{history.length} items</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    {history.map((h) => {
                      const isActive = h.id === currentImg.id || h.url === currentImg.url;
                      return (
                        <div
                          key={h.id}
                          onClick={() => {
                            setCurrentImg(h);
                            if (onSelectImage) onSelectImage(h);
                          }}
                          className={cn(
                            "relative aspect-square rounded-xl overflow-hidden border cursor-pointer transition-all group",
                            isActive
                              ? "border-pink-500 ring-2 ring-pink-500/40"
                              : "border-zinc-800 hover:border-zinc-600"
                          )}
                        >
                          <img src={h.url} alt={h.prompt} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 flex flex-col justify-end">
                            <p className="text-[8px] text-white truncate font-mono">{h.prompt}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
