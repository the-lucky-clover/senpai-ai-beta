import { Link, useLocation } from "react-router-dom";
import { 
  Sparkles, 
  LayoutDashboard, 
  Video, 
  UserCircle, 
  Settings, 
  Compass, 
  Wand2,
  LogOut
} from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

const navLinks = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Video Studio", path: "/video", icon: Video },
  { name: "Companion", path: "/companion", icon: UserCircle },
  { name: "Create Art", path: "/create", icon: Wand2 },
  { name: "Explore", path: "/explore", icon: Compass },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col sticky top-0 z-50">
      {/* Logo */}
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">Senpai-AI</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          
          return (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative overflow-hidden",
                isActive 
                  ? "bg-pink-500/10 text-pink-500" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500 rounded-r-full"
                />
              )}
              <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-pink-500" : "group-hover:text-pink-400")} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-zinc-900 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all group">
          <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
          Settings
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-all group">
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
