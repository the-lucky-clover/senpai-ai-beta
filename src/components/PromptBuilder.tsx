import React, { useState } from "react";
import { Sparkles, Tag, Plus, Check, ChevronDown, ChevronUp, Wand2, Layers, RefreshCcw } from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface PromptBuilderProps {
  prompt: string;
  setPrompt: (value: string | ((prev: string) => string)) => void;
}

interface PromptCategory {
  id: string;
  name: string;
  icon: string;
  tags: string[];
}

const CATEGORIES: PromptCategory[] = [
  {
    id: "subject",
    name: "Character & Subject",
    icon: "👤",
    tags: [
      "cyberpunk samurai girl",
      "neko shrine maiden",
      "mecha pilot warrior",
      "magical girl with staff",
      "futuristic hacker",
      "fallen angel with dark wings",
      "kitsune spirit fox",
      "cybernetic bounty hunter",
      "steampunk explorer",
      "vampire princess"
    ]
  },
  {
    id: "style",
    name: "Art & Anime Styles",
    icon: "🎨",
    tags: [
      "Kyoto Animation cel-shaded",
      "Makoto Shinkai atmospheric sky",
      "Cyberpunk neon glow style",
      "Studio Ghibli pastel watercolor",
      "90s vintage anime aesthetic",
      "2.5D digital painting",
      "Dark fantasy ink illustration",
      "Unreal Engine 5 render",
      "Ukiyo-e woodblock fusion",
      "Vibrant synthwave colors"
    ]
  },
  {
    id: "lighting",
    name: "Lighting & Atmosphere",
    icon: "✨",
    tags: [
      "volumetric light rays",
      "neon rain reflections",
      "sunset golden hour",
      "cinematic rim lighting",
      "ethereal particle aura",
      "bioluminescent glow",
      "cyberpunk fog and haze",
      "dramatic chiaroscuro",
      "soft ambient studio light"
    ]
  },
  {
    id: "camera",
    name: "Camera & Framing",
    icon: "📷",
    tags: [
      "close-up character portrait",
      "dynamic low-angle shot",
      "wide panoramic vista",
      "dutch tilt camera angle",
      "bokeh depth of field",
      "cinematic 35mm lens",
      "full-body action pose"
    ]
  },
  {
    id: "details",
    name: "Quality & Details",
    icon: "⭐",
    tags: [
      "masterpiece",
      "highly detailed lineart",
      "8k resolution",
      "crisp fine details",
      "trending on ArtStation",
      "award-winning illustration",
      "perfect anatomy and framing"
    ]
  },
  {
    id: "gear",
    name: "Outfits & Props",
    icon: "⚔️",
    tags: [
      "glowing katana blade",
      "cybernetic augmented armor",
      "futuristic HUD visor",
      "traditional silk kimono",
      "floating holographic Orbs",
      "steampunk brass goggles"
    ]
  }
];

export default function PromptBuilder({ prompt, setPrompt }: PromptBuilderProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(CATEGORIES[0].id);

  // Check if a tag is present in the prompt string
  const isTagActive = (tag: string) => {
    return prompt.toLowerCase().includes(tag.toLowerCase());
  };

  // Toggle tag in prompt
  const toggleTag = (tag: string) => {
    if (isTagActive(tag)) {
      // Remove tag
      const regex = new RegExp(`(,\\s*)?${tag.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`, "gi");
      let updated = prompt.replace(regex, "").trim();
      if (updated.startsWith(",")) updated = updated.substring(1).trim();
      setPrompt(updated);
    } else {
      // Append tag
      if (!prompt.trim()) {
        setPrompt(tag);
      } else if (prompt.trim().endsWith(",")) {
        setPrompt(`${prompt.trim()} ${tag}`);
      } else {
        setPrompt(`${prompt.trim()}, ${tag}`);
      }
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-zinc-800/40 transition-colors select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              Interactive Prompt Builder
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-pink-500/20 text-pink-300 border border-pink-500/30">
                PRO
              </span>
            </h4>
            <p className="text-[10px] text-zinc-400">Tap modifiers to construct high-impact prompts</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {prompt.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPrompt("");
              }}
              className="text-[10px] text-zinc-500 hover:text-red-400 flex items-center gap-1 px-2 py-1 rounded bg-zinc-800/80 border border-zinc-700/50"
            >
              <RefreshCcw className="w-2.5 h-2.5" />
              Clear
            </button>
          )}
          <div className="text-zinc-400 p-1">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-zinc-800/60 p-3 space-y-3"
          >
            {/* Category Tab Bar */}
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all border",
                    activeTab === cat.id
                      ? "bg-pink-500/20 border-pink-500/60 text-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.25)]"
                      : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                  )}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Tags Grid for Active Category */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {CATEGORIES.find((c) => c.id === activeTab)?.tags.map((tag) => {
                const active = isTagActive(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "group flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all border select-none",
                      active
                        ? "bg-pink-500 text-black border-pink-400 font-bold shadow-[0_0_10px_rgba(236,72,153,0.4)] scale-[1.02]"
                        : "bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:border-pink-500/40 hover:bg-zinc-800/80"
                    )}
                  >
                    {active ? (
                      <Check className="w-3 h-3 text-black font-bold" />
                    ) : (
                      <Plus className="w-3 h-3 text-zinc-500 group-hover:text-pink-400" />
                    )}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
