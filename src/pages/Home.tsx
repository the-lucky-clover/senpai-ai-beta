import { useState, useEffect, ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { Sparkles, Zap, Shield, Image as ImageIcon, Wand2, Heart, Compass, RefreshCw, Upload, Play, Film, Clock } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import PopoverThumbnail from "../components/PopoverThumbnail";

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

const initialSampleMedia = [
  { type: 'video', src: "https://assets.mixkit.co/videos/preview/mixkit-anime-girl-in-the-rain-at-night-40121-large.mp4", poster: "https://picsum.photos/seed/anime1/400/600" },
  { type: 'image', src: "https://picsum.photos/seed/anime2/400/400" },
  { type: 'video', src: "https://assets.mixkit.co/videos/preview/mixkit-anime-style-cityscape-at-night-40118-large.mp4", poster: "https://picsum.photos/seed/anime3/400/500" },
  { type: 'image', src: "https://picsum.photos/seed/anime4/400/700" },
  { type: 'video', src: "https://assets.mixkit.co/videos/preview/mixkit-anime-girl-walking-in-a-field-40120-large.mp4", poster: "https://picsum.photos/seed/anime5/400/450" },
  { type: 'image', src: "https://picsum.photos/seed/anime6/400/550" },
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
  const [media, setMedia] = useState(initialSampleMedia);
  const [videoIndex, setVideoIndex] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [customVideo, setCustomVideo] = useState<string | null>(null);
  const [showVideoSelector, setShowVideoSelector] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type?: 'video' | 'image'; src: string; prompt?: string; author?: string; id?: string | number } | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

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
      const userMedia = communityItems.map((item: any) => ({
        type: item.type || 'image',
        src: item.src,
        poster: item.poster
      }));
      setMedia([...userMedia, ...initialSampleMedia].slice(0, 10));
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-20 pb-40 overflow-hidden min-h-[95vh] flex items-center bg-black">
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
                className="w-full h-full object-cover scale-105"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center intro-fly-on">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-sm text-zinc-300 mb-8 backdrop-blur-md shimmer-cyber"
          >
            <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
            <span>Senpai-AI v2.0 is now live</span>
          </motion.div>
          
          <h1 className="text-6xl sm:text-8xl md:text-[8rem] lg:text-[10rem] xl:text-[13rem] font-black tracking-tighter leading-[0.85] mb-8 glow-dark transition-all duration-500 hover:scale-[1.02]">
            Create Uncensored{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-violet-500 to-indigo-500 drop-shadow-[0_0_30px_rgba(236,72,153,0.3)] whitespace-nowrap">
              Anime AI Art
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 glow-dark intro-fly-on" style={{ animationDelay: "0.2s" }}>
            The most advanced AI image generator for anime, manga, and realistic character creation. Bring your imagination to life in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 intro-fly-on" style={{ animationDelay: "0.4s" }}>
            <Link
              to="/create"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-zinc-200 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shimmer-cyber shadow-[0_0_25px_rgba(255,255,255,0.2)] glow-dark relative z-10 overflow-hidden"
            >
              <Sparkles className="w-5 h-5" />
              Start Creating for Free
            </Link>
            <Link
              to="/explore"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-zinc-900 text-white font-bold text-lg border border-zinc-800 hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shimmer-cyber glow-dark shadow-[0_0_20px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden"
            >
              <Compass className="w-5 h-5" />
              Explore Gallery
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-16 flex flex-col items-center gap-4 intro-fly-on" style={{ animationDelay: "0.6s" }}>
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
          </div>
        </div>
      </section>

      {/* Explore Media Carousel */}
      <section className="py-24 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.05)_0%,transparent_70%)]" />
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">Trending Generations</h2>
              <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Real-time feed from the Senpai-AI community</p>
            </div>
            <Link to="/explore" className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-2 group">
              View All Gallery
              <Compass className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {media.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer hover:neon-glow-pink transition-all"
                onClick={(e) => {
                  const target = e.currentTarget;
                  setAnchorRect(target.getBoundingClientRect());
                  setSelectedItem(item);
                }}
              >
                {item.type === 'video' ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    src={item.src}
                    poster={item.poster}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <img
                    src={item.src}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt="Generation"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 border border-white/20" />
                      <span className="text-[10px] font-bold text-white">@creator</span>
                    </div>
                    {item.type === 'video' ? <Film className="w-3 h-3 text-pink-500" /> : <ImageIcon className="w-3 h-3 text-cyan-500" />}
                  </div>
                </div>
                <div className="absolute top-3 right-3 p-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart className="w-3 h-3 text-white" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {selectedItem && anchorRect && (
          <PopoverThumbnail
            item={selectedItem}
            anchorRect={anchorRect}
            onClose={() => {
              setSelectedItem(null);
              setAnchorRect(null);
            }}
          />
        )}
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

      {/* Pricing / CTA Section */}
      <section className="py-32 bg-zinc-950 relative overflow-hidden border-y border-white/5">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.1),transparent_70%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-xs font-bold text-pink-500 uppercase tracking-widest">
                <Clock className="w-3 h-3" />
                Limited Offer: 82% Off Lifetime Access
              </div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.9]">
                Stop Dreaming. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 italic">Start Manifesting.</span>
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed max-w-lg">
                The world's elite anime artists are already using Senpai-AI to dominate the creative space. Don't be the one left behind with outdated tools. Join the <span className="text-white font-bold">Evolution</span> today.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Unlimited Uncensored Generations",
                  "Priority GPU Architecture Access",
                  "Early Access to Video Synthesis v3",
                  "Commercial Rights Included"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-zinc-300">
                    <div className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
                      <Zap className="w-3 h-3 text-pink-500" />
                    </div>
                    <span className="text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-pink-500/20 blur-[120px] rounded-full pointer-events-none" />
              <div className="bg-zinc-900/50 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 relative overflow-hidden shimmer-cyber">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Founders Elite</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-white">$19</span>
                      <span className="text-zinc-500 line-through text-lg">$99</span>
                    </div>
                    <p className="text-pink-500 text-[10px] font-bold mt-2 animate-pulse whitespace-nowrap">ONLY 14 SLOTS REMAINING TODAY</p>
                  </div>
                  <div className="px-3 py-1 bg-white text-black text-[10px] font-black rounded-full uppercase tracking-tighter">Save $80</div>
                </div>

                <div className="space-y-4">
                  <Link
                    to="/create"
                    className="w-full py-5 bg-white text-black rounded-2xl font-black text-center block hover:bg-zinc-200 transition-all hover:scale-[1.02] shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                  >
                    CLAIM ACCESS NOW
                  </Link>
                  <p className="text-center text-[10px] text-zinc-500">Secure Checkout • Instant Delivery • 7-Day Satisfaction Guarantee</p>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-zinc-800" />
                    ))}
                  </div>
                  <p className="text-[10px] text-zinc-400 whitespace-nowrap">Join <span className="text-white font-bold">14,281</span> other visionaries already inside.</p>
                </div>
              </div>
            </div>
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
                <div className="text-xs text-zinc-500 uppercase tracking-widest whitespace-nowrap">{stat.label}</div>
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
