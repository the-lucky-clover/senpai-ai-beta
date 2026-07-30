import { Link, useLocation } from "react-router-dom";
import { Sparkles, Image as ImageIcon, Compass, Menu, X, Video, Heart, MessageCircle, LogIn, UserPlus, User, LogOut, Mail, Loader2 } from "lucide-react";
import Logo from "./Logo";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { useAuth } from "../lib/AuthContext";

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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const location = useLocation();
  const { user, login, register, logout } = useAuth();

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

  const handleAuth = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        await login(email);
      } else {
        await register(email, name);
      }
      setShowAuthModal(false);
      setEmail('');
      setName('');
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

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

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-xs font-medium text-zinc-300">{user.name || user.email}</span>
                  </div>
                  <button 
                    onClick={logout}
                    className="px-3 py-1.5 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 inline-block mr-1" /> Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                    className="text-xs font-medium text-zinc-400 hover:text-white transition-colors px-3"
                  >
                    <LogIn className="w-3.5 h-3.5 inline-block mr-1" /> Sign In
                  </button>
                  <button 
                    onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
                    className="px-5 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all hover:scale-105 shimmer active:scale-95"
                    style={{ "--shimmer-delay": "2s" } as any}
                  >
                    <UserPlus className="w-3.5 h-3.5 inline-block mr-1" /> Get Started
                  </button>
                </>
              )}
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
              {user ? (
                <>
                  <div className="px-4 py-2 rounded-lg border border-zinc-700 text-white font-medium text-sm">
                    <User className="w-4 h-4 inline-block mr-2" /> {user.name || user.email}
                  </div>
                  <button 
                    onClick={logout}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-700 text-white font-medium"
                  >
                    <LogOut className="w-4 h-4 inline-block mr-2" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => { setAuthMode('login'); setShowAuthModal(true); setIsOpen(false); }}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-700 text-white font-medium"
                  >
                    <LogIn className="w-4 h-4 inline-block mr-2" /> Sign In
                  </button>
                  <button 
                    onClick={() => { setAuthMode('register'); setShowAuthModal(true); setIsOpen(false); }}
                    className="w-full px-4 py-2 rounded-lg bg-white text-black font-semibold"
                  >
                    <UserPlus className="w-4 h-4 inline-block mr-2" /> Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowAuthModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-md relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-3 right-3 text-zinc-500 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold dmt-infill">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
              <p className="text-zinc-500 text-sm mt-1">
                {authMode === 'login' ? 'Sign in to continue your journey' : 'Join the Senpai AI community'}
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                {authError}
              </div>
            )}

            <div className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                  autoFocus
                />
              </div>

              <button
                onClick={handleAuth}
                disabled={authLoading || !email || (authMode === 'register' && !name)}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-zinc-500">
              {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(null); }}
                className="text-pink-400 hover:text-pink-300 font-medium"
              >
                {authMode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </nav>
  );
}
