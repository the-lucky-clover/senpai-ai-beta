import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Heart, Eye, Wand2, Download, Star } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

const categories = ["All", "Anime", "Realistic", "Fantasy", "Cyberpunk", "Mecha", "NSFW"];

interface GalleryItem {
  id: string | number;
  src: string;
  likes: number;
  views: number;
  downloads: number;
  author: string;
  prompt?: string;
  rating: number;
}

const initialGalleryItems: GalleryItem[] = Array.from({ length: 20 }).map((_, i) => {
  const height = [400, 500, 600, 700, 800][Math.floor(Math.random() * 5)];
  return {
    id: i,
    src: `https://picsum.photos/seed/gallery${i}/400/${height}`,
    likes: Math.floor(Math.random() * 1000),
    views: Math.floor(Math.random() * 5000),
    downloads: Math.floor(Math.random() * 500),
    author: `Creator_${Math.floor(Math.random() * 100)}`,
    rating: Math.floor(Math.random() * 5) + 1,
  };
});

export default function Explore() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<GalleryItem[]>(initialGalleryItems);

  useEffect(() => {
    const communityItems = JSON.parse(localStorage.getItem("senpai_community") || "[]");
    if (communityItems.length > 0) {
      setItems([...communityItems, ...initialGalleryItems]);
    }
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
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: (i % 10) * 0.05 }}
              className="relative group rounded-xl overflow-hidden bg-zinc-900 break-inside-avoid cursor-pointer"
            >
              <img
                src={item.src}
                alt={`Gallery item ${item.id}`}
                className="w-full h-auto object-cover"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white truncate pr-4">
                    @{item.author}
                  </span>
                  <div className="flex items-center gap-1">
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
      </div>
    </div>
  );
}
