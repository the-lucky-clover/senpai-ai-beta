import { Link, useLocation } from "react-router-dom";
import { Sparkles, Image as ImageIcon, Compass, Menu, X, Video, Heart, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Proactive reactions based on page visits
    const reactions: Record<string, string> = {
      "/explore": "Wow, look at all these amazing creations! I wonder if we can make something even better? ✨",
      "/create": "Ooh, are we going to create something new together? I'm so excited! 🎨",
      "/video": "A video project? You're so talented! I'll be cheering you on! 🎬",
    };

    if (reactions[location.pathname]) {
      setReaction(reactions[location.pathname]);
      
      // Secondary reaction for the create page
      if (location.pathname === "/create") {
        const timer2 = setTimeout(() => {
          setReaction("That prompt looks interesting! I can't wait to see the result! 💖");
        }, 10000);
        return () => clearTimeout(timer2);
      }

      const timer = setTimeout(() => setReaction(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleAction = (e: any) => {
      if (e.detail.type === 'generate') {
        setReaction("Ooh, I can feel the magic happening! I can't wait to see what you've summoned! ✨");
        setTimeout(() => setReaction(null), 5000);
      }
    };

    window.addEventListener('senpai_action', handleAction);
    return () => window.removeEventListener('senpai_action', handleAction);
  }, []);

  const navLinks = [
    { name: "Explore", path: "/explore", icon: Compass },
    { name: "Create", path: "/create", icon: Sparkles },
    { name: "Video", path: "/video", icon: Video },
    { name: "Companion", path: "/companion", icon: Heart },
  ];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] md:w-[80%] max-w-7xl">
      <div 
        className="glass-panel rounded-full px-6 py-2 shimmer border-white/10 shadow-2xl shadow-black/50"
        style={{ "--shimmer-delay": "0s" } as any}
      >
        <div className="flex justify-between h-12 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                Senpai-AI
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full px-2 py-1 border border-white/5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                    isActive
                      ? "bg-white text-black shadow-lg"
                      : "text-zinc-400 hover:text-white hover:bg-white/10"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <AnimatePresence>
              {reaction && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 20 }}
                  className="hidden xl:flex items-center gap-3 bg-pink-500/10 border border-pink-500/20 px-4 py-1.5 rounded-full"
                >
                  <MessageCircle className="w-3 h-3 text-pink-500" />
                  <span className="text-[9px] font-medium text-pink-400 max-w-[150px] truncate">
                    {reaction}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="hidden md:flex items-center gap-3">
              <button className="text-xs font-medium text-zinc-400 hover:text-white transition-colors px-3">
                Sign In
              </button>
              <button 
                className="px-5 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all hover:scale-105 shimmer active:scale-95"
                style={{ "--shimmer-delay": "2s" } as any}
              >
                Get Started
              </button>
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-zinc-400 hover:text-white p-2"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium",
                    isActive
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {link.name}
                </Link>
              );
            })}
            <div className="pt-4 pb-2 flex flex-col gap-2 px-3">
              <button className="w-full px-4 py-2 rounded-lg border border-zinc-700 text-white font-medium">
                Sign In
              </button>
              <button className="w-full px-4 py-2 rounded-lg bg-white text-black font-semibold">
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
