import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, MessageSquare, User, Sparkles, Send, Loader2, Wand2, Palette, Brain, ChevronRight, ChevronLeft, ShieldAlert, Clock, X, Settings2, RefreshCw, Compass, Zap } from "lucide-react";
import { cn } from "../lib/utils";
import { GoogleGenAI } from "@google/genai";

const personalityTypes = [
  { 
    id: "tsundere", 
    name: "Tsundere", 
    desc: "Hot-headed and harsh at first, but sweet and loving deep down.",
    detailed: "The classic 'it's not like I like you or anything!' archetype. They often react with feigned anger or physical comedy when embarrassed. Expect a journey from a prickly, defensive exterior to a fiercely loyal and surprisingly sweet heart. They will often scold you for being reckless while secretly worrying about you."
  },
  { 
    id: "kuudere", 
    name: "Kuudere", 
    desc: "Cool, calm, and collected. Rarely shows emotion but is deeply loyal.",
    detailed: "Stoic and analytical. They speak in a measured, often blunt tone and rarely change their facial expression. However, their loyalty is absolute. They show affection through small, logical gestures and will always be the voice of reason when things get chaotic. Their rare smiles are worth their weight in gold."
  },
  { 
    id: "yandere", 
    name: "Yandere", 
    desc: "Intensely devoted and obsessive. Will do anything for their loved one.",
    detailed: "A personality of extremes. They are the most affectionate and caring partners imaginable, but their love is tinged with a dark, possessive streak. They are fiercely protective and may react with intense jealousy toward anyone else who gets close to you. Their devotion is eternal, for better or worse."
  },
  { 
    id: "dandere", 
    name: "Dandere", 
    desc: "Quiet and shy. Opens up only to those they trust completely.",
    detailed: "Extremely introverted and soft-spoken. They often hide behind books or their own hair and may struggle to maintain eye contact. Once they trust you, they become incredibly talkative and sweet, sharing their deep inner thoughts and creative passions. They are the ultimate listeners and observers."
  },
  { 
    id: "genki", 
    name: "Genki", 
    desc: "Energetic, optimistic, and always full of life.",
    detailed: "A human battery of pure positivity! They are always on the move, speaking loudly and with infectious enthusiasm. They love sports, festivals, and making sure everyone around them is having a great time. They will constantly push you to try new things and will be your biggest cheerleader in everything you do."
  },
];

const voiceOptions = [
  { id: "cheerful", name: "Cheerful", pitch: 1.2, rate: 1.1 },
  { id: "calm", name: "Calm", pitch: 0.9, rate: 0.9 },
  { id: "mature", name: "Mature", pitch: 0.8, rate: 0.85 },
  { id: "playful", name: "Playful", pitch: 1.4, rate: 1.2 },
  { id: "stoic", name: "Stoic", pitch: 0.7, rate: 0.8 },
  { id: "energetic", name: "Energetic", pitch: 1.1, rate: 1.4 },
];

const moodIcons: Record<string, string> = {
  happy: "😊",
  neutral: "😐",
  contemplative: "🤔",
  excited: "🤩",
  shy: "😳",
  angry: "💢",
  surprised: "😲",
  loving: "🥰",
};

const lookOptions = {
  hair: ["Black", "Blue", "Pink", "Silver", "Blonde", "Red", "Green", "Purple"],
  eyes: ["Red", "Blue", "Green", "Purple", "Gold", "Pink", "Silver", "Heterochromia"],
  eyeShape: ["Round", "Sharp", "Droopy", "Cat-like", "Narrow"],
  noseType: ["Small", "Straight", "Button", "Pointy"],
  mouthExpression: ["Smile", "Pout", "Neutral", "Open", "Grin"],
  skinTone: ["Fair", "Pale", "Tan", "Dark", "Ebony", "Olive"],
  bodyType: ["Slim", "Athletic", "Average", "Plus Size", "Petite", "Tall"],
  pose: ["Idle", "Standing", "Sitting", "Dynamic Action", "Waving", "Thinking"],
  outfit: ["School Uniform", "Battle Armor", "Casual Hoodie", "Kimono", "Cyberpunk Gear", "Gothic Lolita", "Summer Dress"],
  accessories: ["None", "Glasses", "Choker", "Cat Ears", "Headphones", "Eyepatch", "Ribbon", "Beret", "Scarf", "Silver Necklace", "Earrings", "Tiara", "Crown", "Witch Hat", "Cowboy Hat", "Monocle", "Fox Mask", "Oni Mask", "Pearl Necklace", "Gold Chain"],
};

const backgroundOptions = [
  { id: "starry-night", name: "Starry Night", type: "video", url: "https://assets.mixkit.co/videos/preview/mixkit-stars-in-the-night-sky-11641-large.mp4", poster: "https://images.pexels.com/photos/2088205/pexels-photo-2088205.jpeg" },
  { id: "cyberpunk", name: "Cyberpunk City", type: "video", url: "https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-city-street-at-night-with-neon-lights-40134-large.mp4", poster: "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg" },
  { id: "abstract", name: "Deep Space", type: "video", url: "https://assets.mixkit.co/videos/preview/mixkit-abstract-animation-of-blue-and-purple-particles-23157-large.mp4", poster: "https://images.pexels.com/photos/310452/pexels-photo-310452.jpeg" },
  { id: "forest", name: "Enchanted Forest", type: "image", url: "https://images.pexels.com/photos/775201/pexels-photo-775201.jpeg", poster: "" },
  { id: "beach", name: "Tropical Beach", type: "image", url: "https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg", poster: "" },
  { id: "city", name: "Future Tokyo", type: "image", url: "https://images.pexels.com/photos/2501965/pexels-photo-2501965.jpeg", poster: "" },
];

const relationshipLevels = [
  { min: 0, name: "Stranger", color: "text-zinc-500" },
  { min: 50, name: "Acquaintance", color: "text-blue-400" },
  { min: 150, name: "Friend", color: "text-green-400" },
  { min: 300, name: "Close Friend", color: "text-yellow-400" },
  { min: 500, name: "Best Friend", color: "text-orange-400" },
  { min: 800, name: "Partner", color: "text-pink-500" },
  { min: 1200, name: "Soulmate", color: "text-red-500" },
];

const traitColors: Record<string, string> = {
  Black: "#1a1a1a",
  Blue: "#3b82f6",
  Pink: "#ec4899",
  Silver: "#cbd5e1",
  Blonde: "#fbbf24",
  Red: "#ef4444",
  Green: "#22c55e",
  Purple: "#a855f7",
  Gold: "#eab308",
  Heterochromia: "linear-gradient(45deg, #3b82f6, #ef4444)",
  Fair: "#fef3c7",
  Pale: "#fff7ed",
  Tan: "#d97706",
  Dark: "#78350f",
  Ebony: "#451a03",
  Olive: "#a16207",
};

const getTraitThumbnail = (category: string, option: string) => {
  if (traitColors[option]) {
    return <div className="w-full h-full shadow-inner" style={{ background: traitColors[option] }} />;
  }
  const prompt = `anime style ${option} ${category} icon, white background, detailed, high quality, 2d art`.replace(/\s+/g, '%20');
  return (
    <img 
      src={`https://image.pollinations.ai/prompt/${prompt}?width=128&height=128&nologo=true&seed=${option.length}`} 
      referrerPolicy="no-referrer"
      alt={option}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125"
    />
  );
};

export default function CompanionPage() {
  const [step, setStep] = useState(1);
  const [companion, setCompanion] = useState({
    name: "",
    gender: "Female",
    personalities: [personalityTypes[0].id],
    personalityIntensity: 1.0,
    hair: "Black",
    eyes: "Blue",
    eyeShape: "Round",
    noseType: "Small",
    mouthExpression: "Smile",
    skinTone: "Fair",
    bodyType: "Average",
    pose: "Idle",
    outfit: "Casual Hoodie",
    accessories: "None",
    uniqueTraits: [] as string[],
    shareableTraits: [] as string[],
    voice: "cheerful",
    pitch: 1.0,
    rate: 1.0,
    mood: "happy",
    isMature: false,
    affection: 0,
    avatarUrl: "",
    background: backgroundOptions[0].id,
    memory: [] as { id: string; fact: string; timestamp: string; pinned?: boolean }[],
    lastMilestone: 0,
  });
  
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [editingMemory, setEditingMemory] = useState<{ id: string; fact: string } | null>(null);
  const [traitInput, setTraitInput] = useState("");
  const [showMilestone, setShowMilestone] = useState<{ level: string; points: number } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const getRelationship = (points: number) => {
    return [...relationshipLevels].reverse().find(l => points >= l.min) || relationshipLevels[0];
  };

  const getBackground = (id: string) => {
    return backgroundOptions.find(b => b.id === id) || backgroundOptions[0];
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = companion.pitch;
    utterance.rate = companion.rate;
    window.speechSynthesis.speak(utterance);
  };

  const generateAvatar = async () => {
    setIsGeneratingAvatar(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const currentBg = getBackground(companion.background);
      const prompt = `Anime style portrait of a ${companion.gender} character named ${companion.name}. 
      Features: ${companion.hair} hair, ${companion.eyes} eyes (${companion.eyeShape} shape), ${companion.noseType} nose, ${companion.mouthExpression} mouth, ${companion.skinTone} skin tone, ${companion.bodyType} body type.
      Pose: ${companion.pose}.
      Location: ${currentBg.name}.
      Unique Traits: ${companion.uniqueTraits.join(", ")}.
      Wearing: ${companion.outfit} with ${companion.accessories !== "None" ? companion.accessories : "no accessories"}. 
      Personality: ${companion.personalities.join(", ")} with intensity ${companion.personalityIntensity}. High quality, vibrant colors, detailed anime art style, professional digital illustration.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: [{ parts: [{ text: prompt }] }],
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setCompanion(prev => ({ ...prev, avatarUrl: `data:image/png;base64,${part.inlineData?.data}` }));
          break;
        }
      }
    } catch (error) {
      console.error("Avatar generation error:", error);
      // Fallback to picsum if generation fails
      setCompanion(prev => ({ ...prev, avatarUrl: `https://picsum.photos/seed/${companion.name}${companion.hair}/800/800` }));
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const updateMemoryAndMood = async (lastUserMsg: string, lastAiMsg: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const prompt = `Analyze this exchange and extract:
      1. Key facts to remember (user preferences, names, dates, important events).
      2. The companion's current mood (happy, neutral, contemplative, excited, shy, angry, surprised, loving).
      
      Exchange:
      User: ${lastUserMsg}
      Companion: ${lastAiMsg}
      
      Current Memory: ${companion.memory.map(m => m.fact).join(" | ")}
      Current Affection: ${companion.affection}
      
      Return JSON: { "newFacts": ["string"], "mood": "string", "affectionGain": number }`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || "{}");
      if (result.newFacts && Array.isArray(result.newFacts)) {
        const newMemories = result.newFacts.map((f: string) => ({
          id: Math.random().toString(36).substr(2, 9),
          fact: f,
          timestamp: new Date().toISOString()
        }));
        setCompanion(prev => ({
          ...prev,
          memory: [...prev.memory, ...newMemories].slice(-20),
          mood: result.mood || prev.mood,
          affection: prev.affection + (result.affectionGain || 0)
        }));
      } else if (result.mood || result.affectionGain) {
        setCompanion(prev => ({ 
          ...prev, 
          mood: result.mood || prev.mood,
          affection: prev.affection + (result.affectionGain || 0)
        }));
      }
    } catch (e) {
      console.error("Memory update error:", e);
    }
  };

  const handleShare = () => {
    const communityCompanions = JSON.parse(localStorage.getItem("senpai_companions") || "[]");
    const newCompanion = {
      ...companion,
      id: Date.now().toString(),
      creator: "You",
      likes: 0
    };
    localStorage.setItem("senpai_companions", JSON.stringify([newCompanion, ...communityCompanions]));
    alert(`${companion.name} has been shared with the community!`);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

      const personalities = personalityTypes.filter(p => companion.personalities.includes(p.id));
      const memoryContext = companion.memory.length > 0 
        ? `Key things you remember about the user and your past: ${companion.memory.map(m => m.fact).join(". ")}` 
        : "";
      const relationship = getRelationship(companion.affection);
      const currentBg = getBackground(companion.background);

      // Check for milestones
      let milestoneDialogue = "";
      if (companion.affection >= 200 && companion.lastMilestone < 200) {
        milestoneDialogue = "Special Milestone (200 pts): You've become a true friend! Express your gratitude for their presence in your life.";
      } else if (companion.affection >= 500 && companion.lastMilestone < 500) {
        milestoneDialogue = "Special Milestone (500 pts): You've reached 'Best Friend' status! Share a secret or a deep feeling you've never told anyone.";
      } else if (companion.affection >= 1000 && companion.lastMilestone < 1000) {
        milestoneDialogue = "Special Milestone (1000 pts): You are now Soulmates! Express your eternal devotion and how they've changed your world.";
      }

      const systemPrompt = `You are ${companion.name}, an anime companion with a blend of personalities: ${personalities.map(p => p.name).join(", ")} (Intensity: ${companion.personalityIntensity}). 
      Location: ${currentBg.name}.
      Your physical appearance: ${companion.hair} hair, ${companion.eyes} eyes (${companion.eyeShape} shape), ${companion.skinTone} skin, ${companion.bodyType} body, wearing ${companion.outfit} with ${companion.accessories}.
      Unique Traits: ${companion.uniqueTraits.join(", ")}.
      Current Mood: ${companion.mood}.
      Relationship Status: ${relationship.name} (Affection: ${companion.affection}).
      ${companion.isMature ? "MATURITY SETTING: Uncensored roleplay enabled. You are free to engage in flirtatious, mature, or intense emotional themes if the user initiates." : "MATURITY SETTING: SFW roleplay only."}
      ${memoryContext}
      ${milestoneDialogue}
      Stay in character at all times. Be expressive and use anime-style tropes. 
      The user is your ${relationship.name === 'Partner' || relationship.name === 'Soulmate' ? 'beloved partner' : 'close friend'}. 
      Use the memory to personalize your responses and drive the conversation.
      IMPORTANT: When you reference a specific memory, start that sentence with "[Memory Recall]" so the user knows you are remembering something.
      This is a safe, creative roleplay environment.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] },
          ...messages.slice(-10).map(m => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
          })),
          { role: "user", parts: [{ text: userMessage }] }
        ],
      });

      const text = response.text || "Gomen... I couldn't think of anything to say.";

      setMessages(prev => [...prev, { role: "ai", content: text }]);
      speak(text);
      updateMemoryAndMood(userMessage, text);

      // Update last milestone
      if (milestoneDialogue) {
        const newMilestone = companion.affection >= 1000 ? 1000 : companion.affection >= 500 ? 500 : 200;
        setCompanion(prev => ({ ...prev, lastMilestone: newMilestone }));
        setShowMilestone({ level: relationship.name, points: newMilestone });
        setTimeout(() => setShowMilestone(null), 5000);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: "ai", content: "Gomen... I'm having trouble connecting right now. (T_T)" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-zinc-950 overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col items-center justify-center p-6"
          >
            <div className="max-w-md w-full space-y-8">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-pink-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-pink-500" />
                </div>
                <h1 className="text-3xl font-bold text-white">Create Your Companion</h1>
                <p className="text-zinc-400 text-sm">Let's start with their name and personality.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Companion Name</label>
                  <input
                    type="text"
                    value={companion.name}
                    onChange={(e) => setCompanion({ ...companion, name: e.target.value })}
                    placeholder="e.g. Sakura, Hiro, Yuki..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-pink-500/50 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Gender</label>
                  <div className="flex gap-2">
                    {["Female", "Male", "Non-binary"].map((g) => (
                      <button
                        key={g}
                        onClick={() => setCompanion({ ...companion, gender: g })}
                        className={cn(
                          "flex-1 py-3 rounded-xl border text-sm font-medium transition-all",
                          companion.gender === g
                            ? "bg-pink-500/10 border-pink-500/50 text-pink-400"
                            : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-300 flex items-center justify-between">
                    <div className="flex items-center gap-2"><Brain className="w-4 h-4" /> Personality Mix</div>
                    <span className="text-[10px] text-zinc-500">Select up to 3</span>
                  </label>
                  <div className="grid gap-2">
                    {personalityTypes.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setCompanion(prev => {
                            const exists = prev.personalities.includes(p.id);
                            if (exists && prev.personalities.length > 1) {
                              return { ...prev, personalities: prev.personalities.filter(id => id !== p.id) };
                            } else if (!exists && prev.personalities.length < 3) {
                              return { ...prev, personalities: [...prev.personalities, p.id] };
                            }
                            return prev;
                          });
                        }}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all group",
                          companion.personalities.includes(p.id)
                            ? "bg-pink-500/10 border-pink-500/50"
                            : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-xs text-white group-hover:text-pink-400 transition-colors">{p.name}</div>
                          {companion.personalities.includes(p.id) && <Sparkles className="w-3 h-3 text-pink-500" />}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{p.desc}</div>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-[10px] text-zinc-500">
                      <span>Personality Intensity</span>
                      <span>{(companion.personalityIntensity * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                      type="range" min="0.1" max="2" step="0.1" 
                      value={companion.personalityIntensity}
                      onChange={(e) => setCompanion({ ...companion, personalityIntensity: parseFloat(e.target.value) })}
                      className="w-full accent-pink-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-orange-400" />
                        Mature Roleplay
                      </div>
                      <div className="text-[10px] text-zinc-500">Enable uncensored, immersive themes</div>
                    </div>
                    <button
                      onClick={() => setCompanion({ ...companion, isMature: !companion.isMature })}
                      className={cn(
                        "w-12 h-6 rounded-full p-1 transition-colors duration-300",
                        companion.isMature ? "bg-pink-600" : "bg-zinc-800"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 bg-white rounded-full transition-transform duration-300",
                        companion.isMature ? "translate-x-6" : "translate-x-0"
                      )} />
                    </button>
                  </div>
                </div>

                <button
                  disabled={!companion.name}
                  onClick={() => setStep(2)}
                  className="w-full py-4 rounded-xl bg-pink-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Step <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col items-center p-6 overflow-y-auto"
          >
            <div className="max-w-2xl w-full space-y-8 py-8">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-8 h-8 text-violet-500" />
                </div>
                <h1 className="text-3xl font-bold text-white">Design Their Look</h1>
                <p className="text-zinc-400 text-sm">Customize how {companion.name} looks.</p>
              </div>

              <div className="grid gap-8">
                {Object.entries(lookOptions).map(([key, options]) => (
                  <div key={key} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                      <label className="text-sm font-bold text-white capitalize flex items-center gap-2">
                        <div className="w-1 h-4 bg-violet-500 rounded-full" />
                        {key}
                      </label>
                      {["hair", "accessories", "outfit"].includes(key) && (
                        <button
                          onClick={() => {
                            const trait = `${key}:${(companion as any)[key]}`;
                            setCompanion(prev => ({
                              ...prev,
                              shareableTraits: prev.shareableTraits.includes(trait)
                                ? prev.shareableTraits.filter(t => t !== trait)
                                : [...prev.shareableTraits, trait]
                            }));
                          }}
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded border transition-all",
                            companion.shareableTraits.includes(`${key}:${(companion as any)[key]}`)
                              ? "bg-pink-500/20 border-pink-500/50 text-pink-400"
                              : "bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-zinc-400"
                          )}
                        >
                          Shareable
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                      {options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setCompanion({ ...companion, [key]: opt })}
                          className={cn(
                            "group relative flex flex-col items-center gap-2 p-1 rounded-xl border transition-all duration-300",
                            (companion as any)[key] === opt
                              ? "bg-violet-500/20 border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)] ring-1 ring-violet-500"
                              : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
                          )}
                        >
                          <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-zinc-800">
                            {getTraitThumbnail(key, opt)}
                            {(companion as any)[key] === opt && (
                              <div className="absolute inset-0 bg-violet-500/20 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white drop-shadow-lg" />
                              </div>
                            )}
                          </div>
                          <span className={cn(
                            "text-[10px] text-center font-medium truncate w-full px-1 mb-1 transition-colors",
                            (companion as any)[key] === opt ? "text-violet-300" : "text-zinc-500 group-hover:text-zinc-300"
                          )}>
                            {opt}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-zinc-900">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Unique Traits</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={traitInput}
                        onChange={(e) => setTraitInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && traitInput.trim()) {
                            setCompanion(prev => ({
                              ...prev,
                              uniqueTraits: [...prev.uniqueTraits, traitInput.trim()]
                            }));
                            setTraitInput("");
                          }
                        }}
                        placeholder="e.g. Loves stargazing..."
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-pink-500 outline-none"
                      />
                      <button
                        onClick={() => {
                          if (traitInput.trim()) {
                            setCompanion(prev => ({
                              ...prev,
                              uniqueTraits: [...prev.uniqueTraits, traitInput.trim()]
                            }));
                            setTraitInput("");
                          }
                        }}
                        className="px-3 py-2 bg-zinc-800 rounded-lg text-xs font-bold text-white hover:bg-zinc-700"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {companion.uniqueTraits.map((trait, i) => (
                        <span key={i} className="px-2 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-[10px] text-pink-400 flex items-center gap-1">
                          {trait}
                          <button 
                            onClick={() => setCompanion(prev => ({
                              ...prev,
                              uniqueTraits: prev.uniqueTraits.filter((_, idx) => idx !== i)
                            }))}
                            className="hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Voice Persona</label>
                    <div className="grid grid-cols-3 gap-2">
                      {voiceOptions.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => {
                            setCompanion({ ...companion, voice: v.id, pitch: v.pitch, rate: v.rate });
                            const utterance = new SpeechSynthesisUtterance("Hello! This is my voice.");
                            utterance.pitch = v.pitch;
                            utterance.rate = v.rate;
                            window.speechSynthesis.speak(utterance);
                          }}
                          className={cn(
                            "px-3 py-2 rounded-lg text-[10px] font-bold border transition-all",
                            companion.voice === v.id
                              ? "bg-violet-500/10 border-violet-500/50 text-violet-400"
                              : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                          )}
                        >
                          {v.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] text-zinc-500">
                        <span>Pitch</span>
                        <span>{companion.pitch.toFixed(1)}</span>
                      </div>
                      <input 
                        type="range" min="0.5" max="2" step="0.1" 
                        value={companion.pitch}
                        onChange={(e) => setCompanion({ ...companion, pitch: parseFloat(e.target.value) })}
                        className="w-full accent-violet-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] text-zinc-500">
                        <span>Rate</span>
                        <span>{companion.rate.toFixed(1)}</span>
                      </div>
                      <input 
                        type="range" min="0.5" max="2" step="0.1" 
                        value={companion.rate}
                        onChange={(e) => setCompanion({ ...companion, rate: parseFloat(e.target.value) })}
                        className="w-full accent-violet-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-zinc-300">Avatar Preview</label>
                    <button
                      onClick={generateAvatar}
                      disabled={isGeneratingAvatar}
                      className="w-full py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors disabled:opacity-50"
                    >
                      {isGeneratingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                      {companion.avatarUrl ? "Regenerate Avatar" : "AI Generate Avatar"}
                    </button>

                    {companion.avatarUrl ? (
                      <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-violet-500/50 shadow-2xl shadow-violet-500/10">
                        <img src={companion.avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-square rounded-2xl border-2 border-dashed border-zinc-800 flex items-center justify-center text-zinc-600 text-xs text-center p-8">
                        Select your preferences and generate an AI avatar
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-8 border-t border-zinc-900">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 rounded-xl bg-zinc-900 text-white font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-[2] py-4 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  Next: Choose Setting <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col items-center justify-center p-6"
          >
            <div className="max-w-md w-full space-y-8">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Compass className="w-8 h-8 text-blue-500" />
                </div>
                <h1 className="text-3xl font-bold text-white">Choose Their Setting</h1>
                <p className="text-zinc-400 text-sm">Where does {companion.name} live?</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {backgroundOptions.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setCompanion({ ...companion, background: bg.id })}
                    className={cn(
                      "group relative aspect-video rounded-xl overflow-hidden border-2 transition-all",
                      companion.background === bg.id
                        ? "border-pink-500 ring-4 ring-pink-500/20"
                        : "border-zinc-800 hover:border-zinc-700"
                    )}
                  >
                    <img 
                      src={bg.poster || bg.url} 
                      alt={bg.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-2">
                      <div className="text-[10px] font-bold text-white flex items-center justify-between">
                        {bg.name}
                        {bg.type === "video" && <Zap className="w-3 h-3 text-pink-500" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 rounded-xl bg-zinc-900 text-white font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
                <button
                  onClick={() => {
                    setStep(4);
                    setMessages([{ role: "ai", content: `Konnichiwa! I'm ${companion.name}. I'm so happy to finally meet you! (*^▽^*)` }]);
                    generateAvatar(); // Auto-generate when moving to chat
                  }}
                  className="flex-[2] py-4 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  Generate Companion <Sparkles className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col md:flex-row h-full relative overflow-hidden"
          >
            {/* Environmental Background Video/Image */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={companion.background}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0"
                >
                  {getBackground(companion.background).type === "video" ? (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      src={getBackground(companion.background).url}
                      poster={getBackground(companion.background).poster}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src={getBackground(companion.background).url} 
                      className="w-full h-full object-cover"
                      alt="Background"
                    />
                  )}
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/20 via-zinc-950/40 to-black" />
            </div>

            {/* Companion Profile Sidebar */}
            <div className="w-full md:w-80 lg:w-96 border-r border-zinc-800 bg-zinc-900/40 backdrop-blur-xl flex flex-col p-6 space-y-8 relative z-10">
              <div className="relative aspect-square rounded-3xl overflow-hidden border-2 border-pink-500/20 shadow-2xl shadow-pink-500/10">
                <motion.img 
                  key={companion.mood}
                  animate={
                    companion.mood === "happy" ? { y: [0, -5, 0], transition: { repeat: Infinity, duration: 2 } } :
                    companion.mood === "excited" ? { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 0.5 } } :
                    companion.mood === "shy" ? { x: [-2, 2, -2], transition: { repeat: Infinity, duration: 1 } } :
                    companion.mood === "surprised" ? { scale: 1.1, y: -10, transition: { type: "spring" } } :
                    {}
                  }
                  src={companion.avatarUrl || `https://picsum.photos/seed/${companion.name}${companion.hair}/800/800`} 
                  alt={companion.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                  <span className="text-lg">{moodIcons[companion.mood]}</span>
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">{companion.mood}</span>
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-end justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">{companion.name}</h2>
                    <p className="text-xs text-pink-400 font-medium capitalize">{companion.personalities.join(", ")}</p>
                  </div>
                  <button 
                    onClick={generateAvatar}
                    disabled={isGeneratingAvatar}
                    className="p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
                    title="Regenerate Avatar"
                  >
                    {isGeneratingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 text-white" />}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Relationship</h3>
                  <span className={cn("text-xs font-bold", getRelationship(companion.affection).color)}>
                    {getRelationship(companion.affection).name}
                  </span>
                </div>
                <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((companion.affection / 1200) * 100, 100)}%` }}
                    className="h-full bg-gradient-to-r from-pink-500 to-violet-600"
                  />
                </div>
                <div className="text-[10px] text-zinc-500 text-right">{companion.affection} / 1200 pts</div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                  Memories
                  <span className="text-[10px] text-zinc-600">{companion.memory.length}/20</span>
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {[...companion.memory].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map((mem) => {
                    const isRecalled = messages.length > 0 && messages[messages.length - 1].role === "ai" && messages[messages.length - 1].content.toLowerCase().includes(mem.fact.toLowerCase().slice(0, 10));
                    
                    return (
                      <div 
                        key={mem.id} 
                        className={cn(
                          "p-2 rounded-lg border text-[10px] flex items-start gap-2 group relative transition-all duration-500",
                          mem.pinned ? "bg-pink-500/10 border-pink-500/30 text-pink-400" : "bg-zinc-950 border-zinc-800 text-zinc-500",
                          isRecalled && "ring-2 ring-pink-500 ring-offset-2 ring-offset-zinc-950 scale-[1.02] bg-pink-500/20"
                        )}
                      >
                        <Clock className="w-3 h-3 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{mem.fact}</span>
                        {mem.pinned && <Sparkles className="w-2 h-2 text-pink-500 absolute top-1 right-1" />}
                        {isRecalled && <motion.div layoutId="recall-glow" className="absolute inset-0 bg-pink-500/10 animate-pulse rounded-lg" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Unique Traits</h3>
                <div className="flex flex-wrap gap-2">
                  {companion.uniqueTraits.map((trait, i) => (
                    <span key={i} className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Profile Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <div className="text-[10px] text-zinc-500 mb-1">Gender</div>
                    <div className="text-sm font-medium text-zinc-300">{companion.gender}</div>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <div className="text-[10px] text-zinc-500 mb-1">Hair</div>
                    <div className="text-sm font-medium text-zinc-300">{companion.hair}</div>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <div className="text-[10px] text-zinc-500 mb-1">Eyes</div>
                    <div className="text-sm font-medium text-zinc-300">{companion.eyes}</div>
                  </div>
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                        <div className="text-[10px] text-zinc-500 mb-1">Skin</div>
                        <div className="text-sm font-medium text-zinc-300">{companion.skinTone}</div>
                      </div>
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                        <div className="text-[10px] text-zinc-500 mb-1">Body</div>
                        <div className="text-sm font-medium text-zinc-300">{companion.bodyType}</div>
                      </div>
                </div>
              </div>

              <button
                onClick={handleShare}
                className="w-full py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors shimmer"
                style={{ "--shimmer-delay": "4s" } as any}
              >
                <Sparkles className="w-4 h-4 text-pink-500" />
                Share with Community
              </button>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                  Setting
                  <Compass className="w-3 h-3" />
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {backgroundOptions.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setCompanion({ ...companion, background: bg.id })}
                      className={cn(
                        "aspect-video rounded-lg overflow-hidden border transition-all",
                        companion.background === bg.id
                          ? "border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.3)]"
                          : "border-zinc-800 hover:border-zinc-700"
                      )}
                      title={bg.name}
                    >
                      <img src={bg.poster || bg.url} className="w-full h-full object-cover" alt={bg.name} />
                    </button>
                  ))}
                </div>
              </div>

              <div className={cn(
                "mt-auto p-4 border rounded-xl flex gap-3 items-start transition-colors duration-500",
                companion.isMature ? "bg-red-500/5 border-red-500/20" : "bg-blue-500/5 border-blue-500/20"
              )}>
                {companion.isMature ? (
                  <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                ) : (
                  <Sparkles className="w-5 h-5 text-blue-500 shrink-0" />
                )}
                <div className={cn(
                  "text-[10px] leading-relaxed",
                  companion.isMature ? "text-red-400/80" : "text-blue-400/80"
                )}>
                  {companion.isMature ? "Uncensored Roleplay Active. Mature themes are enabled." : "Safe Mode Active. Conversations are family-friendly."}
                  <div className="mt-1 opacity-50 underline cursor-pointer" onClick={() => setStep(1)}>Change Maturity Settings</div>
                </div>
              </div>
            </div>

            {/* Milestone Celebration Overlay */}
            <AnimatePresence>
              {showMilestone && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
                >
                  <div className="bg-zinc-900/90 backdrop-blur-xl border border-pink-500/50 p-8 rounded-3xl text-center shadow-[0_0_50px_rgba(236,72,153,0.3)]">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4 fill-pink-500" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-white mb-2">Milestone Unlocked!</h2>
                    <p className="text-pink-400 font-medium">Relationship Level: {showMilestone.level}</p>
                    <p className="text-zinc-500 text-sm mt-4 italic">"{companion.name} feels much closer to you now..."</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 flex flex-col bg-zinc-950 relative">
              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={m.role === "user" ? { opacity: 0, y: 20, scale: 0.95 } : { opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={m.role === "user" ? { opacity: 0, y: 20, scale: 0.95 } : { opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className={cn(
                      "flex gap-4 max-w-3xl",
                      m.role === "user" ? "ml-auto flex-row-reverse" : ""
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border",
                      m.role === "user" ? "bg-zinc-900 border-zinc-800" : "bg-pink-500/10 border-pink-500/20"
                    )}>
                      {m.role === "user" ? <User className="w-5 h-5 text-zinc-500" /> : <Heart className="w-5 h-5 text-pink-500" />}
                    </div>
                    <div className={cn(
                      "p-4 rounded-2xl text-sm leading-relaxed shadow-lg",
                      m.role === "user" 
                        ? "bg-pink-600 text-white rounded-tr-none shadow-pink-500/10" 
                        : "bg-zinc-900 text-zinc-300 rounded-tl-none border border-zinc-800 shadow-black/20"
                    )}>
                      {m.content.includes("[Memory Recall]") ? (
                        <div className="flex flex-col gap-2">
                          {m.content.split("[Memory Recall]").map((part, idx) => {
                            if (idx === 0) return <span key={idx}>{part}</span>;
                            
                            // Find the memory being recalled (this is a heuristic)
                            const recalledMemory = companion.memory.find(mem => part.toLowerCase().includes(mem.fact.toLowerCase().slice(0, 10)));
                            
                            return (
                              <span key={idx} className={cn(
                                "group flex items-start gap-2 text-[11px] p-2 rounded-lg border italic relative transition-all",
                                recalledMemory 
                                  ? "text-pink-400 bg-pink-500/10 border-pink-500/30 shadow-[0_0_10px_rgba(236,72,153,0.1)]" 
                                  : "text-pink-400/70 bg-pink-500/5 border-pink-500/10"
                              )}>
                                <Clock className="w-3 h-3 mt-0.5 shrink-0" />
                                <span>{part}</span>
                                {recalledMemory && (
                                  <button 
                                    onClick={() => setEditingMemory({ id: recalledMemory.id, fact: recalledMemory.fact, pinned: recalledMemory.pinned })}
                                    className="absolute -right-2 -top-2 p-1 bg-zinc-800 border border-zinc-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Settings2 className="w-3 h-3 text-zinc-400" />
                                  </button>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      ) : m.content}
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-pink-500 animate-pulse" />
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl rounded-tl-none flex gap-1">
                      <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 md:p-8 pt-0">
                <div className="max-w-4xl mx-auto relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={`Message ${companion.name}...`}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-6 pr-16 py-4 text-white focus:ring-2 focus:ring-pink-500/50 outline-none transition-all"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isTyping}
                    className="absolute right-2 top-2 bottom-2 w-12 rounded-xl bg-pink-500 text-white flex items-center justify-center hover:bg-pink-600 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Memory Edit Modal */}
              <AnimatePresence>
                {editingMemory && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl"
                    >
                      <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2"><Brain className="w-5 h-5 text-pink-500" /> Edit Memory</div>
                        <button 
                          onClick={() => {
                            setCompanion(prev => ({
                              ...prev,
                              memory: prev.memory.map(m => m.id === editingMemory.id ? { ...m, pinned: !m.pinned } : m)
                            }));
                            setEditingMemory(prev => prev ? { ...prev, pinned: !prev.pinned } : null);
                          }}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            editingMemory.pinned ? "bg-pink-500/20 text-pink-500" : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                          )}
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                      </h3>
                      <textarea
                        value={editingMemory.fact}
                        onChange={(e) => setEditingMemory({ ...editingMemory, fact: e.target.value })}
                        className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 mb-6 resize-none focus:ring-1 focus:ring-pink-500 outline-none"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setCompanion(prev => ({
                              ...prev,
                              memory: prev.memory.filter(m => m.id !== editingMemory.id)
                            }));
                            setEditingMemory(null);
                          }}
                          className="flex-1 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-medium transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => {
                            setCompanion(prev => ({
                              ...prev,
                              memory: prev.memory.map(m => m.id === editingMemory.id ? { ...m, fact: editingMemory.fact } : m)
                            }));
                            setEditingMemory(null);
                          }}
                          className="flex-1 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-sm font-bold transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingMemory(null)}
                          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
