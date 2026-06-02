/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { CinematicLook } from '../types';

interface CinematicLookCardProps {
  key?: any;
  look: any;
  idx: number;
  copiedLookId: any;
  onCopyLook: (e: any, id: string, text: string) => void;
}

export default function CinematicLookCard({
  look,
  idx,
  copiedLookId,
  onCopyLook
}: CinematicLookCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      // Ensure source is loaded and play immediately on hover
      videoRef.current.play().catch((err) => {
        console.log("Hover automatic play prevented:", err);
      });
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const categoryClean = look.category === 'Cinema Legends' 
    ? 'legends' 
    : look.category === 'Film Stocks' 
    ? 'film-stocks' 
    : look.category === 'Lighting' 
    ? 'lighting' 
    : 'stylized';

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.05, 0.4), duration: 0.3 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="move-card"
      data-category={categoryClean}
      style={{ display: 'flex' }}
    >
      <div className="video-wrapper">
        <video
          ref={videoRef}
          className="smart-video"
          loop
          muted
          playsInline
          preload="auto"
          src={look.video}
          data-src={look.video}
          data-full-src={look.videoFull}
        />
      </div>
      <div className="card-content">
        <h3
          className="move-name fusion-responsive-typography-calculated"
          data-fontsize="28"
          data-lineheight="33.6px"
          style={{ '--fontSize': 28, lineHeight: 1.2 } as any}
        >
          {look.title}
        </h3>
        <div className="prompt-container">
          <div className="prompt-box">{look.description}</div>
          <button
            className="copy-icon-btn"
            onClick={(e) => onCopyLook(e, look.id, look.description)}
            title="Copy aesthetic prompt"
          >
            {copiedLookId === look.id ? (
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
}
