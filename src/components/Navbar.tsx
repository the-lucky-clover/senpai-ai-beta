import { Link, useLocation } from "react-router-dom";
import { Sparkles, Image as ImageIcon, Compass, Menu, X, Video, Heart, MessageCircle } from "lucide-react";
import Logo from "./Logo";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

function DMTParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { x: number; y: number; s: number; v: number; c: string }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = 80;
    };

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < 60; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          s: Math.random() * 2 + 0.5,
          v: Math.random() * 0.4 + 0.1,
          c: `hsl(${Math.random() * 360}, 70%, 60%)`
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.c;
        ctx.globalAlpha = 0.3;
        ctx.fill();
        p.y -= p.v;
        p.x += Math.sin(p.y * 0.01) * 0.2; // Sine wave movement
        if (p.y < 0) p.y = canvas.height;
      });
      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    createParticles();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none dmt-particles" />;
}

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
    <nav className="fixed top-3 sm:top-5 left-1/2 -translate-x-1/2 z-50 w-[96%] sm:w-[92%] lg:w-[85%] xl:w-[80%] max-w-7xl">
      <div 
        className="glass-panel rounded-full px-4 sm:px-6 md:px-7 py-2 sm:py-2.5 shimmer border border-white/10 shadow-2xl shadow-black/60 relative backdrop-blur-xl"
        style={{ "--shimmer-delay": "0s" } as any}
      >
        {/* Background effects clipped within rounded pill frame */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
          <div className="absolute inset-0 nav-backfill opacity-40 mix-blend-overlay" />
          <DMTParticles />
        </div>
        
        <div className="flex justify-between h-9 sm:h-11 items-center relative z-10 gap-3 sm:gap-6">
          {/* Logo Section */}
          <div className="flex items-center gap-3 sm:gap-8 shrink-0">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
              <Logo className="w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:scale-105" />
              <div className="flex flex-col">
                <span className="font-black text-base sm:text-lg tracking-tight dmt-infill leading-tight">
                  Senpai AI
                </span>
                <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.22em] text-zinc-400 -mt-0.5 opacity-70">
                  Visionary Arts
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-white/[0.06] rounded-full px-2 py-1 border border-white/10 shrink-0 shadow-inner">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap",
                    isActive
                      ? "bg-white text-black shadow-md shadow-white/10"
                      : "text-zinc-300 hover:text-white hover:bg-white/10"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Action Buttons & Mobile Menu Trigger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <AnimatePresence>
              {reaction && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 20 }}
                  className="hidden xl:flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 px-3 py-1 rounded-full"
                >
                  <MessageCircle className="w-3 h-3 text-pink-400" />
                  <span className="text-[9px] font-semibold text-pink-300 max-w-[140px] truncate">
                    {reaction}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="hidden md:flex items-center gap-2 sm:gap-3">
              <button className="text-xs font-bold text-zinc-300 hover:text-white transition-colors px-3 py-1.5 whitespace-nowrap">
                Sign In
              </button>
              <button 
                className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-white via-zinc-100 to-zinc-200 text-black text-xs font-black transition-all hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] active:scale-95 whitespace-nowrap shrink-0"
              >
                Get Started
              </button>
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-zinc-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Toggle navigation menu"
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
