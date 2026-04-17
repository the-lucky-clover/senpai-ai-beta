import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Heart, Eye, Wand2, Download, Star, X, Copy, Check, Clock, Zap, BarChart3, Shield, Film } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import PopoverThumbnail from "../components/PopoverThumbnail";

const categories = ["All", "Anime", "Realistic", "Fantasy", "Cyberpunk", "Mecha", "NSFW", "Companions"];

interface GalleryItem {
  id: string | number;
  type?: 'video' | 'image';
  src: string;
  poster?: string;
  likes: number;
  views: number;
  downloads: number;
  author: string;
  prompt?: string;
  rating: number;
}

const initialGalleryItems: GalleryItem[] = Array.from({ length: 20 }).map((_, i) => {
  const height = [400, 500, 600, 700, 800][Math.floor(Math.random() * 5)];
  const isVideo = i % 5 === 0;
  return {
    id: i,
    type: isVideo ? 'video' : 'image',
    src: isVideo 
      ? `https://assets.mixkit.co/videos/preview/mixkit-anime-girl-in-the-rain-at-night-40121-large.mp4` 
      : `https://picsum.photos/seed/gallery${i}/400/${height}`,
    poster: isVideo ? `https://picsum.photos/seed/poster${i}/400/600` : undefined,
    likes: Math.floor(Math.random() * 1000),
    views: Math.floor(Math.random() * 5000),
    downloads: Math.floor(Math.random() * 500),
    author: `Creator_${Math.floor(Math.random() * 100)}`,
    rating: Math.floor(Math.random() * 5) + 1,
  };
});

function GalleryModal({ item, onClose }: { item: GalleryItem, onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopy = () => {
    navigator.clipboard.writeText(item.prompt || `Masterpiece anime style artwork by ${item.author}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="md:w-3/5 bg-zinc-900 flex items-center justify-center overflow-hidden">
          {item.type === 'video' ? (
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              src={item.src} 
              poster={item.poster} 
              className="max-h-full w-full object-contain" 
            />
          ) : (
            <img 
              src={item.src} 
              alt="Gallery Detail" 
              className="max-h-full w-full object-contain"
              referrerPolicy="no-referrer"
            />
          )}
        </div>

        <div className="md:w-2/5 p-8 overflow-y-auto space-y-6 custom-scrollbar">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-zinc-400">
              {item.author[0]}
            </div>
            <div>
              <div className="text-sm font-bold text-white">@{item.author}</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Elite Creator</div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-3 h-3 text-yellow-500" />
              Negative Prompt / Generation Metadata
            </label>
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-900 text-xs text-zinc-400 leading-relaxed group relative">
              {item.prompt || `Masterpiece anime style artwork by ${item.author}, sharp focus, highly detailed, vibrant colors, professional illustration.`}
              <button 
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-400 hover:text-white transition-all active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-900">
              <div className="text-[9px] font-black text-zinc-600 uppercase tracking-tighter mb-1 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> Timestamp
              </div>
              <div className="text-xs text-zinc-300 font-mono">16.04.2026_16:16</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-900">
              <div className="text-[9px] font-black text-zinc-600 uppercase tracking-tighter mb-1 flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" /> Model Version
              </div>
              <div className="text-xs text-zinc-300 font-mono">Senpai-V4.2_Ultra</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-900">
              <div className="text-[9px] font-black text-zinc-600 uppercase tracking-tighter mb-1 flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" /> Seed
              </div>
              <div className="text-xs text-zinc-300 font-mono">{Math.floor(Math.random() * 9999999)}</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-900">
              <div className="text-[9px] font-black text-zinc-600 uppercase tracking-tighter mb-1 flex items-center gap-1">
                <BarChart3 className="w-2.5 h-2.5" /> Sampler
              </div>
              <div className="text-xs text-zinc-300 font-mono">Euler_a_SDXL</div>
            </div>
          </div>

          <div className="flex items-center gap-6 py-4 border-y border-zinc-900/50">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{item.likes}</div>
              <div className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Favorited</div>
            </div>
            <div className="text-center border-l border-zinc-900/50 pl-6">
              <div className="text-lg font-bold text-white">{item.views}</div>
              <div className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Luminous Views</div>
            </div>
            <div className="text-center border-l border-zinc-900/50 pl-6">
              <div className="text-lg font-bold text-white">{item.downloads}</div>
              <div className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Downloads</div>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => {
                navigate('/create', { 
                  state: { 
                    referenceImage: item.src, 
                    prompt: item.prompt || `Masterpiece anime style artwork by ${item.author}` 
                  } 
                });
                onClose();
              }}
              className="flex-1 py-4 rounded-2xl bg-zinc-900 text-white font-black text-xs uppercase tracking-[0.2em] border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-center gap-2"
            >
              <Wand2 className="w-4 h-4" /> Remake Art
            </button>
            <button className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-pink-500/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 overflow-hidden relative group">
              <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              <Download className="w-4 h-4" /> Save Masterpiece
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Explore() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<GalleryItem[]>(initialGalleryItems);
  const [companions, setCompanions] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const communityItems = JSON.parse(localStorage.getItem("senpai_community") || "[]");
    const communityCompanions = JSON.parse(localStorage.getItem("senpai_companions") || "[]");
    
    if (communityItems.length > 0) {
      setItems([...communityItems, ...initialGalleryItems]);
    }
    setCompanions(communityCompanions);
  }, []);

  const handleRate = (id: string | number, rating: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, rating } : item
    ));
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 min-h-screen">
      <div className="sticky top-16 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search prompts, tags, or creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-shadow"
              />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
              <button className="p-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors flex-shrink-0">
                <Filter className="w-4 h-4" />
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                    activeCategory === cat
                      ? "bg-white text-black"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeCategory === "Companions" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {companions.length > 0 ? (
              companions.map((comp) => (
                <motion.div
                  key={comp.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 group hover:border-pink-500/50 transition-all"
                >
                  <div className="aspect-square relative">
                    <img src={comp.avatarUrl} alt={comp.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4">
                      <h3 className="font-bold text-white">{comp.name}</h3>
                      <p className="text-[10px] text-pink-400 capitalize mb-2">{comp.personality} • {comp.gender}</p>
                      
                      {comp.shareableTraits && comp.shareableTraits.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {comp.shareableTraits.map((trait: string) => (
                            <span 
                              key={trait} 
                              className="px-2 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/40 text-[9px] text-pink-300 font-black uppercase tracking-widest shadow-[0_0_10px_rgba(236,72,153,0.3)]"
                            >
                              {trait.split(":")[1]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-zinc-800" />
                      <span className="text-xs text-zinc-400">@{comp.creator}</span>
                    </div>
                    <button className="text-xs font-bold text-pink-500 hover:text-pink-400">
                      Chat Now
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <Heart className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-zinc-500">No shared companions yet</h3>
                <p className="text-zinc-600 text-sm mt-2">Be the first to share your creation!</p>
              </div>
            )}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (i % 10) * 0.05 }}
                className="relative group rounded-xl overflow-hidden bg-zinc-900 break-inside-avoid cursor-pointer hover:neon-glow-pink transition-all"
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
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <img
                    src={item.src}
                    alt={`Gallery item ${item.id}`}
                    className="w-full h-auto object-cover"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white truncate pr-4">
                      @{item.author}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.type === 'video' && <Film className="w-4 h-4 text-pink-500 mr-2" />}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/create', { 
                            state: { 
                              referenceImage: item.src, 
                              prompt: item.prompt || `Masterpiece anime style artwork by ${item.author}` 
                            } 
                          });
                        }}
                        className="p-2 rounded-full bg-white/10 hover:bg-pink-500/20 hover:text-pink-500 backdrop-blur-sm text-white transition-colors"
                        title="Generate Variations"
                      >
                        <Wand2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-full bg-white/10 hover:bg-pink-500/20 hover:text-pink-500 backdrop-blur-sm text-white transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Rating System */}
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRate(item.id, star);
                        }}
                        className="transition-transform hover:scale-125"
                      >
                        <Star 
                          className={cn(
                            "w-3.5 h-3.5",
                            star <= item.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-500"
                          )} 
                        />
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-zinc-300">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" /> {item.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {item.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3" /> {item.downloads}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <AnimatePresence>
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
      </AnimatePresence>
    </div>
  );
}
