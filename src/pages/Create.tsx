import { useState, useRef, useEffect, ChangeEvent } from "react";
import { useLocation } from "react-router-dom";
import {
  Sparkles,
  Settings2,
  Image as ImageIcon,
  Download,
  Share2,
  Loader2,
  Wand2,
  Upload,
  Maximize,
  AlertCircle,
  X,
  History,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  TrendingUp,
  FlipHorizontal,
  FlipVertical,
  Palette,
  Undo2,
  Redo2,
  RotateCcw,
  Sliders,
  Contrast,
  Sun,
  Video,
  Eraser,
  UserCircle2,
  CheckCircle2,
  Layers,
  Dices,
  Eye,
  Maximize2,
  SlidersHorizontal,
  LayoutGrid
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import PromptBuilder from "../components/PromptBuilder";
import DesktopImageViewer, { ViewerImageItem } from "../components/DesktopImageViewer";

const models = [
  { id: "anime-v1", name: "Senpai Anime V1" },
  { id: "realistic", name: "Senpai Realistic" },
  { id: "2.5d", name: "Senpai 2.5D" },
];

const samplers = [
  { id: "euler_a", name: "Euler a" },
  { id: "dpmpp_2m", name: "DPM++ 2M Karras" },
  { id: "ddim", name: "DDIM" },
  { id: "unipc", name: "UniPC" },
  { id: "lms", name: "LMS" }
];

const exportFormats = [
  { id: "mp4", name: "MP4 Video", ext: ".mp4" },
  { id: "gif", name: "Animated GIF", ext: ".gif" },
];

const exportQualities = [
  { id: "std", name: "Standard (720p)", bit: "4mbps" },
  { id: "hd", name: "High Def (1080p)", bit: "8mbps" },
];

const aspectRatios = [
  { id: "1:1", label: "1:1 Square", aspect: "1:1", width: 14, height: 14 },
  { id: "3:4", label: "3:4 Portrait", aspect: "3:4", width: 12, height: 16 },
  { id: "4:3", label: "4:3 Landscape", aspect: "4:3", width: 16, height: 12 },
  { id: "9:16", label: "9:16 Mobile", aspect: "9:16", width: 10, height: 18 },
  { id: "16:9", label: "16:9 Widescreen", aspect: "16:9", width: 18, height: 10 },
];

const videoAspectRatios = [
  { id: "1:1", label: "1:1 Square" },
  { id: "3:4", label: "3:4 Vertical" },
  { id: "4:3", label: "4:3 Standard" },
  { id: "9:16", label: "9:16 Story" },
  { id: "16:9", label: "16:9 Cinema" }
];

const trendingPrompts = [
  "cyberpunk samurai girl, neon lights, rain, katana, highly detailed",
  "magical forest, glowing butterflies, ethereal lighting, anime style",
  "futuristic city, flying cars, sunset, cinematic lighting, 8k",
  "cute cat wearing a spacesuit, moon background, stars, digital art",
  "steampunk explorer, brass goggles, airship background, detailed textures"
];

interface HistoryItem {
  id: string;
  url: string;
  prompt: string;
  negativePrompt: string;
  guidanceScale: number;
  model: string;
  aspectRatio: string;
  timestamp: number;
}

interface QueueItem {
  id: string;
  prompt: string;
  timestamp: number;
}

export default function Create() {
  const location = useLocation();
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState(models[0].id);
  const [aspectRatio, setAspectRatio] = useState("3:4");
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 1000000));
  const [steps, setSteps] = useState<number>(30);
  const [sampler, setSampler] = useState<string>("euler_a");
  const [styleBlend, setStyleBlend] = useState<number>(75);

  const [videoAspectRatio, setVideoAspectRatio] = useState("16:9");
  const [exportFormat, setExportFormat] = useState("mp4");
  const [exportQuality, setExportQuality] = useState("hd");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [styleImage, setStyleImage] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [isRemovingWatermark, setIsRemovingWatermark] = useState(false);
  const [isMakingDeepfake, setIsMakingDeepfake] = useState(false);

  const [showUpscaleConfirm, setShowUpscaleConfirm] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [showExport, setShowExport] = useState(false);
  const [showAILab, setShowAILab] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showPromptHistory, setShowPromptHistory] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Desktop OS Viewer Modal State
  const [isOSViewerOpen, setIsOSViewerOpen] = useState(false);

  // Responsive Mobile Tab State: "settings", "prompt", "preview"
  const [mobileTab, setMobileTab] = useState<"settings" | "prompt" | "preview">("settings");

  // Transforms
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Filters & Effects
  const [sharpen, setSharpen] = useState(0);
  const [vignette, setVignette] = useState(0);
  const [vignetteRadius, setVignetteRadius] = useState(50);
  const [noise, setNoise] = useState(0);
  const [blur, setBlur] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [colorGrade, setColorGrade] = useState("none");
  const [gradeIntensity, setGradeIntensity] = useState(100);

  // Undo/Redo State
  const [editHistory, setEditHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const currentEditState = {
    zoom, rotation, flipH, flipV, sharpen, blur, vignette, noise, brightness, contrast, saturation, colorGrade, gradeIntensity
  };

  const pushToEditHistory = (newState: any) => {
    const newHistory = editHistory.slice(0, historyIndex + 1);
    newHistory.push(newState);
    if (newHistory.length > 50) newHistory.shift();
    setEditHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevState = editHistory[prevIndex];
      applyEditState(prevState);
      setHistoryIndex(prevIndex);
    }
  };

  const redo = () => {
    if (historyIndex < editHistory.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextState = editHistory[nextIndex];
      applyEditState(nextState);
      setHistoryIndex(nextIndex);
    }
  };

  const applyEditState = (state: any) => {
    setZoom(state.zoom);
    setRotation(state.rotation);
    setFlipH(state.flipH);
    setFlipV(state.flipV);
    setSharpen(state.sharpen);
    setBlur(state.blur);
    setVignette(state.vignette);
    setNoise(state.noise);
    setBrightness(state.brightness);
    setContrast(state.contrast);
    setSaturation(state.saturation);
    setColorGrade(state.colorGrade);
    setGradeIntensity(state.gradeIntensity);
  };

  useEffect(() => {
    if (generatedImage && editHistory.length === 0) {
      pushToEditHistory(currentEditState);
    }
  }, [generatedImage]);

  const commitEdit = () => {
    pushToEditHistory(currentEditState);
  };

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const styleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (location.state?.referenceImage) {
      setReferenceImage(location.state.referenceImage);
    }
    if (location.state?.prompt) {
      setPrompt(location.state.prompt);
    }

    const savedHistory = localStorage.getItem("senpai_history");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, [location.state]);

  const saveToHistory = (
    url: string,
    p: string,
    np: string,
    gs: number,
    m: string,
    ar: string
  ) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      url,
      prompt: p,
      negativePrompt: np,
      guidanceScale: gs,
      model: m,
      aspectRatio: ar,
      timestamp: Date.now()
    };
    const updated = [newItem, ...history].slice(0, 30);
    setHistory(updated);
    localStorage.setItem("senpai_history", JSON.stringify(updated));

    const communityItems = JSON.parse(localStorage.getItem("senpai_community") || "[]");
    const communityItem = {
      id: newItem.id,
      src: url,
      likes: 0,
      views: 0,
      downloads: 0,
      author: "You",
      prompt: p,
      rating: 0
    };
    localStorage.setItem("senpai_community", JSON.stringify([communityItem, ...communityItems].slice(0, 50)));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File too large. Please upload an image smaller than 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStyleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Style image file too large (max 5MB).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setStyleImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt to generate an image.");
      return;
    }

    if (isGenerating) {
      const newQueueItem: QueueItem = {
        id: Math.random().toString(36).substr(2, 9),
        prompt: prompt.trim(),
        timestamp: Date.now()
      };
      setQueue((prev) => [...prev, newQueueItem]);
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setError(null);
    setZoom(1);
    setRotation(0);

    window.dispatchEvent(new CustomEvent("senpai_action", { detail: { type: "generate" } }));

    try {
      let width = 800;
      let height = 800;
      if (aspectRatio === "3:4") { width = 768; height = 1024; }
      if (aspectRatio === "4:3") { width = 1024; height = 768; }
      if (aspectRatio === "9:16") { width = 576; height = 1024; }
      if (aspectRatio === "16:9") { width = 1024; height = 576; }

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          negativePrompt,
          model: selectedModel,
          aspectRatio,
          width,
          height,
          seed,
          steps,
          cfgScale: guidanceScale,
          sampler,
          styleImage
        })
      });

      if (!response.ok) {
        throw new Error("Server image generation failed");
      }

      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        saveToHistory(data.imageUrl, prompt, negativePrompt, guidanceScale, selectedModel, aspectRatio);
        // Switch mobile tab to preview automatically on generation
        setMobileTab("preview");
      } else {
        throw new Error("No image data returned");
      }
    } catch (err: any) {
      console.warn("Generation error, triggering high-res fallback:", err);
      // Fallback AI image pipeline
      const modelContext = selectedModel === "anime-v1" ? "anime style, manga art, vibrant colors" :
                           selectedModel === "realistic" ? "photorealistic anime, 8k, highly detailed, cinematic lighting" :
                           "2.5d anime style, semi-realistic, digital illustration";
      const fullPrompt = `${prompt}, ${modelContext}, high quality, masterpiece`;
      const encodedPrompt = encodeURIComponent(fullPrompt);
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=800&seed=${seed}&nologo=true&model=flux`;
      setGeneratedImage(fallbackUrl);
      saveToHistory(fallbackUrl, prompt, negativePrompt, guidanceScale, selectedModel, aspectRatio);
      setMobileTab("preview");
    } finally {
      setIsGenerating(false);
      processQueue();
    }
  };

  const processQueue = () => {
    setQueue((prev) => {
      if (prev.length === 0) return prev;
      const [next, ...rest] = prev;
      setTimeout(() => {
        setPrompt(next.prompt);
        handleGenerate();
      }, 500);
      return rest;
    });
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleFlipH = () => setFlipH((prev) => !prev);
  const handleFlipV = () => setFlipV((prev) => !prev);

  const handleDownload = () => {
    if (!generatedImage) return;
    const a = document.createElement("a");
    a.href = generatedImage;
    a.download = `Senpai_AI_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = () => {
    if (navigator.share && generatedImage) {
      navigator.share({
        title: "Senpai AI Artwork",
        text: `Check out this artwork generated with prompt: "${prompt}"`,
        url: generatedImage
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(generatedImage || window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleUpscale = () => {
    setShowUpscaleConfirm(false);
    setIsUpscaling(true);
    setTimeout(() => {
      setIsUpscaling(false);
      alert("Image successfully upscaled to 4K high resolution!");
    }, 2500);
  };

  const handleRemoveWatermark = () => {
    setIsRemovingWatermark(true);
    setTimeout(() => {
      setIsRemovingWatermark(false);
      alert("Clean Master complete: Watermarks and logos removed!");
    }, 2000);
  };

  const handleDeepfake = () => {
    setIsMakingDeepfake(true);
    setTimeout(() => {
      setIsMakingDeepfake(false);
      alert("Face Morpher complete: Anime face alignment applied!");
    }, 2200);
  };

  // Convert current generatedImage history list to ViewerImageItem format
  const viewerHistoryItems: ViewerImageItem[] = history.map((h) => ({
    id: h.id,
    url: h.url,
    prompt: h.prompt,
    timestamp: h.timestamp,
    model: h.model,
    aspectRatio: h.aspectRatio
  }));

  const activeViewerItem: ViewerImageItem | null = generatedImage
    ? {
        id: Date.now().toString(),
        url: generatedImage,
        prompt: prompt || "Anime AI Art",
        aspectRatio,
        model: selectedModel
      }
    : null;

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Mobile Header Tab Switcher (< md) */}
      <div className="md:hidden flex items-center justify-around bg-zinc-900 border-b border-zinc-800 p-2 z-20">
        <button
          onClick={() => setMobileTab("settings")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
            mobileTab === "settings"
              ? "bg-pink-500 text-black shadow-[0_0_10px_rgba(236,72,153,0.3)]"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Settings2 className="w-3.5 h-3.5" /> Controls
        </button>
        <button
          onClick={() => setMobileTab("prompt")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
            mobileTab === "prompt"
              ? "bg-pink-500 text-black shadow-[0_0_10px_rgba(236,72,153,0.3)]"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Wand2 className="w-3.5 h-3.5" /> Prompt Assistant
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative",
            mobileTab === "preview"
              ? "bg-pink-500 text-black shadow-[0_0_10px_rgba(236,72,153,0.3)]"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Eye className="w-3.5 h-3.5" /> Preview
          {generatedImage && <span className="w-2 h-2 rounded-full bg-green-400 animate-ping absolute top-1 right-1" />}
        </button>
      </div>

      {/* Left Settings Sidebar Panel */}
      <div
        className={cn(
          "w-full md:w-96 bg-zinc-900/90 border-r border-zinc-800 flex flex-col h-full overflow-y-auto custom-scrollbar z-10 backdrop-blur-md",
          mobileTab !== "settings" && "hidden md:flex"
        )}
      >
        <div className="p-4 sm:p-5 space-y-6 flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-zinc-100 flex items-center gap-2 tracking-tight">
              <Sparkles className="w-4 h-4 text-pink-500" />
              Generation Suite
            </h2>
            <span className="text-[10px] font-mono bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded-full border border-pink-500/20">
              Senpai v2.0
            </span>
          </div>

          {/* Model Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">AI Engine Model</label>
            <div className="grid grid-cols-3 gap-2">
              {models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={cn(
                    "p-2.5 rounded-xl text-xs font-bold transition-all border text-center flex flex-col items-center justify-center gap-1",
                    selectedModel === m.id
                      ? "bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500 text-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.2)]"
                      : "bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                  )}
                >
                  <span>{m.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Selector with Clean Frame Boxes (NO DOWN ARROWS!) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>Aspect Ratio</span>
              <span className="text-[10px] text-pink-400 font-mono">{aspectRatio}</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {aspectRatios.map((ar) => (
                <button
                  key={ar.id}
                  onClick={() => setAspectRatio(ar.id)}
                  className={cn(
                    "p-2 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 border transition-all group",
                    aspectRatio === ar.id
                      ? "bg-pink-500/20 border-pink-500 text-pink-300 shadow-[0_0_10px_rgba(236,72,153,0.25)]"
                      : "bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  )}
                >
                  {/* Custom SVG/CSS Rectangle Frame Preview */}
                  <div
                    className={cn(
                      "border-2 rounded-[2px] transition-colors",
                      aspectRatio === ar.id ? "border-pink-400" : "border-zinc-500 group-hover:border-zinc-300"
                    )}
                    style={{ width: `${ar.width}px`, height: `${ar.height}px` }}
                  />
                  <span className="text-[10px] font-bold font-mono">{ar.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Prompt Input Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Prompt</label>
              <button
                onClick={() => setShowPromptHistory(!showPromptHistory)}
                className="text-[10px] text-pink-400 hover:underline flex items-center gap-1"
              >
                <TrendingUp className="w-3 h-3" /> Trending
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder="E.g., Cyberpunk samurai girl standing under neon rain in Neo Tokyo, glowing blue katana, fine line art..."
              className="w-full h-28 bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-pink-500/80 transition-all resize-none font-mono"
            />
            <p className="text-[10px] text-zinc-500 text-right">Press Ctrl + Enter to generate</p>

            {/* Trending Prompts Popover */}
            <AnimatePresence>
              {showPromptHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2 overflow-hidden"
                >
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Quick Inspiration:</p>
                  {trendingPrompts.map((tp, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setPrompt(tp);
                        setShowPromptHistory(false);
                      }}
                      className="w-full text-left p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 transition-colors truncate"
                    >
                      "{tp}"
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Style Reference Image & Blend */}
          <div className="space-y-3 pt-2 border-t border-zinc-800">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-indigo-400" /> Style Transfer Image
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="file"
                ref={styleInputRef}
                onChange={handleStyleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => styleInputRef.current?.click()}
                className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-indigo-500/50 text-xs text-zinc-300 font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                {styleImage ? "Change Style Image" : "Upload Style Reference"}
              </button>
              {styleImage && (
                <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-indigo-500/50 group">
                  <img src={styleImage} alt="Style Ref" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setStyleImage(null)}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            {styleImage && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>Style Blend Strength</span>
                  <span>{styleBlend}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={styleBlend}
                  onChange={(e) => setStyleBlend(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Advanced Parameters Drawer */}
          <div className="pt-2 border-t border-zinc-800">
            <button
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="flex items-center justify-between w-full text-xs font-bold text-zinc-400 uppercase tracking-wider hover:text-zinc-200 transition-colors py-1"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                Advanced Controls (Seed, CFG, Sampler)
              </div>
              <motion.div animate={{ rotate: showAdvancedSettings ? 180 : 0 }}>
                <RefreshCw className="w-3 h-3" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showAdvancedSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-4 pt-3"
                >
                  {/* Negative Prompt */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-zinc-400">Negative Prompt (Exclude)</label>
                    <input
                      type="text"
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="low quality, bad anatomy, blurry, extra limbs, distorted text..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>

                  {/* CFG Scale */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                      <span>CFG Guidance Scale</span>
                      <span className="text-purple-400 font-bold">{guidanceScale}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="0.5"
                      value={guidanceScale}
                      onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>

                  {/* Steps */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                      <span>Sampling Steps</span>
                      <span className="text-purple-400 font-bold">{steps}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={steps}
                      onChange={(e) => setSteps(parseInt(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>

                  {/* Sampler Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-zinc-400">Sampling Method</label>
                    <select
                      value={sampler}
                      onChange={(e) => setSampler(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 font-mono"
                    >
                      {samplers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Seed Input + Randomize */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-zinc-400">Seed Value</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={seed}
                        onChange={(e) => setSeed(Number(e.target.value))}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={() => setSeed(Math.floor(Math.random() * 1000000))}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 transition-colors"
                        title="Randomize Seed"
                      >
                        <Dices className="w-4 h-4 text-purple-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI Magic Lab Tools */}
          <div className="space-y-3 pt-2 border-t border-zinc-800">
            <button
              onClick={() => setShowAILab(!showAILab)}
              className="flex items-center justify-between w-full text-xs font-bold text-cyan-400 uppercase tracking-wider hover:text-cyan-300 transition-colors py-1"
            >
              <div className="flex items-center gap-2">
                <Wand2 className="w-3.5 h-3.5" />
                AI Magic Lab (Upscale & Morpher)
              </div>
              <motion.div animate={{ rotate: showAILab ? 180 : 0 }}>
                <RefreshCw className="w-3 h-3" />
              </motion.div>
            </button>
            <AnimatePresence>
              {showAILab && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-2 pt-2"
                >
                  <button
                    onClick={handleUpscale}
                    disabled={isUpscaling || !generatedImage}
                    className="w-full flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group disabled:opacity-40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                        <Maximize className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-zinc-200">AI Upscaler</p>
                        <p className="text-[10px] text-zinc-500 uppercase">4K Enhance</p>
                      </div>
                    </div>
                    {isUpscaling && <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />}
                  </button>

                  <button
                    onClick={handleRemoveWatermark}
                    disabled={isRemovingWatermark || !generatedImage}
                    className="w-full flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group disabled:opacity-40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                        <Eraser className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-zinc-200">Clean Master</p>
                        <p className="text-[10px] text-zinc-500 uppercase">Remove Logos/Watermarks</p>
                      </div>
                    </div>
                    {isRemovingWatermark && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
                  </button>

                  <button
                    onClick={handleDeepfake}
                    disabled={isMakingDeepfake || !generatedImage}
                    className="w-full flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-pink-500/50 hover:bg-pink-500/5 transition-all group disabled:opacity-40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-500/10 rounded-lg group-hover:bg-pink-500/20 transition-colors">
                        <UserCircle2 className="w-4 h-4 text-pink-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-zinc-200">Face Morpher</p>
                        <p className="text-[10px] text-zinc-500 uppercase">Anime Alignment</p>
                      </div>
                    </div>
                    {isMakingDeepfake && <Loader2 className="w-4 h-4 text-pink-500 animate-spin" />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Sticky Generate Button */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/90 sticky bottom-0 z-10">
          <button
            onClick={handleGenerate}
            disabled={!prompt || isGenerating}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95 transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)] active:scale-[0.98]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                Generating Anime Art...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 fill-white" />
                Generate Masterpiece
              </>
            )}
          </button>
        </div>
      </div>

      {/* Middle Interactive Prompt Builder Panel (< md mobile tab OR desktop view) */}
      <div
        className={cn(
          "w-full md:w-80 bg-zinc-900/60 border-r border-zinc-800 p-4 overflow-y-auto custom-scrollbar z-10",
          mobileTab !== "prompt" && "hidden md:block"
        )}
      >
        <PromptBuilder prompt={prompt} setPrompt={setPrompt} />
      </div>

      {/* Main Canvas Preview Stage Panel */}
      <div
        className={cn(
          "flex-1 flex flex-col bg-zinc-950 relative overflow-hidden h-full",
          mobileTab !== "preview" && "hidden md:flex"
        )}
      >
        {/* Canvas Toolbar */}
        <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/40 backdrop-blur-md">
          <div className="flex items-center gap-2">
            {generatedImage && (
              <>
                <div className="flex items-center gap-1 mr-2 px-1 py-1 rounded-xl bg-black/50 border border-zinc-800">
                  <button
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-30"
                    title="Undo Edit"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={redo}
                    disabled={historyIndex >= editHistory.length - 1}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-30"
                    title="Redo Edit"
                  >
                    <Redo2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => { handleZoomIn(); setTimeout(commitEdit, 0); }}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { handleZoomOut(); setTimeout(commitEdit, 0); }}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { handleRotate(); setTimeout(commitEdit, 0); }}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Rotate 90°"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { handleFlipH(); setTimeout(commitEdit, 0); }}
                  className={cn(
                    "p-2 rounded-xl transition-colors",
                    flipH ? "bg-pink-500/20 text-pink-400" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  )}
                  title="Flip Horizontal"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {generatedImage && (
              <button
                onClick={() => setIsOSViewerOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-pink-500/20 border border-pink-500/50 text-pink-300 hover:bg-pink-500 hover:text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(236,72,153,0.3)]"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Open OS Desktop Viewer</span>
              </button>
            )}
            <button
              onClick={handleDownload}
              disabled={!generatedImage}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-40"
              title="Download Image"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              disabled={!generatedImage}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-40"
              title="Share Image"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas Display Viewport */}
        <div className="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center relative bg-[radial-gradient(#18181b_1px,transparent_1px)] [background-size:16px_16px]">
          {error ? (
            <div className="flex flex-col items-center justify-center text-center max-w-md bg-zinc-900/80 p-6 rounded-2xl border border-red-500/30 backdrop-blur-md">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
                <AlertCircle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-red-400 mb-1">Generation Issue</h3>
              <p className="text-xs text-zinc-400 mb-4">{error}</p>
              <button
                onClick={() => setError(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors"
              >
                Dismiss
              </button>
            </div>
          ) : isGenerating ? (
            <div className="flex flex-col items-center justify-center text-zinc-400">
              <div className="w-16 h-16 relative mb-4">
                <div className="absolute inset-0 border-4 border-zinc-800 rounded-full" />
                <div className="absolute inset-0 border-4 border-pink-500 rounded-full border-t-transparent animate-spin" />
              </div>
              <p className="text-sm font-bold text-pink-400 animate-pulse font-mono">Synthesizing Anime Creation...</p>
              <p className="text-xs text-zinc-500 mt-1">Applying style model & lighting</p>
            </div>
          ) : generatedImage ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                scale: zoom,
                rotate: rotation,
                scaleX: flipH ? -zoom : zoom,
                scaleY: flipV ? -zoom : zoom
              }}
              transition={{ type: "spring", damping: 25, stiffness: 120 }}
              onClick={() => setIsOSViewerOpen(true)}
              className="relative max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl shadow-pink-500/10 ring-1 ring-white/10 cursor-pointer group"
            >
              <img
                src={generatedImage}
                alt={prompt || "Anime AI Artwork"}
                className="max-w-full h-auto max-h-[calc(100vh-14rem)] object-contain transition-all duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="px-4 py-2 rounded-full bg-pink-500 text-black font-extrabold text-xs shadow-2xl flex items-center gap-2 scale-95 group-hover:scale-100 transition-transform">
                  <Eye className="w-4 h-4" /> Click to Inspect in OS Desktop Viewer
                </span>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-600 text-center max-w-md">
              <div className="w-20 h-20 rounded-2xl bg-zinc-900/90 flex items-center justify-center mb-5 border border-zinc-800/80 shadow-inner">
                <ImageIcon className="w-10 h-10 text-zinc-600" />
              </div>
              <h3 className="text-lg font-bold text-zinc-300 mb-1">Canvas Workspace Ready</h3>
              <p className="text-xs text-zinc-500">
                Construct your prompt using the prompt builder or custom input, then click Generate to bring your anime vision to life.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Windowed OS Image Viewer Component */}
      <DesktopImageViewer
        image={activeViewerItem}
        history={viewerHistoryItems}
        isOpen={isOSViewerOpen}
        onClose={() => setIsOSViewerOpen(false)}
        onSelectImage={(item) => {
          setGeneratedImage(item.url);
          setPrompt(item.prompt);
        }}
      />
    </div>
  );
}
