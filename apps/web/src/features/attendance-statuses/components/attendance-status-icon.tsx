import { AlertCircle, Check, Clock, X } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";

export const STANDARD_ICONS = [
  { id: "check", label: "Centang" },
  { id: "x", label: "Silang" },
  { id: "alert", label: "Peringatan" },
  { id: "clock", label: "Waktu" },
] as const;

export const COLOR_PRESETS = [
  { hex: "#2563EB", label: "Biru" },
  { hex: "#16A34A", label: "Hijau" },
  { hex: "#DC2626", label: "Merah" },
  { hex: "#D97706", label: "Oranye" },
  { hex: "#7C3AED", label: "Ungu" },
  { hex: "#64748B", label: "Abu-abu" },
] as const;

export const LETTER_ICONS = Array.from({ length: 26 }, (_, i) => {
  const letter = String.fromCharCode(65 + i);
  return { id: `letter:${letter}`, label: `Huruf ${letter}`, letter };
});

export function isValidColorHex(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color.trim());
}

export function isValidIconIdentifier(icon: string): boolean {
  if (!icon) return false;
  const standardIds = ["check", "x", "alert", "clock"];
  if (standardIds.includes(icon)) return true;
  return /^letter:[A-Za-z]$/.test(icon);
}

interface AttendanceStatusIconProps {
  icon?: string | null;
  className?: string;
  size?: number;
}

export const AttendanceStatusIcon: React.FC<AttendanceStatusIconProps> = ({
  icon,
  className,
}) => {
  const trimmed = icon?.trim() ?? "check";

  if (trimmed === "check") {
    return <Check className={cn("size-4", className)} aria-hidden="true" />;
  }

  if (trimmed === "x") {
    return <X className={cn("size-4", className)} aria-hidden="true" />;
  }

  if (trimmed === "alert") {
    return (
      <AlertCircle className={cn("size-4", className)} aria-hidden="true" />
    );
  }

  if (trimmed === "clock") {
    return <Clock className={cn("size-4", className)} aria-hidden="true" />;
  }

  if (trimmed.startsWith("letter:")) {
    const letter = trimmed.slice(7).trim().toUpperCase().charAt(0) || "A";
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center font-bold text-xs leading-none select-none",
          className,
        )}
        aria-hidden="true"
      >
        {letter}
      </span>
    );
  }

  // Safe fallback
  return <Check className={cn("size-4", className)} aria-hidden="true" />;
};

interface AttendanceStatusBadgeProps {
  name: string;
  color?: string | null;
  icon?: string | null;
  className?: string;
}

export const AttendanceStatusBadge: React.FC<AttendanceStatusBadgeProps> = ({
  name,
  color,
  icon,
  className,
}) => {
  const safeColor = color && isValidColorHex(color) ? color : "#2563EB";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition-colors",
        className,
      )}
      style={{ backgroundColor: safeColor }}
    >
      <span className="flex size-4 shrink-0 items-center justify-center">
        <AttendanceStatusIcon icon={icon} className="size-3.5 text-white" />
      </span>
      <span>{name || "Status"}</span>
    </span>
  );
};
