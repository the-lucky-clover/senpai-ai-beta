import { useState, useEffect, ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { Sparkles, Zap, Shield, Image as ImageIcon, Wand2, Heart, Compass, RefreshCw, Upload, Play, Film } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const features = [
  {
    icon: Wand2,
    title: "Advanced Anime Models",
    description: "State-of-the-art models fine-tuned specifically for anime and manga art styles.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Generate high-resolution images in seconds with our optimized GPU cluster.",
  },
  {
    icon: Shield,
    title: "Private & Secure",
    description: "Your generations and prompts are completely private and secure.",
  },
];

const initialSampleImages = [
  "https://picsum.photos/seed/anime1/400/600",
  "https://picsum.photos/seed/anime2/400/400",
  "https://picsum.photos/seed/anime3/400/500",
  "https://picsum.photos/seed/anime4/400/700",
  "https://picsum.photos/seed/anime5/400/450",
  "https://picsum.photos/seed/anime6/400/550",
];

const backgroundVideos = [
  {
    id: "anime-clouds",
    name: "Anime Clouds",
    src: "https://cdn.pixabay.com/video/2020/08/05/46447-449560769_large.mp4",
    poster: "https://cdn.pixabay.com/photo/2020/10/21/21/42/anime-5674338_1280.jpg"
  },
  {
    id: "stars",
    name: "Night Sky",
    src: "https://assets.mixkit.co/videos/preview/mixkit-stars-in-the-night-sky-11641-large.mp4",
    poster: "https://images.pexels.com/photos/2088205/pexels-photo-2088205.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk City",
    src: "https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-city-street-at-night-with-neon-lights-40134-large.mp4",
    poster: "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  },
  {
    id: "particles",
    name: "Digital Flow",
    src: "https://assets.mixkit.co/videos/preview/mixkit-abstract-animation-of-blue-and-purple-particles-23157-large.mp4",
    poster: "https://images.pexels.com/photos/310452/pexels-photo-310452.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  }
];

export default function Home() {
  const [images, setImages] = useState(initialSampleImages);
  const [videoIndex, setVideoIndex] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [customVideo, setCustomVideo] = useState<string | null>(null);
  const [showVideoSelector, setShowVideoSelector] = useState(false);

  const bgVideo = backgroundVideos[videoIndex];
  const activeVideoSrc = customVideo || bgVideo.src;

  const cycleVideo = () => {
    setCustomVideo(null);
    setVideoIndex((prev) => (prev + 1) % backgroundVideos.length);
    setVideoError(false);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomVideo(url);
      setVideoError(false);
    }
  };

  useEffect(() => {
    // Pick the first video (the new one requested) on mount
    setVideoIndex(0);

    const communityItems = JSON.parse(localStorage.getItem("senpai_community") || "[]");
    if (communityItems.length > 0) {
      const userImages = communityItems.map((item: any) => item.src);
      setImages([...userImages, ...initialSampleImages].slice(0, 8));
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden min-h-[85vh] flex items-center bg-black">
        {/* Background Video with Fade In */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeVideoSrc}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="w-full h-full"
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                src={activeVideoSrc}
                poster={bgVideo.poster}
                onError={() => setVideoError(true)}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
        </div>

        {/* Home Background Controls */}
        <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowVideoSelector(!showVideoSelector)}
              className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[10px] text-zinc-300 hover:text-white hover:bg-white/10 transition-all"
            >
              <Film className="w-3 h-3 text-pink-500" />
              Video Settings
            </button>
          </div>

          <AnimatePresence>
            {showVideoSelector && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="p-4 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl w-64 space-y-4 shadow-2xl"
              >
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Presets</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {backgroundVideos.map((v, i) => (
                      <button
                        key={v.id}
                        onClick={() => {
                          setCustomVideo(null);
                          setVideoIndex(i);
                        }}
                        className={cn(
                          "aspect-video rounded-lg overflow-hidden border-2 transition-all",
                          !customVideo && videoIndex === i ? "border-pink-500" : "border-zinc-800 hover:border-zinc-700"
                        )}
                      >
                        <img src={v.poster} className="w-full h-full object-cover" alt={v.name} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Custom</h4>
                  <label className="flex items-center justify-center gap-2 w-full py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-[10px] font-bold text-white cursor-pointer hover:bg-zinc-700 transition-colors">
                    <Upload className="w-3 h-3 text-pink-400" />
                    Upload Video
                    <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Micro-attribution */}
        <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end gap-2">
          <button 
            onClick={cycleVideo}
            className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[10px] text-zinc-300 hover:text-white hover:bg-pink-500/20 hover:border-pink-500/30 transition-all group"
          >
            <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" /> 
            Change Environment
          </button>
          <div className="text-[10px] text-zinc-500 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full border border-white/5">
            Video via Mixkit
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-sm text-zinc-300 mb-8"
          >
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span>Senpai-AI v2.0 is now live</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 glow-dark"
          >
            Create Uncensored <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
              Anime AI Art
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 glow-dark"
          >
            The most advanced AI image generator for anime, manga, and realistic character creation. Bring your imagination to life in seconds.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/create"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-zinc-200 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shimmer shadow-[0_0_25px_rgba(255,255,255,0.2)] glow-dark relative z-10 overflow-hidden"
              style={{ "--shimmer-delay": "1s" } as any}
            >
              <Sparkles className="w-5 h-5" />
              Start Creating for Free
            </Link>
            <Link
              to="/explore"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-zinc-900 text-white font-bold text-lg border border-zinc-800 hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shimmer glow-dark shadow-[0_0_20px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden"
              style={{ "--shimmer-delay": "3s" } as any}
            >
              <Compass className="w-5 h-5" />
              Explore Gallery
            </Link>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 flex flex-col items-center gap-4"
          >
            <div className="flex -space-x-3 glow-dark">
              {[1, 2, 3, 4, 5].map((i) => (
                <img
                  key={i}
                  src={`https://picsum.photos/seed/user${i}/100/100`}
                  className="w-10 h-10 rounded-full border-2 border-black object-cover shadow-[0_0_15px_rgba(0,0,0,0.8)]"
                  alt="User"
                />
              ))}
              <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-black flex items-center justify-center text-[10px] font-bold shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                +10k
              </div>
            </div>
            <p className="text-sm text-zinc-500 glow-dark">
              Trusted by <span className="text-white font-bold">10,000+</span> anime artists worldwide
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-zinc-950 relative overflow-hidden">
        {/* Top Gradient Overlay */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black to-transparent z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Senpai-AI?</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">The ultimate platform for anime character creation and artistic expression.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800 hover:border-pink-500/50 transition-all group shimmer"
                  style={{ "--shimmer-delay": `${i * 1.5}s` } as any}
                >
                  <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-pink-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-zinc-400 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 border-y border-zinc-900 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Images Generated", value: "2.5M+" },
              { label: "Active Creators", value: "150k+" },
              { label: "Avg. Generation Time", value: "2.4s" },
              { label: "Community Rating", value: "4.9/5" },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500" />
            <span className="font-bold text-lg">Senpai-AI</span>
          </div>
          <div className="text-sm text-zinc-500">
            © {new Date().getFullYear()} Senpai-AI. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-zinc-400">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
