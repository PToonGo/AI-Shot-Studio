/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MovementCategory = 'All' | 'Dolly/Track' | 'Zoom/Lens' | 'Drone/Crane' | 'Pan/Tilt';

export interface CameraMovement {
  id: string;
  title: string;
  category: MovementCategory;
  description: string;
  image: string;
  alt: string;
  video?: string;
  videoFull?: string;
  promptTemplate: string;
  cinematicTip: string;
  intensityLabel: string;
  defaultIntensity: number; // 1-5 scale (e.g., Slow, Moderate, Fast, Turbo, etc.)
  motionVector: {
    x: number; // Horizontal camera motion
    y: number; // Vertical camera motion
    z: number; // Depth camera motion
    rotateX?: number; // Pitch
    rotateY?: number; // Yaw
    rotateZ?: number; // Roll
  };
}

export interface PromptRequest {
  scene: string;
  movementId: string;
  intensity: number;
  engine: 'sora' | 'runway' | 'luma' | 'kling';
  advancedDirectives?: string;
}

export interface PromptResponse {
  synthesizedPrompt: string;
  negativePrompt?: string;
  motionSettings?: {
    speed: string;
    focus: string;
    framing: string;
  };
  explanation?: string;
}
