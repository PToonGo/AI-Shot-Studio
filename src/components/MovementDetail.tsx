/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CameraMovement, PromptResponse } from '../types';
import { X, Copy, Check, Sliders, Sparkles, AlertCircle, Play, RotateCcw, ExternalLink } from 'lucide-react';

interface MovementDetailProps {
  movement: CameraMovement;
  onClose: () => void;
  onGenerateAI: (subject: string, engine: string, advanced: string) => Promise<void>;
  aiLoading: boolean;
  aiResult: PromptResponse | null;
  clearAiResult: () => void;
}

export default function MovementDetail({
  movement,
  onClose,
  onGenerateAI,
  aiLoading,
  aiResult,
  clearAiResult
}: MovementDetailProps) {
  const [customSubject, setCustomSubject] = useState('An ancient stone castle on a rugged cliffside amidst swirling lightning');
  const [intensity, setIntensity] = useState(movement.defaultIntensity);
  const [aiEngine, setAiEngine] = useState<'sora' | 'runway' | 'luma' | 'kling'>('sora');
  const [advancedDirectives, setAdvancedDirectives] = useState('');
  const [copiedLocal, setCopiedLocal] = useState(false);
  const [copiedAi, setCopiedAi] = useState(false);
  const [isSimulating, setIsSimulating] = useState(true);
  const [simKey, setSimKey] = useState(0);
  const [viewMode, setViewMode] = useState<'sample' | 'vector'>('sample');

  // Auto Reset AI results when switching movements
  useEffect(() => {
    clearAiResult();
    setIntensity(movement.defaultIntensity);
  }, [movement]);

  // Translate numerical intensity (1-5) into cinematic speed tags
  const getSpeedTag = (level: number) => {
    switch (level) {
      case 1: return { speed: 'slow, patient', prompt: 'extreme slow-motion, extra calm steady drift' };
      case 2: return { speed: 'controlled', prompt: 'slow-paced, smooth glide' };
      case 3: return { speed: 'moderate', prompt: 'measured steady movement' };
      case 4: return { speed: 'rapid', prompt: 'fast velocity, quick progressive push' };
      case 5: return { speed: 'abrupt', prompt: 'turbo fast, snap-zoom whip impact' };
      default: return { speed: 'moderate', prompt: 'smooth' };
    }
  };

  const currentSpeed = getSpeedTag(intensity);

  // Generate the customized local prompt based on user text input
  const getCustomizedLocalPrompt = () => {
    let base = movement.promptTemplate;
    // Replace default subjects like "astronaut..." or "businessman..." with the user's custom subject
    if (movement.id === 'slow-dolly-in') {
      base = base.replace('astronaut clad in high-tech suit inside a spaceship bridge with glowing purple and violet instrument consoles', customSubject);
    } else if (movement.id === 'fast-dolly-in') {
      base = base.replace('mysterious cloaked figure standing beneath a gaslamp flickering in heavy mist', customSubject);
    } else if (movement.id === 'vertigo-effect') {
      base = base.replace('intensely emotional face with tears starting to pool in the eyes', customSubject);
    } else if (movement.id === 'pan-left-right') {
      base = base.replace('businessman walking through a hyper-futuristic glass corridor adorned with glowing purple neon geometric lights', customSubject);
    } else if (movement.id === 'macro-lens-zoom') {
      base = base.replace('human eye. Macro lens zoom in, focusing on the highly detailed iris wherein digital codes and futuristic cyberspace interfaces are vibrant, shifting reflection of neon blue lights, shallow depth of field', customSubject);
    } else if (movement.id === 'drone-orbit-flyover') {
      base = base.replace('sprawling sci-fi metropolis at night. Drone gliding smoothly over giant glowing skyscrapers, slowly tilting down to reveal complex subterranean transport tubes filled with moving high-speed light ribbons', customSubject);
    } else if (movement.id === 'orbit-circular-track') {
      base = base.replace('couple dining at a small table inside an upscale, moody dimly-lit restaurant during golden hour', customSubject);
    } else if (movement.id === 'wide-peephole-peek') {
      base = base.replace('circular brass peephole in a stylized wooden apartment door. Ultra-wide fish-eye barrel distortion. A professional uniformed carrier standing in a dark corridor, holding a strange glowing mysterious box, top-down high-contrast lamp shadow', customSubject);
    } else {
      // Fallback container injection if subject does not map perfectly
      base = `Cinematic shot of "${customSubject}". ${movement.title}: ${movement.description}`;
    }

    // Adapt speed parameter
    base = base.replace('slow dolly in, moving gently forward', `dolly in, camera executing a ${currentSpeed.prompt}`);
    base = base.replace('fast dolly in, rapidly pushing', `dolly in, camera executing a ${currentSpeed.prompt}`);
    base = base.replace('smooth lateral track shot', `side-scrolling profile tracking shot executing a ${currentSpeed.prompt}`);
    base = base.replace('Macro lens zoom in', `Macro lens zooming in with a ${currentSpeed.prompt}`);
    base = base.replace('Drone gliding smoothly over', `Drone executing a ${currentSpeed.prompt} override above`);
    base = base.replace('circular tracking shot 360', `circular tracking orbit 360 at a ${currentSpeed.prompt}`);

    return base;
  };

  const handleCopyLocal = () => {
    navigator.clipboard.writeText(getCustomizedLocalPrompt());
    setCopiedLocal(true);
    setTimeout(() => setCopiedLocal(false), 2000);
  };

  const handleCopyAi = () => {
    if (aiResult) {
      navigator.clipboard.writeText(`${aiResult.synthesizedPrompt}\n\nNegative: ${aiResult.negativePrompt || ''}`);
      setCopiedAi(true);
      setTimeout(() => setCopiedAi(false), 2000);
    }
  };

  const triggerSimulation = () => {
    setIsSimulating(false);
    setTimeout(() => {
      setIsSimulating(true);
      setSimKey(prev => prev + 1);
    }, 50);
  };

  // Configure rendering vectors for simulated camera movement
  const motionVector = movement.motionVector;
  const simZFactor = motionVector.z * (intensity / movement.defaultIntensity);
  const simXFactor = motionVector.x * (intensity / movement.defaultIntensity);
  const simYFactor = motionVector.y * (intensity / movement.defaultIntensity);
  const simRotX = (motionVector.rotateX || 0) * (intensity / movement.defaultIntensity);
  const simRotY = (motionVector.rotateY || 0) * (intensity / movement.defaultIntensity);
  const simRotZ = (motionVector.rotateZ || 0) * (intensity / movement.defaultIntensity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        id="director-panel-root"
        className="relative w-full max-w-5xl h-[85vh] max-h-[850px] bg-[#121318] border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#161822]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-widest">
              {movement.category}
            </span>
            <h2 className="text-xl font-semibold text-white tracking-tight">{movement.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            id="panel-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Panel Split Layout */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
          
          {/* LEFT COLUMN: Visual Simulator & Customize Subject */}
          <div className="lg:col-span-5 p-6 flex flex-col gap-5 bg-[#0F1014]">
            
            {/* Perspective Simulation Window / Sample Video Toggle */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex bg-white/5 border border-white/5 rounded-lg p-0.5" id="viewmode-toggle-group">
                  <button
                    onClick={() => setViewMode('sample')}
                    className={`px-3 py-1 text-[10px] font-mono rounded-md transition-all uppercase tracking-wider cursor-pointer ${
                      viewMode === 'sample'
                        ? 'bg-purple-600 text-white font-bold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Cinematic Sample
                  </button>
                  <button
                    onClick={() => setViewMode('vector')}
                    className={`px-3 py-1 text-[10px] font-mono rounded-md transition-all uppercase tracking-wider cursor-pointer ${
                      viewMode === 'vector'
                        ? 'bg-purple-600 text-white font-bold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    3D Vector
                  </button>
                </div>
                {viewMode === 'vector' && (
                  <button
                    onClick={triggerSimulation}
                    className="flex items-center gap-1 text-[11px] font-mono text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Re-execute
                  </button>
                )}
              </div>

              <div className="relative w-full aspect-video bg-black rounded-lg border border-white/10 overflow-hidden flex items-center justify-center">
                {viewMode === 'sample' ? (
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={movement.image}
                    src={movement.video}
                  />
                ) : (
                  <>
                    {/* Simulated Grid Lines */}
                    <div className="absolute inset-0 z-0 bg-[radial-gradient(#1f2235_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

                    {/* Perspective Guide Lines */}
                    <svg className="absolute inset-0 w-full h-full text-white/5 pointer-events-none">
                      <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" strokeWidth="1" />
                      <line x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" strokeWidth="1" />
                    </svg>

                    {/* Render Simulated Camera Action */}
                    <AnimatePresence>
                      {isSimulating && (
                        <motion.div
                          key={simKey}
                          initial={{
                            x: 0,
                            y: 0,
                            scale: 1,
                            rotateX: 0,
                            rotateY: 0,
                            rotateZ: 0,
                          }}
                          animate={{
                            x: simXFactor,
                            y: simYFactor,
                            scale: simZFactor < 0 ? 1 + Math.abs(simZFactor) / 100 : 1 / (1 + simZFactor / 100),
                            rotateX: simRotX,
                            rotateY: simRotY,
                            rotateZ: simRotZ,
                          }}
                          transition={{
                            duration: 3,
                            ease: 'easeInOut',
                            repeat: Infinity,
                            repeatType: 'reverse',
                          }}
                          className="relative z-10 flex flex-col items-center justify-center text-center p-3"
                        >
                          {/* Virtual Camera Sight Frame */}
                          <div className="w-24 h-16 border-2 border-purple-500 rounded relative flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)] bg-purple-500/5">
                            <span className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-purple-400" />
                            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-purple-400" />
                            <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-purple-400" />
                            <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-purple-400" />
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          </div>
                          <span className="mt-3 text-[10px] font-mono text-purple-400 tracking-widest uppercase">
                            CAM_VECTOR_ACTIVE
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Subtitle Telemetry read-out */}
                    <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center text-[9px] font-mono text-gray-500">
                      <span>DX: {simXFactor.toFixed(1)}px | DY: {simYFactor.toFixed(1)}px</span>
                      <span className="text-purple-400/80">SCALE: {(simZFactor < 0 ? 1 + Math.abs(simZFactor) / 100 : 1 / (1 + simZFactor / 100)).toFixed(2)}x</span>
                      <span>ROT: {simRotZ.toFixed(1)}°</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Settings Sliders */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-gray-400 tracking-wider">
                <Sliders className="w-4 h-4 text-purple-400" /> Adjust Movement Speed
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-300 font-mono mb-1">
                  <span>{movement.intensityLabel}</span>
                  <span className="text-purple-400 font-bold">Level {intensity}/5 ({currentSpeed.speed})</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
                  <span>Super Slow</span>
                  <span>Cinematic</span>
                  <span>Turbo Velocity</span>
                </div>
              </div>
            </div>

            {/* Cinematic Directives Tip */}
            <div className="bg-purple-950/10 border border-purple-500/20 rounded-xl p-4 flex gap-3 text-xs text-purple-300/90 leading-relaxed">
              <AlertCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-purple-300 block mb-0.5">Cinematographer Tip:</span>
                {movement.cinematicTip}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Static Customization & Live Gemini Synthesis */}
          <div className="lg:col-span-7 p-6 flex flex-col gap-6 overflow-y-auto">
            
            {/* Form Area: Write your own subject & generate */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-mono uppercase text-gray-400 tracking-wider">
                1. Specify Your Video Subject / Scene
              </label>
              <textarea
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Describe your subject, scene settings, lights, and art style..."
                rows={3}
                className="w-full bg-[#1A1C24] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all resize-none"
              />
              <p className="text-[11px] text-gray-400 select-none">
                Default variables are matched dynamically inside the prompt framework. Feel free to override!
              </p>
            </div>

            {/* Local Template Prompt output */}
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono uppercase text-gray-400 tracking-wider">
                  2. Configured Prompt Template (Realtime)
                </span>
                <button
                  onClick={handleCopyLocal}
                  className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  {copiedLocal ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Prompt
                    </>
                  )}
                </button>
              </div>

              <div className="relative bg-[#0A0B0E] border border-white/10 rounded-xl p-4 font-mono text-xs text-gray-300 leading-relaxed block overflow-hidden">
                <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none bg-gradient-to-bl from-white/5 to-transparent rounded-bl-xl" />
                {getCustomizedLocalPrompt()}
              </div>
            </div>

            {/* DIVIDER */}
            <div className="relative flex items-center py-2 select-none">
              <div className="flex-1 border-t border-white/5" />
              <span className="mx-4 text-xs font-mono uppercase text-purple-400/60 font-semibold tracking-widest">
                Upgrade with Server AI
              </span>
              <div className="flex-1 border-t border-white/5" />
            </div>

            {/* LIVE AI SYNTHESIS FORM */}
            <div className="bg-[#171923] border border-purple-500/25 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" /> Live Hollywood AI Prompt Synthesizer
                </span>
                <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20 font-mono">
                  Gemini Flash model
                </span>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                Connect directly with our server-side actor model. Gemini will expand your concept into high-performance prompts containing specialized camera details, lighting cues, negative weights, and timing blocks.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">
                    Target AI Video Engine
                  </label>
                  <select
                    value={aiEngine}
                    onChange={(e: any) => setAiEngine(e.target.value)}
                    className="w-full bg-[#202230] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
                  >
                    <option value="sora">OpenAI Sora (Multi-sentence detailed)</option>
                    <option value="runway">Runway Gen-3 Alpha (Physics & speed)</option>
                    <option value="luma">Luma Dream Machine (Verbs & action)</option>
                    <option value="kling">Kling AI (Photorealistic standards)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">
                    Extra Cinematic Directives
                  </label>
                  <input
                    type="text"
                    value={advancedDirectives}
                    onChange={(e) => setAdvancedDirectives(e.target.value)}
                    placeholder="e.g. 'rainy sunset', 'volumetric fog', '35mm anamorphic'"
                    className="w-full bg-[#202230] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>
              </div>

              <button
                onClick={() => onGenerateAI(customSubject, aiEngine, advancedDirectives)}
                disabled={aiLoading}
                className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg disabled:opacity-50 transition-all cursor-pointer"
              >
                {aiLoading ? (
                  <>
                    <div className="w-4.5 h-4.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Synthesizing Directors Prompt...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4.5 h-4.5" />
                    <span>Generate AI Prompt with Gemini</span>
                  </>
                )}
              </button>

              {/* AI Results Display */}
              <AnimatePresence>
                {aiResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 text-xs flex flex-col gap-3.5 border-t border-white/5 pt-4"
                  >
                    {/* Meta telemetries */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-[#0F1015] p-2.5 rounded-lg border border-white/5 text-center">
                        <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-wider mb-0.5">Focus Control</span>
                        <span className="text-gray-300 font-medium font-sans block truncate">{aiResult.motionSettings?.focus || 'Locked'}</span>
                      </div>
                      <div className="bg-[#0F1015] p-2.5 rounded-lg border border-white/5 text-center">
                        <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-wider mb-0.5">Speed Rate</span>
                        <span className="text-gray-300 font-medium font-sans block truncate">{aiResult.motionSettings?.speed || 'Default'}</span>
                      </div>
                      <div className="bg-[#0F1015] p-2.5 rounded-lg border border-white/5 text-center">
                        <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-wider mb-0.5">Framing Style</span>
                        <span className="text-gray-300 font-medium font-sans block truncate">{aiResult.motionSettings?.framing || '16:9 Cinema'}</span>
                      </div>
                    </div>

                    {/* Master synthesized copy field */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono text-purple-300">
                        <span>SYNTHESIZED PROMPT FOR AI GENERATOR</span>
                        <button
                          onClick={handleCopyAi}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          {copiedAi ? (
                            <>
                              <Check className="w-3 h-3 text-green-400" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy Full Output
                            </>
                          )}
                        </button>
                      </div>
                      <div className="bg-[#090A0E] border border-purple-500/20 rounded-xl p-3.5 font-mono text-white leading-relaxed select-text">
                        {aiResult.synthesizedPrompt}
                      </div>
                    </div>

                    {/* Negative parameters */}
                    <div className="flex flex-col gap-1 text-[11px]">
                      <span className="font-mono text-red-400/80 uppercase text-[9px] tracking-wider">Recommended Negative Prompts</span>
                      <div className="p-2.5 bg-[#0e0000]/20 rounded-lg border border-red-500/10 font-mono text-gray-400">
                        {aiResult.negativePrompt || 'No specific limitations recommended.'}
                      </div>
                    </div>

                    {/* Directors commentary */}
                    {aiResult.explanation && (
                      <div className="italic text-gray-400 bg-white/5 p-3 rounded-lg border border-white/5 leading-relaxed text-xs">
                        &ldquo;{aiResult.explanation}&rdquo;
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
}
