/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CameraMovement, MovementCategory, PromptResponse, LookCategory, CinematicLook } from './types';
import { CAMERA_MOVEMENTS, CINEMATIC_LOOKS } from './data';
import MovementDetail from './components/MovementDetail';
import CinematicLookCard from './components/CinematicLookCard';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  Youtube, 
  Facebook,
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
  
  // Cinematic Looks states
  const [selectedLookCategory, setSelectedLookCategory] = useState<LookCategory>('All');
  const [lookSearchQuery, setLookSearchQuery] = useState('');
  const [copiedLookId, setCopiedLookId] = useState<string | null>(null);

  const handleCopyLook = (e: React.MouseEvent, id: string, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedLookId(id);
    setTimeout(() => setCopiedLookId(null), 1500);
  };

  const filteredLooks = CINEMATIC_LOOKS.filter((l) => {
    const matchesCategory = selectedLookCategory === 'All' || l.category === selectedLookCategory;
    const matchesSearch = 
      l.title.toLowerCase().includes(lookSearchQuery.toLowerCase()) || 
      l.description.toLowerCase().includes(lookSearchQuery.toLowerCase()) || 
      l.category.toLowerCase().includes(lookSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // AI Prompt Synthesizer states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<PromptResponse | null>(null);

  // Active user learning hub drawer state (for 'Learn How' button)
  const [showLearningHub, setShowLearningHub] = useState(false);

  // Active section scroll tracking
  const [activeSection, setActiveSection] = useState<string>('camera-movements-section');

  useEffect(() => {
    const sectionIds = ['camera-movements-section', 'looks-lighting-section', 'learning-hub'];
    
    const handleScroll = () => {
      const elements = sectionIds.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
      if (elements.length === 0) return;

      // If scrolled to bottom, activate learning-hub
      const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 120;
      if (isBottom) {
        setActiveSection('learning-hub');
        return;
      }

      let currentActive = activeSection;
      let minDistance = Infinity;

      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        // Check if element is active in viewport
        if (rect.top <= 350 && rect.bottom >= 150) {
          const distance = Math.abs(rect.top - 120);
          if (distance < minDistance) {
            minDistance = distance;
            currentActive = el.id;
          }
        }
      });

      if (currentActive && currentActive !== activeSection) {
        setActiveSection(currentActive);
      }
    };

    // Use IntersectionObserver as a fast trigger as well
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: '-15% 0px -60% 0px',
        threshold: 0,
      }
    );

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger initial check
    setTimeout(handleScroll, 100);

    return () => {
      sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activeSection]);

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
    <div className="relative min-h-screen bg-[#0B0C10] text-[#E4E6EB] font-sans antialiased overflow-x-clip">
      
      {/* BACKGROUND DECORATIVE GRID LINES FOR DEPTH */}
      <div className="absolute inset-x-0 top-0 h-full w-full pointer-events-none select-none z-0" id="ambient-design-grid">
        <div className="absolute inset-y-0 left-12 w-px bg-white/[0.015]" />
        <div className="absolute inset-y-0 left-1/4 w-px bg-white/[0.015]" />
        <div className="absolute inset-y-0 left-2/4 w-px bg-white/[0.015] hidden md:block" />
        <div className="absolute inset-y-0 left-3/4 w-px bg-white/[0.015]" />
        <div className="absolute inset-y-0 right-12 w-px bg-white/[0.015]" />
      </div>

      {/* 1. HEADER SECTION */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0E1015]/70 backdrop-blur-lg" id="main-studio-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[30px] flex items-center justify-between gap-4 relative">
          
          {/* Top-Left Logo Block */}
          <div className="flex items-center gap-3.5 shrink-0 select-none">
            <div className="relative w-14 h-14 flex items-center justify-center">
              {/* Hexagonal stylized gradient background */}
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 rounded-lg transform rotate-45 border border-purple-400/20 shadow-[0_0_15px_rgba(168,85,247,0.25)]" />
              <div className="absolute inset-[1.5px] bg-[#0E1015] rounded-lg transform rotate-45 flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-purple-400 to-blue-400 animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col text-left leading-none">
              <span className="text-lg font-black text-white tracking-[0.25em] leading-none uppercase">AI SHOT</span>
              <span className="text-[13px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 tracking-widest uppercase mt-0.5">P-TOONGO STUDIO</span>
            </div>
          </div>

          {/* Centered Image in Header */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center justify-center">
            <img 
              src="/assets/Logo-PToonGo.png" 
              alt="Quang Phuong Master Header" 
              className="h-[62px] w-auto object-contain rounded-md"
              referrerPolicy="no-referrer"
            />
          </div>

        </div>

        {/* Quick Jump Navigation Menu Bar */}
        <div className="border-t border-white/10 bg-[#0B0C10]/70 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-center gap-y-2 gap-x-2 sm:gap-x-6 md:gap-x-10">
            <button
              onClick={() => {
                const el = document.getElementById('camera-movements-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`flex items-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-xs font-bold transition-all tracking-wider uppercase cursor-pointer group px-2.5 sm:px-4 py-1.5 rounded-lg border ${
                activeSection === 'camera-movements-section'
                  ? 'text-white bg-purple-500/10 border-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.15)] font-extrabold glow-purple-active'
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5 active:bg-white/10'
              }`}
            >
              <Compass className={`w-3.5 sm:w-4 h-3.5 sm:h-4 text-purple-400 group-hover:scale-110 group-hover:rotate-12 transition-transform ${activeSection === 'camera-movements-section' ? 'scale-110 rotate-6' : ''}`} />
              <span>Camera Movements</span>
              <span className="hidden sm:inline-block bg-purple-500/20 text-purple-400 text-[9px] px-1.5 py-0.5 rounded-md font-mono">44</span>
            </button>
            <div className="w-px h-4 bg-white/10" />
            <button
              onClick={() => {
                const el = document.getElementById('looks-lighting-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`flex items-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-xs font-bold transition-all tracking-wider uppercase cursor-pointer group px-2.5 sm:px-4 py-1.5 rounded-lg border ${
                activeSection === 'looks-lighting-section'
                  ? 'text-white bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_12px_rgba(99,102,241,0.15)] font-extrabold glow-indigo-active'
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5 active:bg-white/10'
              }`}
            >
              <Sparkles className={`w-3.5 sm:w-4 h-3.5 sm:h-4 text-indigo-400 group-hover:scale-110 group-hover:rotate-12 transition-transform ${activeSection === 'looks-lighting-section' ? 'scale-110 rotate-12' : ''}`} />
              <span>Cinematic Looks</span>
              <span className="hidden sm:inline-block bg-indigo-500/20 text-indigo-400 text-[9px] px-1.5 py-0.5 rounded-md font-mono">27</span>
            </button>
            <div className="w-px h-4 bg-white/10" />
            <button
              onClick={() => {
                const el = document.getElementById('learning-hub');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`flex items-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-xs font-bold transition-all tracking-wider uppercase cursor-pointer group px-2.5 sm:px-4 py-1.5 rounded-lg border ${
                activeSection === 'learning-hub'
                  ? 'text-white bg-blue-500/10 border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.15)] font-extrabold glow-blue-active'
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5 active:bg-white/10'
              }`}
            >
              <GraduationCap className={`w-4 sm:w-4.5 h-4 sm:h-4.5 text-blue-400 group-hover:scale-110 transition-transform ${activeSection === 'learning-hub' ? 'scale-110' : ''}`} />
              <span>Learning Hub</span>
            </button>
            <div className="w-px h-4 bg-white/10" />
            <button
              onClick={() => setShowLearningHub(true)}
              className="flex items-center gap-1.5 text-xs bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] tracking-wider shrink-0 cursor-pointer group"
            >
              <span>DISCOVER NOW</span>
              <Play className="w-3 h-3 fill-current group-hover:scale-110 group-hover:translate-x-0.5 transition-transform" />
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
              className="w-full max-w-md h-screen bg-[#111217]/50 backdrop-blur-lg border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl relative"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-purple-400" /> Quang Phuong Master
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
                    <span className="text-[10px] uppercase font-mono text-purple-400 font-bold block mb-1">P-ToonGo Studio 🎥</span>
                    <h4 className="font-semibold text-white mb-1">Introduction to P-ToonGo Studio</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      You will travel with me to experience many countries around the world: Asia, Europe, Australia, America, and even far-off Africa. Let's journey into dreams together with short animated films and share knowledge about AI technology.
                    </p>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                    <span className="text-[10px] uppercase font-mono text-purple-400 font-bold block mb-1">Channel 01</span>
                    <h4 className="font-semibold text-white mb-1">Experiential tourism channel</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      P-ToonGo Travel explores countries around the world through unique journeys, cultures, and cuisines. Experience and discover the world with each trip. 🌍✈️
                    </p>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                    <span className="text-[10px] uppercase font-mono text-purple-400 font-bold block mb-1">Channel 02</span>
                    <h4 className="font-semibold text-white mb-1">Entertainment and Educational Cartoon Channel</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      P-ToonGo Animation offers entertaining and educational animated films. Each story is a meaningful lesson about life, skills, and positive human values. 🎬✨👧🧒
                    </p>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                    <span className="text-[10px] uppercase font-mono text-purple-400 font-bold block mb-1">Channel 03</span>
                    <h4 className="font-semibold text-white mb-1">AI Technology Exchange Channel</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      P-ToonGo AI shares the latest AI knowledge, tools, and trends. Discover how AI is changing work, learning, and life. 🤖🚀
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6 scroll-mt-28" id="camera-movements-section">
          <div className="space-y-2 select-none">
            <h1 className="text-[21px] sm:text-[25px] font-extrabold tracking-tight leading-tight animated-gradient-text">
              44 Camera Movements for AI Video Prompts
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
                        preload="auto"
                        poster={movement.image}
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

        {/* 5. CINEMATIC LOOKS & LIGHTING SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6 mt-16 scroll-mt-24 animate-fadeIn" id="looks-lighting-section">
          <div className="space-y-2 select-none">
            <h2 className="text-[21px] sm:text-[25px] font-extrabold tracking-tight leading-tight animated-gradient-text uppercase">
              27 Cinematic Looks & Lighting for AI Video Prompts
            </h2>
            <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
              Explore advanced visual styles, legendary film emulsions, ambient color charts, and lighting profiles to design stunning atmospheric settings.
            </p>
          </div>
        </div>

        {/* LOOKS CONTROLS */}
        <div className="space-y-6">
          {/* Centered Look Search Input Bar */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-400 transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={lookSearchQuery}
              onChange={(e) => setLookSearchQuery(e.target.value)}
              placeholder="Search aesthetics (e.g. 'Cyberpunk', 'Neon', 'Vintage')..."
              className="w-full bg-[#121319] hover:bg-[#161720]/80 focus:bg-[#161720] border border-white/10 focus:border-purple-500 rounded-full py-4 pl-12 pr-6 text-sm text-white placeholder-gray-500 focus:outline-none focus:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all"
            />
          </div>

          {/* Pill Look Filter Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 py-1">
            {(['All', 'Cinema Legends', 'Film Stocks', 'Lighting', 'Stylized & Abstract'] as LookCategory[]).map((cat) => {
              const active = selectedLookCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedLookCategory(cat)}
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

        {/* LOOKS GRID */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase text-gray-400 tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> VISUAL LOOKS CATALOG ({filteredLooks.length} FOUND)
            </h3>
            <span className="text-[10px] text-gray-500 font-mono">
              Click copy icon on any card to copy aesthetic formula
            </span>
          </div>

          {filteredLooks.length === 0 ? (
            <div className="text-center py-20 bg-[#121319] border border-white/5 rounded-2xl">
              <Sparkles className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-medium mb-1">No cinematic looks found matching &quot;{lookSearchQuery}&quot;</p>
              <button 
                onClick={() => { setLookSearchQuery(''); setSelectedLookCategory('All'); }}
                className="text-xs text-purple-400 hover:underline hover:text-purple-300 transition-colors"
              >
                Clear all active search queries and filters
              </button>
            </div>
          ) : (
            <div className="movement-grid" id="looksGrid">
              {filteredLooks.map((look, idx) => (
                <CinematicLookCard
                  key={look.id}
                  look={look}
                  idx={idx}
                  copiedLookId={copiedLookId}
                  onCopyLook={handleCopyLook}
                />
              ))}
            </div>
          )}
        </div>

        {/* 4. SEAMLESS TUTORIAL HUB */}
        <section className="bg-[#121319] border border-white/5 p-6 sm:p-8 mt-10 rounded-2xl relative overflow-hidden flex flex-col lg:flex-row gap-6 lg:items-center justify-between scroll-mt-28" id="learning-hub">
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
      <footer className="border-t border-white/5 bg-[#08090C] pt-8 pb-[30px] mt-20 relative z-10 select-none">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-white/5">
          <div className="text-xs sm:text-sm font-sans italic font-bold select-none tracking-wide">
            <span className="shimmer-blue-text">
              Copyright by NGUYEN QUANG PHUONG<sup className="relative -top-1.5 text-[0.75em] ml-0.5">&reg;</sup>
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a 
              href="https://www.youtube.com/@QuangPhuongNguyen-PTG" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 bg-white hover:bg-gray-100 text-[#0F1015] text-[11px] font-bold px-3.5 py-2 rounded-md transition-all font-sans"
            >
              <Youtube className="w-3.5 h-3.5 text-red-600 fill-current" />
              <span>YouTube</span>
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 bg-white hover:bg-gray-100 text-[#0F1015] text-[11px] font-bold px-3.5 py-2 rounded-md transition-all font-sans"
            >
              <Facebook className="w-3.5 h-3.5 text-blue-600 fill-current" />
              <span>Facebook</span>
            </a>
            <a 
              href="https://zalo.me" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 bg-white hover:bg-gray-100 text-[#0F1015] text-[11px] font-bold px-3.5 py-2 rounded-md transition-all font-sans"
            >
              <span className="w-3.5 h-3.5 bg-[#0068FF] rounded-full flex items-center justify-center text-[8px] font-black text-white font-sans">Z</span>
              <span>Zalo</span>
            </a>
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
