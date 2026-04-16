import { useState, useRef, ChangeEvent } from "react";
import { Sparkles, Settings2, Video, Download, Share2, Loader2, Wand2, Upload, AlertCircle, X, Play, Film, Move, Clock, Monitor, Activity, Palette, Scissors, Sliders, Layers, Plus, Volume2, Type, Gauge, FileVideo, Music, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

const videoModels = [
  { id: "senpai-video-v1", name: "Senpai Video V1 (Beta)" },
  { id: "anime-motion", name: "Anime Motion Pro" },
];

const durations = [
  { id: "5s", label: "5 Seconds" },
  { id: "10s", label: "10 Seconds" },
];

const resolutions = [
  { id: "480p", label: "480p" },
  { id: "720p", label: "720p" },
  { id: "1080p", label: "1080p" },
  { id: "4k", label: "4K" },
];

const frameRates = [
  { id: "24", label: "24 FPS" },
  { id: "30", label: "30 FPS" },
  { id: "60", label: "60 FPS" },
];

const animationStyles = [
  { id: "fluid", label: "Fluid", desc: "Smooth, natural motion" },
  { id: "cinematic", label: "Cinematic", desc: "Dramatic camera angles" },
  { id: "hand-drawn", label: "Hand-drawn", desc: "Classic anime aesthetic" },
  { id: "cyberpunk", label: "Cyberpunk", desc: "Glitchy, neon-heavy motion" },
  { id: "ethereal", label: "Ethereal", desc: "Dreamy, slow-motion flow" },
  { id: "retro-90s", label: "Retro 90s", desc: "Low-fi, nostalgic cel-shaded" },
  { id: "cel-shading", label: "Cel Shading", desc: "Bold outlines, flat colors" },
  { id: "motion-blur", label: "Motion Blur", desc: "High-speed action streaks" },
  { id: "pixel-art", label: "Pixel Art", desc: "Retro 8-bit/16-bit style" },
];

const musicTracks = [
  { id: "lofi", name: "Lofi Chill", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: "synthwave", name: "Synthwave Night", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: "orchestral", name: "Epic Anime", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
];

const videoTemplates = [
  { id: "windy", name: "Windy Day", prompt: "Hair and clothes blowing in a gentle breeze, cherry blossoms falling", style: "fluid" },
  { id: "night-walk", name: "Night Walk", prompt: "Walking through a neon-lit cyberpunk city, reflections on puddles", style: "cinematic" },
  { id: "combat", name: "Combat Burst", prompt: "Fast-paced action sequence, energy sparks, dynamic camera", style: "hand-drawn" },
  { id: "portrait", name: "Soft Smile", prompt: "Close-up portrait, character slowly smiling, soft lighting", style: "fluid" },
];

export default function VideoPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState(videoModels[0].id);
  const [duration, setDuration] = useState("5s");
  const [resolution, setResolution] = useState("720p");
  const [frameRate, setFrameRate] = useState("30");
  const [animationStyle, setAnimationStyle] = useState("fluid");
  const [motionScale, setMotionScale] = useState(5);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Editor State
  const [showEditor, setShowEditor] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [activeEffect, setActiveEffect] = useState("none");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(80);
  const [textOverlay, setTextOverlay] = useState("");
  const [textPosition, setTextPosition] = useState("bottom");
  const [textAnimation, setTextAnimation] = useState("none"); // none, slide, fade, bounce, typing, glow, shake
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [audioEffects, setAudioEffects] = useState({
    reverb: 0,
    echo: 0,
    pitch: 1,
  });
  
  // Undo/Redo History
  const [historyStack, setHistoryStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);

  const saveToHistory = () => {
    const currentState = { trimStart, trimEnd, activeEffect, volume, playbackSpeed, textOverlay, brightness, contrast, fadeIn, fadeOut };
    setHistoryStack(prev => [...prev.slice(-19), currentState]);
    setRedoStack([]);
  };

  const undo = () => {
    if (historyStack.length === 0) return;
    const currentState = { trimStart, trimEnd, activeEffect, volume, playbackSpeed, textOverlay, brightness, contrast, fadeIn, fadeOut };
    const prevState = historyStack[historyStack.length - 1];
    
    setRedoStack(prev => [...prev, currentState]);
    setHistoryStack(prev => prev.slice(0, -1));
    
    setTrimStart(prevState.trimStart);
    setTrimEnd(prevState.trimEnd);
    setActiveEffect(prevState.activeEffect);
    setVolume(prevState.volume);
    setPlaybackSpeed(prevState.playbackSpeed);
    setTextOverlay(prevState.textOverlay);
    setBrightness(prevState.brightness);
    setContrast(prevState.contrast);
    setFadeIn(prevState.fadeIn);
    setFadeOut(prevState.fadeOut);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const currentState = { trimStart, trimEnd, activeEffect, volume, playbackSpeed, textOverlay, brightness, contrast, fadeIn, fadeOut };
    const nextState = redoStack[redoStack.length - 1];
    
    setHistoryStack(prev => [...prev, currentState]);
    setRedoStack(prev => prev.slice(0, -1));
    
    setTrimStart(nextState.trimStart);
    setTrimEnd(nextState.trimEnd);
    setActiveEffect(nextState.activeEffect);
    setVolume(nextState.volume);
    setPlaybackSpeed(nextState.playbackSpeed);
    setTextOverlay(nextState.textOverlay);
    setBrightness(nextState.brightness);
    setContrast(nextState.contrast);
    setFadeIn(nextState.fadeIn);
    setFadeOut(nextState.fadeOut);
  };
  const [exportFormat, setExportFormat] = useState("mp4");
  const [exportQuality, setExportQuality] = useState("high");
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMusicUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedMusic(reader.result as string);
      reader.readAsDataURL(file);
    }
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

  const handleGenerate = async () => {
    if (!prompt.trim() && !referenceImage) {
      setError("Please enter a prompt or upload a reference image.");
      return;
    }

    setIsGenerating(true);
    setGeneratedVideo(null);
    setShowEditor(false);
    setError(null);
    
    try {
      // Simulate video generation time
      await new Promise(resolve => setTimeout(resolve, 5000));

      const videoUrls = [
        "https://assets.mixkit.co/videos/preview/mixkit-anime-girl-in-the-rain-at-night-40121-large.mp4",
        "https://assets.mixkit.co/videos/preview/mixkit-anime-style-cityscape-at-night-40118-large.mp4",
        "https://assets.mixkit.co/videos/preview/mixkit-anime-girl-walking-in-a-field-40120-large.mp4"
      ];
      
      setGeneratedVideo(videoUrls[Math.floor(Math.random() * videoUrls.length)]);
    } catch (err) {
      setError("Video generation failed. Please try again later.");
    } finally {
      setIsGenerating(false);
    }
  };

  const applyTemplate = (template: typeof videoTemplates[0]) => {
    setPrompt(template.prompt);
    setAnimationStyle(template.style);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-screen overflow-hidden bg-zinc-950">
      {/* Sidebar Controls */}
      <div className="w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-zinc-800 bg-zinc-900/50 flex flex-col overflow-y-auto">
        <div className="p-4 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500">
              <Video className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-lg">Video Studio</h2>
          </div>

          {/* Video Templates */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Quick Templates
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {videoTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t)}
                  className="flex-shrink-0 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-medium text-zinc-400 hover:border-pink-500/50 hover:text-white transition-all"
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Wand2 className="w-4 h-4" /> Video Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the motion: hair blowing in the wind, walking through a neon city, smiling at camera..."
              className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none"
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {["cinematic lighting", "high detailed", "vibrant colors", "dynamic camera", "cherry blossoms", "neon lights"].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(prev => prev ? `${prev}, ${suggestion}` : suggestion)}
                  className="px-2 py-1 rounded-md bg-zinc-800 text-[10px] text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Image to Video */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Upload className="w-4 h-4" /> Reference Image (Image-to-Video)
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
                <span className="text-xs font-medium">Upload image to animate</span>
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

          {/* Video Model */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Settings2 className="w-4 h-4" /> Video Model
            </label>
            <div className="grid gap-2">
              {videoModels.map((model) => (
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

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Duration
            </label>
            <div className="grid grid-cols-2 gap-2">
              {durations.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDuration(d.id)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
                    duration === d.id
                      ? "bg-pink-500/10 border-pink-500/50 text-pink-400"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Motion Scale */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Move className="w-4 h-4" /> Motion Scale
              </label>
              <span className="text-xs text-zinc-500">{motionScale}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={motionScale}
              onChange={(e) => setMotionScale(parseInt(e.target.value))}
              className="w-full accent-pink-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-600">
              <span>Subtle</span>
              <span>Dynamic</span>
            </div>
          </div>

          {/* Granular Settings */}
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Advanced Settings</h3>
            
            {/* Resolution */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Monitor className="w-4 h-4" /> Resolution
              </label>
              <div className="grid grid-cols-4 gap-2">
                {resolutions.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setResolution(r.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                      resolution === r.id
                        ? "bg-pink-500/10 border-pink-500/50 text-pink-400"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Rate */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Frame Rate
              </label>
              <div className="grid grid-cols-3 gap-2">
                {frameRates.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFrameRate(f.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                      frameRate === f.id
                        ? "bg-pink-500/10 border-pink-500/50 text-pink-400"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Animation Style */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Palette className="w-4 h-4" /> Animation Style
              </label>
              <div className="space-y-2">
                {animationStyles.slice(0, 5).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setAnimationStyle(s.id)}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg text-left border transition-colors",
                      animationStyle === s.id
                        ? "bg-pink-500/10 border-pink-500/50"
                        : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                    )}
                  >
                    <div className={cn("text-xs font-bold", animationStyle === s.id ? "text-pink-400" : "text-zinc-300")}>{s.label}</div>
                    <div className="text-[10px] text-zinc-500">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Export Settings In Sidebar */}
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <FileVideo className="w-4 h-4" /> Export Configuration
              </h3>
              
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 uppercase font-bold">Format</label>
                <select 
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-pink-500 outline-none"
                >
                  <option value="mp4">MP4 Video</option>
                  <option value="gif">Animated GIF</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 uppercase font-bold">Quality</label>
                <select 
                  value={exportQuality}
                  onChange={(e) => setExportQuality(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-pink-500 outline-none"
                >
                  <option value="standard">Standard Quality</option>
                  <option value="high">High Definition</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto p-4 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-md sticky bottom-0 z-10">
          <button
            onClick={handleGenerate}
            disabled={(!prompt && !referenceImage) || isGenerating}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shimmer relative overflow-hidden"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Generate Video
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col bg-zinc-950 relative overflow-hidden">
        {/* Toolbar */}
        <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/30">
          <div className="flex items-center gap-4">
            {generatedVideo && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowEditor(!showEditor)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    showEditor ? "bg-pink-500 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  )}
                >
                  <Scissors className="w-4 h-4" />
                  {showEditor ? "Close Editor" : "Open Editor"}
                </button>
                {showEditor && (
                  <div className="flex items-center gap-1 border-l border-zinc-800 pl-2">
                    <button 
                      onClick={undo}
                      disabled={historyStack.length === 0}
                      className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 disabled:opacity-30"
                      title="Undo"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={redo}
                      disabled={redoStack.length === 0}
                      className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 disabled:opacity-30"
                      title="Redo"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50" disabled={!generatedVideo}>
              <Download className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50" disabled={!generatedVideo}>
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center relative">
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
              <div className="w-24 h-24 relative mb-6">
                <div className="absolute inset-0 border-4 border-zinc-800 rounded-2xl"></div>
                <div className="absolute inset-0 border-4 border-pink-500 rounded-2xl border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Film className="w-8 h-8 text-pink-500 animate-pulse" />
                </div>
              </div>
              <p className="text-sm font-medium animate-pulse">Rendering your video...</p>
              <p className="text-xs text-zinc-600 mt-2">This usually takes about 30-60 seconds</p>
            </div>
          ) : generatedVideo ? (
            <div className="flex flex-col items-center w-full max-w-5xl gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-pink-500/10 ring-1 ring-zinc-800 bg-black transition-all duration-500",
                  activeEffect === "vintage" && "sepia brightness-90 contrast-110",
                  activeEffect === "glow" && "brightness-110 saturate-150",
                  activeEffect === "bw" && "grayscale"
                )}
                style={{ 
                  filter: `brightness(${brightness}%) contrast(${contrast}%) ${
                    activeEffect === "vintage" ? "sepia(0.8)" : 
                    activeEffect === "bw" ? "grayscale(1)" : ""
                  }` 
                }}
              >
                <video
                  key={generatedVideo}
                  ref={videoRef}
                  src={generatedVideo}
                  autoPlay
                  loop
                  muted
                  controls
                  preload="auto"
                  className="w-full h-full object-contain"
                  style={{ playbackRate: playbackSpeed }}
                />
                
                {textOverlay && (
                  <motion.div 
                    initial={textAnimation === "slide" ? { x: -100, opacity: 0 } : { opacity: 0 }}
                    animate={
                      textAnimation === "slide" ? { x: 0, opacity: 1 } :
                      textAnimation === "fade" ? { opacity: [0, 1] } :
                      textAnimation === "bounce" ? { y: [0, -20, 0], opacity: 1 } :
                      textAnimation === "glow" ? { opacity: [1, 0.5, 1], filter: ["drop-shadow(0 0 0px #fff)", "drop-shadow(0 0 20px #ff0080)", "drop-shadow(0 0 0px #fff)"] } :
                      textAnimation === "shake" ? { x: [0, -5, 5, -5, 5, 0], opacity: 1 } :
                      { opacity: 1 }
                    }
                    transition={
                      textAnimation === "bounce" || textAnimation === "glow" || textAnimation === "shake" 
                        ? { repeat: Infinity, duration: textAnimation === "shake" ? 0.5 : 2 } 
                        : { duration: 0.5 }
                    }
                    className={cn(
                      "absolute inset-x-0 p-8 flex justify-center pointer-events-none",
                      textPosition === "top" ? "top-0" : textPosition === "center" ? "top-1/2 -translate-y-1/2" : "bottom-0"
                    )}
                  >
                    <span className="text-white font-bold text-2xl md:text-4xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-center">
                      {textAnimation === "typing" ? (
                        <motion.span
                          initial={{ width: 0 }}
                          animate={{ width: "auto" }}
                          transition={{ duration: 2, ease: "linear" }}
                          className="overflow-hidden whitespace-nowrap block"
                        >
                          {textOverlay}
                        </motion.span>
                      ) : textOverlay}
                    </span>
                  </motion.div>
                )}
                
                {/* Fades */}
                <AnimatePresence>
                  {fadeIn && (
                    <motion.div 
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1 }}
                      className="absolute inset-0 bg-black pointer-events-none z-20"
                    />
                  )}
                  {fadeOut && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1 }}
                      className="absolute inset-0 bg-black pointer-events-none z-20"
                    />
                  )}
                </AnimatePresence>

                {/* Audio Visualizer Overlay */}
                {selectedMusic && (
                  <div className="absolute bottom-4 left-4 right-4 h-8 flex items-end gap-1 pointer-events-none opacity-50">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [4, Math.random() * 32 + 4, 4] }}
                        transition={{ repeat: Infinity, duration: 0.5 + Math.random() }}
                        className="flex-1 bg-pink-500 rounded-t-sm"
                      />
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Advanced Editor Panel */}
              <AnimatePresence>
                {showEditor && (
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl"
                  >
                    <div className="grid md:grid-cols-3 gap-8">
                      {/* Column 1: Audio & Music */}
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                            <Music className="w-4 h-4" /> Audio & Music
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-[10px] text-zinc-500">
                              <span>Volume</span>
                              <span>{volume}%</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" max="100" 
                              value={volume} 
                              onMouseDown={saveToHistory}
                              onChange={(e) => setVolume(parseInt(e.target.value))}
                              className="w-full accent-pink-500"
                            />
                          </div>
                          
                          {/* Audio Effects */}
                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="space-y-1">
                              <span className="text-[10px] text-zinc-500">Reverb</span>
                              <input 
                                type="range" min="0" max="100" value={audioEffects.reverb} 
                                onMouseDown={saveToHistory}
                                onChange={(e) => setAudioEffects(prev => ({ ...prev, reverb: parseInt(e.target.value) }))}
                                className="w-full accent-pink-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] text-zinc-500">Echo</span>
                              <input 
                                type="range" min="0" max="100" value={audioEffects.echo} 
                                onMouseDown={saveToHistory}
                                onChange={(e) => setAudioEffects(prev => ({ ...prev, echo: parseInt(e.target.value) }))}
                                className="w-full accent-pink-500"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-zinc-500">
                              <span>Pitch Shift</span>
                              <span>{audioEffects.pitch}x</span>
                            </div>
                            <input 
                              type="range" min="0.5" max="2" step="0.1" value={audioEffects.pitch} 
                              onMouseDown={saveToHistory}
                              onChange={(e) => setAudioEffects(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                              className="w-full accent-pink-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <span className="text-[10px] text-zinc-500 block mb-1">Background Track</span>
                            <div className="grid grid-cols-2 gap-2">
                              {musicTracks.map(track => (
                                <button
                                  key={track.id}
                                  onClick={() => {
                                    saveToHistory();
                                    setSelectedMusic(track.url);
                                  }}
                                  className={cn(
                                    "px-2 py-1.5 rounded-lg text-[10px] font-medium border transition-all",
                                    selectedMusic === track.url ? "bg-pink-500 border-pink-400 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-400"
                                  )}
                                >
                                  {track.name}
                                </button>
                              ))}
                              <button 
                                onClick={() => musicInputRef.current?.click()}
                                className="px-2 py-1.5 rounded-lg text-[10px] font-medium border border-dashed border-zinc-700 text-zinc-500 hover:border-zinc-500"
                              >
                                + Custom
                              </button>
                            </div>
                            <input type="file" ref={musicInputRef} onChange={handleMusicUpload} accept="audio/*" className="hidden" />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                            <Gauge className="w-4 h-4" /> Speed & Fades
                          </h4>
                          <div className="flex gap-2">
                            {[0.5, 1, 1.5, 2].map(speed => (
                              <button
                                key={speed}
                                onClick={() => {
                                  saveToHistory();
                                  setPlaybackSpeed(speed);
                                }}
                                className={cn(
                                  "flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all",
                                  playbackSpeed === speed ? "bg-pink-500 border-pink-400 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-500"
                                )}
                              >
                                {speed}x
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                saveToHistory();
                                setFadeIn(!fadeIn);
                              }}
                              className={cn(
                                "py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                                fadeIn ? "bg-pink-500 text-white" : "bg-zinc-950 text-zinc-500"
                              )}
                            >
                              Fade In
                            </button>
                            <button
                              onClick={() => {
                                saveToHistory();
                                setFadeOut(!fadeOut);
                              }}
                              className={cn(
                                "py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                                fadeOut ? "bg-pink-500 text-white" : "bg-zinc-950 text-zinc-500"
                              )}
                            >
                              Fade Out
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Column 2: Text & Timeline */}
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                            <Type className="w-4 h-4" /> Text & Keyframes
                          </h4>
                          <input 
                            type="text"
                            value={textOverlay}
                            onChange={(e) => setTextOverlay(e.target.value)}
                            placeholder="Enter overlay text..."
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-pink-500 outline-none"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <span className="text-[10px] text-zinc-500">Position</span>
                              <div className="flex gap-1">
                                {['top', 'center', 'bottom'].map(pos => (
                                  <button
                                    key={pos}
                                    onClick={() => setTextPosition(pos)}
                                    className={cn(
                                      "flex-1 py-1 rounded text-[9px] font-bold border capitalize transition-all",
                                      textPosition === pos ? "bg-pink-500 border-pink-400 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-500"
                                    )}
                                  >
                                    {pos[0]}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] text-zinc-500">Animation</span>
                              <div className="flex gap-1 flex-wrap">
                                {['none', 'slide', 'fade', 'bounce', 'typing', 'glow', 'shake'].map(anim => (
                                  <button
                                    key={anim}
                                    onClick={() => {
                                      saveToHistory();
                                      setTextAnimation(anim);
                                    }}
                                    className={cn(
                                      "px-2 py-1 rounded text-[9px] font-bold border capitalize transition-all",
                                      textAnimation === anim ? "bg-pink-500 border-pink-400 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-500"
                                    )}
                                  >
                                    {anim[0].toUpperCase()}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                            <Layers className="w-4 h-4" /> Visual Timeline
                          </h4>
                          <div className="relative h-20 bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden">
                            {/* Timeline Grid */}
                            <div className="absolute inset-0 flex justify-between px-2 opacity-10 pointer-events-none">
                              {[...Array(10)].map((_, i) => (
                                <div key={i} className="w-px h-full bg-white" />
                              ))}
                            </div>
                            
                            {/* Video Track */}
                            <div className="absolute top-2 left-0 right-0 h-6 px-2">
                              <div className="text-[8px] text-zinc-500 mb-1">Video Track</div>
                              <div className="relative h-2 bg-zinc-800 rounded-full">
                                <div 
                                  className="absolute h-full bg-pink-500/40 border-x border-pink-500" 
                                  style={{ left: `${trimStart}%`, right: `${100 - trimEnd}%` }} 
                                />
                              </div>
                            </div>

                            {/* Text Track */}
                            <div className="absolute top-10 left-0 right-0 h-6 px-2">
                              <div className="text-[8px] text-zinc-500 mb-1">Text Track</div>
                              <div className="relative h-2 bg-zinc-800 rounded-full">
                                {textOverlay && (
                                  <div className="absolute inset-y-0 bg-violet-500/40 border-x border-violet-500 w-1/2 left-1/4" />
                                )}
                              </div>
                            </div>

                            {/* Range Inputs (Hidden but functional) */}
                            <input 
                              type="range" min="0" max="100" value={trimStart} 
                              onMouseDown={saveToHistory}
                              onChange={(e) => setTrimStart(Math.min(parseInt(e.target.value), trimEnd - 10))}
                              className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <input 
                              type="range" min="0" max="100" value={trimEnd} 
                              onMouseDown={saveToHistory}
                              onChange={(e) => setTrimEnd(Math.max(parseInt(e.target.value), trimStart + 10))}
                              className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                          </div>
                          <div className="flex justify-between text-[9px] text-zinc-500">
                            <span>00:00</span>
                            <span>{duration}</span>
                          </div>
                        </div>
                      </div>

                      {/* Column 3: Filters & Export */}
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                            <Sliders className="w-4 h-4" /> Filters & Adjust
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-[10px] text-zinc-500">Brightness</span>
                              <input type="range" min="50" max="150" value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} className="w-full accent-pink-500" />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] text-zinc-500">Contrast</span>
                              <input type="range" min="50" max="150" value={contrast} onChange={(e) => setContrast(parseInt(e.target.value))} className="w-full accent-pink-500" />
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {['none', 'vintage', 'glow', 'bw'].map(effect => (
                              <button
                                key={effect}
                                onClick={() => {
                                  saveToHistory();
                                  setActiveEffect(effect);
                                }}
                                className={cn(
                                  "py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                                  activeEffect === effect ? "bg-pink-500 border-pink-400 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-500"
                                )}
                              >
                                {effect.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                            <FileVideo className="w-4 h-4" /> Export Settings
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {['mp4', 'gif'].map(fmt => (
                              <button
                                key={fmt}
                                onClick={() => setExportFormat(fmt)}
                                className={cn(
                                  "py-1.5 rounded-lg text-[10px] font-bold border uppercase transition-all",
                                  exportFormat === fmt ? "bg-pink-500 border-pink-400 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-500"
                                )}
                              >
                                {fmt}
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {['standard', 'high'].map(q => (
                              <button
                                key={q}
                                onClick={() => setExportQuality(q)}
                                className={cn(
                                  "py-1.5 rounded-lg text-[10px] font-bold border capitalize transition-all",
                                  exportQuality === q ? "bg-pink-500 border-pink-400 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-500"
                                )}
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between pt-6 border-t border-zinc-800">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={undo}
                          disabled={historyStack.length === 0}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-white disabled:opacity-50 transition-colors"
                        >
                          Undo
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors">
                          <Plus className="w-4 h-4" /> Add Clip
                        </button>
                        <span className="text-[10px] text-zinc-500">Merge multiple clips into one sequence</span>
                      </div>
                      <button className="px-6 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors">
                        Apply Changes
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-600 text-center max-w-md">
              <div className="w-20 h-20 rounded-2xl bg-zinc-900 flex items-center justify-center mb-6 border border-zinc-800">
                <Film className="w-10 h-10 text-zinc-700" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-300 mb-2">Anime Video Studio</h3>
              <p className="text-sm">
                Transform your text prompts or static images into stunning anime-style animations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
