/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Create from "./pages/Create";
import Explore from "./pages/Explore";
import VideoPage from "./pages/Video";
import CompanionPage from "./pages/Companion";
import { AuthProvider } from "./lib/AuthContext";

function AppContent() {
  const location = useLocation();
  const isDashboard = ["/video", "/create", "/companion"].includes(location.pathname);

  return (
    <div className={isDashboard ? "flex h-screen overflow-hidden" : "min-h-screen flex flex-col"}>
      {!isDashboard && <Navbar />}
      {isDashboard && <Sidebar />}
      <main className={isDashboard ? "flex-1 overflow-y-auto bg-zinc-950" : "flex-1 flex flex-col"}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 20, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex-1 flex flex-col"
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<Create />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/video" element={<VideoPage />} />
              <Route path="/companion" element={<CompanionPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
