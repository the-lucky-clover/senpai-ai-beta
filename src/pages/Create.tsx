import { useState, useRef, useEffect, ChangeEvent } from "react";
import { useLocation } from "react-router-dom";
import { Sparkles, Settings2, Image as ImageIcon, Download, Share2, Loader2, Wand2, Upload, Maximize, AlertCircle, X, History, ZoomIn, ZoomOut, RefreshCw, TrendingUp, FlipHorizontal, FlipVertical } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

const models = [
  { id: "anime-v1", name: "Senpai Anime V1" },
  { id: "realistic", name: "Senpai Realistic" },
  { id: "2.5d", name: "Senpai 2.5D" },
];

const aspectRatios = [
  { id: "1:1", label: "Square", icon: "□" },
  { id: "3:4", label: "Portrait", icon: "▯" },
  { id: "4:3", label: "Landscape", icon: "▭" },
  { id: "9:16", label: "Mobile", icon: "⟱" },
  { id: "16:9", label: "Desktop", icon: "▭" },
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
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [showUpscaleConfirm, setShowUpscaleConfirm] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (location.state?.referenceImage) {
      setReferenceImage(location.state.referenceImage);
    }
    if (location.state?.prompt) {
      setPrompt(location.state.prompt);
    }
    
    // Load history from local storage
    const savedHistory = localStorage.getItem("senpai_history");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, [location.state]);

  const saveToHistory = (url: string, promptText: string, negPrompt: string, scale: number, modelId: string, ratio: string) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      url,
      prompt: promptText,
      negativePrompt: negPrompt,
      guidanceScale: scale,
      model: modelId,
      aspectRatio: ratio,
      timestamp: Date.now(),
    };
    const updatedHistory = [newItem, ...history].slice(0, 20);
    setHistory(updatedHistory);
    localStorage.setItem("senpai_history", JSON.stringify(updatedHistory));
    
    // Also save to community list for Explore page
    const communityItems = JSON.parse(localStorage.getItem("senpai_community") || "[]");
    const communityItem = {
      id: newItem.id,
      src: url,
      likes: 0,
      views: 0,
      downloads: 0,
      author: "You",
      prompt: promptText,
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
      reader.onerror = () => {
        setError("Failed to read the image file. Please try again.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt to generate an image.");
      return;
    }

    // If already generating, add to queue
    if (isGenerating) {
      const newQueueItem: QueueItem = {
        id: Math.random().toString(36).substr(2, 9),
        prompt: prompt.trim(),
        timestamp: Date.now(),
      };
      setQueue(prev => [...prev, newQueueItem]);
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setError(null);
    setZoom(1);
    setRotation(0);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      const rand = Math.random();
      if (rand < 0.05) {
        setError("Safety system triggered: Content detected that violates our community guidelines. Please modify your prompt.");
        setIsGenerating(false);
        processQueue();
        return;
      }

      let width = 800;
      let height = 800;
      
      if (aspectRatio === "3:4") { width = 768; height = 1024; }
      if (aspectRatio === "4:3") { width = 1024; height = 768; }
      if (aspectRatio === "9:16") { width = 576; height = 1024; }
      if (aspectRatio === "16:9") { width = 1024; height = 576; }

      const modelContext = selectedModel === "anime-v1" ? "anime style, manga art, vibrant colors" : 
                           selectedModel === "realistic" ? "photorealistic anime, 8k, highly detailed, cinematic lighting" :
                           "2.5d anime style, semi-realistic, digital illustration";
      
      const fullPrompt = `${prompt}, ${modelContext}, ${negativePrompt ? `negative prompt: ${negativePrompt}` : ""}, high quality, masterpiece`;
      const encodedPrompt = encodeURIComponent(fullPrompt);
      const seed = Math.floor(Math.random() * 1000000);

      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;
      
      setGeneratedImage(imageUrl);
      saveToHistory(imageUrl, prompt, negativePrompt, guidanceScale, selectedModel, aspectRatio);
    } catch (err) {
      setError("Generation failed due to a network error. Please check your connection and try again.");
    } finally {
      setIsGenerating(false);
      processQueue();
    }
  };

  const processQueue = () => {
    setQueue(prev => {
      if (prev.length === 0) return prev;
      const [next, ...rest] = prev;
      // Small delay before starting next generation
      setTimeout(() => {
        setPrompt(next.prompt);
        handleGenerate();
      }, 500);
      return rest;
    });
  };

  const handleUpscale = () => {
    if (!generatedImage || isUpscaling) return;
    setShowUpscaleConfirm(false);
    setIsUpscaling(true);
    setTimeout(() => {
      setGeneratedImage(generatedImage + (generatedImage.includes('?') ? '&' : '?') + 'upscaled=true');
      setIsUpscaling(false);
    }, 2000);
  };

  const handleDownload = async () => {
    if (!generatedImage) return;
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `senpai-ai-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download image. Please try right-clicking and saving instead.");
    }
  };

  const handleShare = async () => {
    if (!generatedImage) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Senpai-AI Generation',
          text: `Check out this AI art I created with Senpai-AI: ${prompt}`,
          url: generatedImage,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      try {
        await navigator.clipboard.writeText(generatedImage);
        alert("Image link copied to clipboard!");
      } catch (err) {
        setError("Failed to copy link to clipboard.");
      }
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleFlipH = () => setFlipH(prev => !prev);
  const handleFlipV = () => setFlipV(prev => !prev);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-zinc-950">
      {/* Sidebar Controls */}
      <div className="w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-zinc-800 bg-zinc-900/50 flex flex-col overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Prompt Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Wand2 className="w-4 h-4" /> Prompt
              </label>
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  showHistory ? "bg-pink-500/20 text-pink-500" : "text-zinc-500 hover:text-zinc-300"
                )}
                title="View History"
              >
                <History className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="1girl, solo, looking at viewer, masterpiece, best quality..."
              className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none"
            />
          </div>

          {/* Trending Prompts */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3" /> Trending Suggestions
            </label>
            <div className="flex flex-wrap gap-2">
              {trendingPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(p)}
                  className="px-2.5 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-[11px] text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors truncate max-w-[150px]"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Negative Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Negative Prompt</label>
            <textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="worst quality, low quality, bad anatomy, watermark..."
              className="w-full h-20 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none"
            />
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Settings2 className="w-4 h-4" /> Model
            </label>
            <div className="grid gap-2">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm text-left transition-colors border",
                    selectedModel === model.id
                      ? "bg-pink-500/10 border-pink-500/50 text-pink-400"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  )}
                >
                  {model.name}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Aspect Ratio</label>
            <div className="grid grid-cols-5 gap-2">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio.id}
                  onClick={() => setAspectRatio(ratio.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-lg border transition-colors",
                    aspectRatio === ratio.id
                      ? "bg-pink-500/10 border-pink-500/50 text-pink-400"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  )}
                  title={ratio.label}
                >
                  <span className="text-lg mb-1">{ratio.icon}</span>
                  <span className="text-[10px] font-medium">{ratio.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Guidance Scale */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-300">Guidance Scale</label>
              <span className="text-xs text-zinc-500">{guidanceScale}</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="0.1"
              value={guidanceScale}
              onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
              className="w-full accent-pink-500"
            />
          </div>

          {/* Reference Image */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Upload className="w-4 h-4" /> Reference Image
            </label>
            {referenceImage ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-zinc-800 group">
                <img src={referenceImage} alt="Reference" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => setReferenceImage(null)}
                    className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors bg-zinc-950"
              >
                <Upload className="w-6 h-6 mb-2" />
                <span className="text-xs font-medium">Click to upload image</span>
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        <div className="mt-auto p-4 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-md sticky bottom-0 z-10">
          <button
            onClick={handleGenerate}
            disabled={!prompt || isGenerating}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Image
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col bg-zinc-950 relative overflow-hidden">
        {/* Toolbar */}
        <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/30">
          <div className="flex items-center gap-2">
            {generatedImage && (
              <>
                <button 
                  onClick={handleZoomIn}
                  className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleZoomOut}
                  className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleRotate}
                  className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Rotate 90°"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleFlipH}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    flipH ? "bg-pink-500/20 text-pink-500" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  )}
                  title="Flip Horizontal"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleFlipV}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    flipV ? "bg-pink-500/20 text-pink-500" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  )}
                  title="Flip Vertical"
                >
                  <FlipVertical className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => { setZoom(1); setRotation(0); setFlipH(false); setFlipV(false); }}
                  className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Reset View"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {generatedImage && (
              <button 
                onClick={() => setShowUpscaleConfirm(true)}
                disabled={isUpscaling}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isUpscaling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Maximize className="w-4 h-4" />}
                Upscale
              </button>
            )}
            <div className="w-px h-6 bg-zinc-800 mx-1"></div>
            <button 
              onClick={handleDownload}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50" 
              disabled={!generatedImage}
              title="Download Image"
            >
              <Download className="w-5 h-5" />
            </button>
            <button 
              onClick={handleShare}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50" 
              disabled={!generatedImage}
              title="Share Image"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center relative">
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute right-0 top-0 bottom-0 w-64 bg-zinc-900/95 backdrop-blur-xl border-l border-zinc-800 z-20 overflow-y-auto p-4 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm">History</h3>
                  <button onClick={() => setShowHistory(false)} className="text-zinc-500 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {history.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-8">No history yet</p>
                  ) : (
                    history.map((item) => (
                      <div key={item.id} className="group relative rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                        <img src={item.url} alt="" className="w-full aspect-square object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                          <p className="text-[10px] text-white line-clamp-2 mb-2">{item.prompt}</p>
                          <button 
                            onClick={() => {
                              setGeneratedImage(item.url);
                              setPrompt(item.prompt);
                              setNegativePrompt(item.negativePrompt);
                              setGuidanceScale(item.guidanceScale);
                              setSelectedModel(item.model);
                              setAspectRatio(item.aspectRatio);
                              setShowHistory(false);
                            }}
                            className="w-full py-1.5 bg-white text-black text-[10px] font-bold rounded"
                          >
                            Restore
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showUpscaleConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl"
                >
                  <h3 className="text-lg font-bold mb-2">Upscale Image?</h3>
                  <p className="text-sm text-zinc-400 mb-6">
                    Upscaling will increase the resolution and detail of your image. This process takes a few seconds.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowUpscaleConfirm(false)}
                      className="flex-1 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpscale}
                      className="flex-1 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-sm font-bold transition-colors"
                    >
                      Confirm
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {queue.length > 0 && (
            <div className="absolute top-4 left-4 z-30 bg-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Queue: {queue.length} pending
            </div>
          )}

          {error ? (
            <div className="flex flex-col items-center justify-center text-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">Generation Failed</h3>
              <p className="text-sm text-zinc-400">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="mt-6 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium transition-colors"
              >
                Dismiss
              </button>
            </div>
          ) : isGenerating ? (
            <div className="flex flex-col items-center justify-center text-zinc-500">
              <div className="w-16 h-16 relative mb-4">
                <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-pink-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-sm font-medium animate-pulse">Summoning your creation...</p>
            </div>
          ) : generatedImage ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                scale: zoom, 
                rotate: rotation,
                scaleX: flipH ? -zoom : zoom,
                scaleY: flipV ? -zoom : zoom
              }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="relative max-w-full max-h-full rounded-xl overflow-hidden shadow-2xl shadow-pink-500/10 ring-1 ring-zinc-800"
            >
              <img
                src={generatedImage}
                alt="Generated artwork"
                className="max-w-full max-h-[calc(100vh-12rem)] object-contain"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-600 text-center max-w-md">
              <div className="w-20 h-20 rounded-2xl bg-zinc-900 flex items-center justify-center mb-6 border border-zinc-800">
                <ImageIcon className="w-10 h-10 text-zinc-700" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-300 mb-2">Ready to Create</h3>
              <p className="text-sm">
                Enter a prompt on the left and click generate to bring your imagination to life.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
