import { motion } from "motion/react";

export default function Logo({ className = "w-8 h-8", color = "white" }: { className?: string; color?: string }) {
  const isDark = color === "black";
  
  return (
    <div className={`relative flex items-center gap-2 group cursor-pointer ${className}`}>
      <motion.div 
        className="relative lenticular-contain"
        whileHover={{ rotate: 15 }}
        transition={{ type: "spring", stiffness: 300, damping: 10 }}
      >
        {/* Lenticular Rays Background Animation */}
        <div className="lenticular-rays" />
        
        {/* Particle Chaos */}
        <div className="particle-chaos">
          <div style={{ top: '20%', left: '30%', animationDelay: '0s' }} />
          <div style={{ top: '60%', left: '70%', animationDelay: '0.4s' }} />
          <div style={{ top: '40%', left: '10%', animationDelay: '0.8s' }} />
          <div style={{ top: '80%', left: '40%', animationDelay: '1.2s' }} />
        </div>

        {/* Golden Ratio inspired geometric logo */}
        <svg viewBox="0 0 100 100" className="w-full h-full fill-none relative z-10 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
          <defs>
            <linearGradient id="dmtGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#ec4899' }} />
              <stop offset="50%" style={{ stopColor: '#8b5cf6' }} />
              <stop offset="100%" style={{ stopColor: '#06b6d4' }} />
            </linearGradient>
            <mask id="logoMask">
              {/* Golden Spiral Path */}
              <path
                d="M50 50 m-40 0 a40 40 0 1 0 80 0 a40 40 0 1 0 -80 0 M50 50 m-25 0 a25 25 0 1 1 50 0 a25 25 0 1 1 -50 0 M50 50 m-15 0 a15 15 0 1 0 30 0 a15 15 0 1 0 -30 0"
                stroke="white"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <circle cx="50" cy="50" r="6" fill="white" />
            </mask>
          </defs>
          
          {/* Minimal B&W Layer */}
          <path
            d="M50 50 m-40 0 a40 40 0 1 0 80 0 a40 40 0 1 0 -80 0 M50 50 m-25 0 a25 25 0 1 1 50 0 a25 25 0 1 1 -50 0 M50 50 m-15 0 a15 15 0 1 0 30 0 a15 15 0 1 0 -30 0"
            stroke={isDark ? "black" : "white"}
            strokeWidth="1.5"
            className="opacity-80"
          />

          {/* Animated Infill Body */}
          <motion.rect 
            x="0" y="0" width="100" height="100" 
            fill="url(#dmtGradient)" 
            mask="url(#logoMask)"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ transformOrigin: 'center' }}
          />
          
          <rect x="0" y="0" width="100" height="100" fill="url(#dmtGradient)" fillOpacity="0.3" mask="url(#logoMask)" filter="blur(4px)" />

          {/* Dynamic Core */}
          <motion.circle
            cx="50" cy="50" r="4"
            fill={isDark ? "black" : "white"}
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </svg>
        
        {/* Luminous Glow for "Brilliance" */}
        <div className={`absolute inset-0 rounded-full blur-xl opacity-20 ${isDark ? 'bg-zinc-400' : 'bg-white'}`} />
      </motion.div>
    </div>
  );
}
