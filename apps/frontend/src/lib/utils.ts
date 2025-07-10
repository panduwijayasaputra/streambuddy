import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// StreamBuddy specific utility functions
export function formatStreamDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function formatViewerCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export function getGameIcon(game: string): string {
  const gameIcons: Record<string, string> = {
    "Mobile Legends: Bang Bang": "gamepad-2",
    "Free Fire": "zap",
    Valorant: "target",
    "GTA V": "car",
    "PUBG Mobile": "map-pin",
    "Horror Games": "ghost",
    Minecraft: "cube",
    "Genshin Impact": "sword",
    "Ragnarok X": "shield",
    "Call of Duty: Mobile": "crosshair",
  };
  return gameIcons[game] || "gamepad-2";
}
