
export type PixelShape = 'square' | 'circle' | 'diamond' | 'triangle';

export interface PixelUser {
  id: string;
  username: string;
  pixelCount: number;
  color: string;
  shape: PixelShape;
  rewards: string[];
  lastUpdated: number;
}

export interface Pixel {
  id: string;
  x: number;
  y: number;
  color: string;
  shape: PixelShape;
  ownerId: string;
  ownerName: string;
}

export const GRID_SIZE = 80; // 80x80 grid
export const DEFAULT_COLOR = '#FFFFFF';
export const PALETTE = [
  '#FFFFFF', // White
  '#FF6B00', // Primary Orange
  '#FF8533', // Lighter Orange
  '#FF4D00', // Darker Orange
  '#212529', // Black
  '#495057', // Dark gray
  '#ADB5BD', // Gray
  '#CED4DA', // Gray
  '#E9ECEF', // Light gray
  '#F8F9FA', // Off-white
];
