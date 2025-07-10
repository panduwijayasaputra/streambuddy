export const STREAMBUDDY_COLORS = {
  primary: "#1E40AF", // Gaming-focused blue
  secondary: "#DC2626", // Indonesian red
  accent: "#059669", // Success green
  background: "#FFFFFF",
  surface: "#F8FAFC",
  text: "#1F2937",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  error: "#EF4444",
  warning: "#F59E0B",
  success: "#10B981",
} as const;

export type StreamBuddyColor = keyof typeof STREAMBUDDY_COLORS;
