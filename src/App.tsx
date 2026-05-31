/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CameraMovement, MovementCategory, PromptResponse } from './types';
import { CAMERA_MOVEMENTS } from './data';
import MovementDetail from './components/MovementDetail';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  Youtube, 
  GraduationCap, 
  Compass, 
  HelpCircle, 
  Play, 
  Copy, 
  Check, 
  Activity, 
  Sliders, 
  AlertCircle 
} from 'lucide-react';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<MovementCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovement, setSelectedMovement] = useState<CameraMovement | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, id: string, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };
  
  // AI Prompt Synthesizer states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<PromptResponse | null>(null);

  // Active user learning hub drawer state (for 'Learn How' button)
  const [showLearningHub, setShowLearningHub] = useState(false);

  // Filtered movements logic
  const filteredMovements = CAMERA_MOVEMENTS.filter((m) => {
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesSearch = 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Call server-side API to produce optimized Gemini prompts
  const handleGenerateAIPrompt = async (subject: string, engine: string, advanced: string) => {
    if (!selectedMovement) return;
    setAiLoading(true);
    setAiResult(null);

    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene: subject,
          movementTitle: selectedMovement.title,
          movementDescription: selectedMovement.description,
          intensity: selectedMovement.defaultIntensity,
          engine,
          advancedDirectives: advanced
        })
      });

      if (!response.ok) {
        throw new Error('Server returned an error generating your prompt');
      }

      const data = await response.json();
      setAiResult(data);
    } catch (err: any) {
      console.error(err);
      // Fallback response inside front-end if server experiences any network variance
      setAiResult({
        synthesizedPrompt: `Dramatic wide cinematic angle of "${subject}". Camera executes custom ${selectedMovement.title}. Volume lighting, misty cyberpunk photography, hyper-detailed, 8k rendering, styled for ${engine.toUpperCase()}.`,
        negativePrompt: "low-resolution, bad compression, distorted figures, text, watermark, bad frames",
        motionSettings: {
          speed: "Locked automatic pacing",
          focus: "Dynamic scene depth mapping",
          framing: "Cinematographic scope layout"
        },
        explanation: "Primary server endpoint fallback. Configure your GEMINI_API_KEY to retrieve high-fidelity creative concepts."
      });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0B0C10] text-[#E4E6EB] font-sans antialiased overflow-x-hidden">
      
      {/* BACKGROUND DECORATIVE GRID LINES FOR DEPTH */}
      <div className="absolute inset-x-0 top-0 h-full w-full pointer-events-none select-none z-0" id="ambient-design-grid">
        <div className="absolute inset-y-0 left-12 w-px bg-white/[0.015]" />
        <div className="absolute inset-y-0 left-1/4 w-px bg-white/[0.015]" />
        <div className="absolute inset-y-0 left-2/4 w-px bg-white/[0.015] hidden md:block" />
        <div className="absolute inset-y-0 left-3/4 w-px bg-white/[0.015]" />
        <div className="absolute inset-y-0 right-12 w-px bg-white/[0.015]" />
      </div>

      {/* 1. HEADER SECTION */}
      <header className="relative z-10 border-b border-white/10 bg-[#0E1015]/85 backdrop-blur-md sticky top-0" id="main-studio-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Top-Left Logo Block */}
          <div className="flex items-center gap-3 shrink-0 select-none">
            <div className="relative w-11 h-11 flex items-center justify-center">
              {/* Hexagonal stylized gradient background */}
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 rounded-lg transform rotate-45 border border-purple-400/20 shadow-[0_0_15px_rgba(168,85,247,0.25)]" />
              <div className="absolute inset-[1.5px] bg-[#0E1015] rounded-lg transform rotate-45 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-purple-400 to-blue-400 animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col text-left leading-none">
              <span className="text-sm font-black text-white tracking-[0.25em] leading-none uppercase">AI SHOT</span>
              <span className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 tracking-widest uppercase mt-0.5">STUDIO</span>
            </div>
          </div>

          {/* Center Dynamic Banner Ad Area */}
          <div className="hidden md:flex flex-1 max-w-xl lg:max-w-2xl bg-gradient-to-r from-purple-950/25 via-[#13141E]/95 to-[#0E1015] border border-white/5 rounded-xl overflow-hidden px-4 py-2.5 items-center justify-between gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <span className="bg-red-500/15 text-red-400 font-mono text-[9px] px-2 py-0.5 rounded border border-red-500/25 font-bold uppercase tracking-wider">
                COACHING ACT
              </span>
              <span className="text-xs font-bold text-white tracking-wide font-mono">
                300M+ VIEWS
              </span>
            </div>
            <div className="h-4 w-px bg-white/10 hidden lg:block" />
            <p className="text-[11px] text-gray-400 hidden lg:block truncate select-none">
              Master camera directors for Sora, Luma & Runway
            </p>
            <button
              onClick={() => setShowLearningHub(true)}
              className="flex items-center gap-1.5 text-xs bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold px-3 py-1.5 rounded-md transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] tracking-wider shrink-0 cursor-pointer"
            >
              <span>LEARN HOW</span>
              <Play className="w-3 h-3 fill-current" />
            </button>
          </div>

          {/* Top-Right Navigation buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 bg-white hover:bg-gray-100 text-[#0F1015] text-[11px] font-bold px-3.5 py-2.5 rounded-md transition-all font-sans"
            >
              <Youtube className="w-3.5 h-3.5 text-red-600 fill-current" />
              <span className="hidden sm:inline">YouTube</span>
            </a>
            <button
              onClick={() => setShowLearningHub(true)}
              className="flex items-center gap-2 bg-white hover:bg-gray-100 text-[#0F1015] text-[11px] font-bold px-3.5 py-2.5 rounded-md transition-all font-sans cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Academy</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. LEARNING HUB PANEL (MODAL COMPANION) */}
      <AnimatePresence>
        {showLearningHub && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="w-full max-w-md h-screen bg-[#111217] border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl relative"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-purple-400" /> AI Cinematography Academy
                  </h3>
                  <button 
                    onClick={() => setShowLearningHub(false)}
                    className="p-1 px-2.5 text-xs text-gray-400 bg-white/5 hover:bg-white/10 border border-white/5 rounded-md"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-4 text-sm flex-1">
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                    <span className="text-[10px] uppercase font-mono text-purple-400 font-bold block mb-1">Module 01</span>
                    <h4 className="font-semibold text-white mb-1">Introduction to Prompting Physics</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      AI video engines do not understand general camera movements without specific temporal physics tags. Learn to combine velocity markers with motion parameters.
                    </p>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                    <span className="text-[10px] uppercase font-mono text-purple-400 font-bold block mb-1">Module 02</span>
                    <h4 className="font-semibold text-white mb-1">Mastering Dolly & Drone Parallax</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      To optimize parallax depth, place distinct layered targets (foreground, midground, background) to allow AI engines to render flawless relative movement.
                    </p>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                    <span className="text-[10px] uppercase font-mono text-purple-400 font-bold block mb-1">Module 03</span>
                    <h4 className="font-semibold text-white mb-1">Engine Adaptability Controls</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Sora excels at highly detailed lens descriptions; Runway Gen-3 demands exact velocity metrics; Luma prefers active present-progressive verb bindings.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 text-center">
                <button
                  onClick={() => setShowLearningHub(false)}
                  className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 font-medium text-xs text-white"
                >
                  Got It, Back to Studio
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN LAYOUT WRAPPER */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
        
        {/* HERO TITLE BLOCK */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-2 select-none">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              42 Camera Movements for AI Video Prompts
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
              Explore professional cinematographic formulas, dynamic vector previews, and custom prompt templates optimized for state-of-the-art AI video generation engines.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#121319] border border-white/5 rounded-lg px-3 py-1.5 self-start">
            <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest leading-none">
              DB_REGISTRY: ACTIVE
            </span>
          </div>
        </div>

        {/* 2. MAIN TITLE SEARCH & FILTER CONTROLS */}
        <div className="space-y-6">
          {/* Centered Search Input Bar */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-400 transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movements (e.g. 'Dolly', 'Orbit')..."
              className="w-full bg-[#121319] hover:bg-[#161720]/80 focus:bg-[#161720] border border-white/10 focus:border-purple-500 rounded-full py-4 pl-12 pr-6 text-sm text-white placeholder-gray-500 focus:outline-none focus:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all"
            />
          </div>

          {/* Pill Filter Actions Row */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 py-1">
            {(['All', 'Dolly/Track', 'Zoom/Lens', 'Drone/Crane', 'Pan/Tilt'] as MovementCategory[]).map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                    active 
                      ? 'bg-white text-[#0B0C10] shadow-lg font-bold scale-[1.03]' 
                      : 'bg-[#121319] hover:bg-[#1C1D26] text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. VIDEO/IMAGE GRID SECTION */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase text-gray-400 tracking-widest flex items-center gap-2">
              <Compass className="w-4 h-4 text-purple-400" /> CAMERA MOVEMENT CATALOG ({filteredMovements.length} FOUND)
            </h3>
            <span className="text-[10px] text-gray-500 font-mono">
              Click any card to load Simulator & AI Customizer
            </span>
          </div>

          {filteredMovements.length === 0 ? (
            <div className="text-center py-20 bg-[#121319] border border-white/5 rounded-2xl">
              <Compass className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-medium mb-1">No custom movements found matching &quot;{searchQuery}&quot;</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="text-xs text-purple-400 hover:underline hover:text-purple-300 transition-colors"
              >
                Clear all active search queries and filters
              </button>
            </div>
          ) : (
            <div className="movement-grid" id="movementGrid">
              
              {filteredMovements.map((movement, idx) => {
                const categoryClean = movement.category.split('/')[0].toLowerCase();
                return (
                  <motion.div
                    key={movement.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.4), duration: 0.3 }}
                    onClick={() => setSelectedMovement(movement)}
                    onMouseEnter={(e) => {
                      const video = e.currentTarget.querySelector('video');
                      if (video) {
                        video.play().catch(err => console.log("Hover play blocked:", err));
                      }
                    }}
                    onMouseLeave={(e) => {
                      const video = e.currentTarget.querySelector('video');
                      if (video) {
                        video.pause();
                      }
                    }}
                    className="move-card"
                    data-category={categoryClean}
                    style={{ display: 'flex' }}
                  >
                    <div className="video-wrapper">
                      <video 
                        className="smart-video" 
                        loop 
                        muted 
                        playsInline 
                        src={movement.video}
                        data-src={movement.video} 
                        data-full-src={movement.videoFull} 
                      />
                    </div>
                    <div className="card-content">
                      <h3 
                        className="move-name fusion-responsive-typography-calculated" 
                        data-fontsize="28" 
                        data-lineheight="33.599998px" 
                        style={{ '--fontSize': 28, lineHeight: 1.2 } as any}
                      >
                        {movement.title}
                      </h3>
                      <div className="prompt-container">
                        <div className="prompt-box">
                          {movement.promptTemplate}
                        </div>
                        <button 
                          className="copy-icon-btn" 
                          onClick={(e) => handleCopy(e, movement.id, movement.promptTemplate)}
                          title="Copy prompt template"
                        >
                          {copiedId === movement.id ? (
                            <svg viewBox="0 0 24 24" className="icon-check">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" className="icon-copy">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

            </div>
          )}
        </div>

        {/* 4. SEAMLESS TUTORIAL HUB */}
        <section className="bg-[#121319] border border-white/5 p-6 sm:p-8 mt-10 rounded-2xl relative overflow-hidden flex flex-col lg:flex-row gap-6 lg:items-center justify-between" id="learning-hub">
          {/* Ambient lighting ball behind info card */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
          
          <div className="space-y-2 max-w-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-5.5 h-5.5 text-purple-400" /> Mastering the Cinematic prompt
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Applying premium camera movements into AI generators represents the threshold difference between flat, robotic output and highly cinematic Hollywood-grade results. Combine variables, set precise pacing markers, and lock focus.
            </p>
          </div>

          <button
            onClick={() => setShowLearningHub(true)}
            className="px-5 py-3 rounded-xl font-semibold bg-[#1F212D] hover:bg-[#282B3B] text-white text-xs tracking-wider uppercase border border-white/10 shrink-0 cursor-pointer self-start lg:self-auto transition-colors"
          >
            Open Learning Hub
          </button>
        </section>

      </main>

      {/* FOOTER METRIC BRAND BANNER */}
      <footer className="border-t border-white/5 bg-[#08090C] py-8 mt-20 relative z-10 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-gray-500">
          <div className="flex items-center gap-2">
            <span className="text-purple-500 font-bold">&bull;</span>
            <span>AI SHOT STUDIO CINEMATOGRAPHY RESOURCE</span>
          </div>
          <div className="flex gap-4">
            <span className="text-gray-400 font-semibold">42 MOVEMENT FORMULAS ACTIVE</span>
            <span>|</span>
            <span>HOSTED ON GOOGLE CLOUD INGRESS</span>
          </div>
        </div>
      </footer>

      {/* DETAILED INTERACTIVE POPUP / STUDIO MODAL */}
      <AnimatePresence>
        {selectedMovement && (
          <MovementDetail
            movement={selectedMovement}
            onClose={() => setSelectedMovement(null)}
            onGenerateAI={handleGenerateAIPrompt}
            aiLoading={aiLoading}
            aiResult={aiResult}
            clearAiResult={() => setAiResult(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
