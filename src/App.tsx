/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Create from "./pages/Create";
import Explore from "./pages/Explore";
import VideoPage from "./pages/Video";
import CompanionPage from "./pages/Companion";

function AppContent() {
  const location = useLocation();
  const isDashboard = ["/video", "/create", "/companion"].includes(location.pathname);

  return (
    <div className={isDashboard ? "flex h-screen overflow-hidden" : "min-h-screen flex flex-col"}>
      {!isDashboard && <Navbar />}
      {isDashboard && <Sidebar />}
      <main className={isDashboard ? "flex-1 overflow-y-auto bg-zinc-950" : "flex-1 flex flex-col"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/video" element={<VideoPage />} />
          <Route path="/companion" element={<CompanionPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
