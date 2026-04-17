import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Copy, Check, X, Wand2, Download, Film, Image as ImageIcon } from "lucide-react";
import { cn } from "../lib/utils";

interface PopoverThumbnailProps {
  item: {
    type?: 'video' | 'image';
    src: string;
    prompt?: string;
    author?: string;
    id?: string | number;
  };
  onClose: () => void;
  anchorRect: DOMRect | null;
}

export default function PopoverThumbnail({ item, onClose, anchorRect }: PopoverThumbnailProps) {
  const [copied, setCopied] = useState(false);
  const prompt = item.prompt || "Masterpiece anime style artwork, highly detailed, sharp focus, 8k resolution, cinematic lighting.";

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!anchorRect) return null;

  // Calculate position (side of the clicked element)
  const isRightSide = anchorRect.left + anchorRect.width + 320 < window.innerWidth;
  const left = isRightSide ? anchorRect.left + anchorRect.width + 12 : anchorRect.left - 332;
  const top = anchorRect.top + (anchorRect.height / 2) - 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, x: isRightSide ? -20 : 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.9, x: isRightSide ? -20 : 20 }}
        className="fixed z-[101] w-80 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-5 overflow-hidden backdrop-blur-xl pointer-events-auto shadow-pink-500/10"
        style={{ left, top: Math.max(80, top) }}
      >
        {/* Shimmer & Particle Effects */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent pointer-events-none" />

        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <span className="text-[10px] font-bold text-zinc-500">{item.author ? item.author[0] : 'S'}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-tighter">@{item.author || 'senpai_fan'}</p>
              <p className="text-[8px] text-zinc-500 uppercase font-black tracking-widest">Generation Metadata</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        <div className="space-y-4 relative z-10">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-pink-500 uppercase tracking-widest flex items-center gap-1.5">
              {item.type === 'video' ? <Film className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
              Source Prompt
            </label>
            <div className="relative group">
              <div className="p-3 bg-black/40 border border-zinc-900 rounded-xl text-[11px] text-zinc-400 font-mono leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
                {prompt}
              </div>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-zinc-900/80 border border-white/5 text-zinc-400 hover:text-white transition-all active:scale-90"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
              <Download className="w-3.5 h-3.5" />
              Store
            </button>
            <button className="flex-1 py-2 px-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-[10px] font-black text-white uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 hover:opacity-90 active:scale-95 transition-all">
              <Wand2 className="w-3.5 h-3.5" />
              Remix
            </button>
          </div>
        </div>

        {/* Animation confirm text */}
        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
            >
              <div className="px-4 py-2 bg-green-500 text-black font-black text-[10px] rounded-full uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2">
                <Check className="w-3 h-3" />
                Copied to Clipboard
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
