import type { Platform } from "./types"

const MODIFIER_NORMALIZATION_MAP = new Map([
  ["ctrl", "Control"],
  ["control", "Control"],
  ["alt", "Alt"],
  ["option", "Alt"],
  ["shift", "Shift"],
  ["meta", "Meta"],
  ["cmd", "Meta"],
  ["command", "Meta"],
  ["win", "Meta"],
  ["windows", "Meta"],
])

export const normalizeModifier = (key: string): string => MODIFIER_NORMALIZATION_MAP.get(key.toLowerCase()) ?? key

const MODIFIER_SET = new Set(["control", "ctrl", "alt", "option", "shift", "meta", "cmd", "command", "win", "windows"])
export const isModifierSet = (key: string): boolean => MODIFIER_SET.has(key.toLowerCase())

// Resolve mod and ControlOrMeta to appropriate modifier based on platform
export function resolveControlOrMeta(key: string, platform: Platform): string {
  return isModKey(key.toLowerCase()) ? (platform === "mac" ? "Meta" : "Control") : key
}

export function isModKey(key: string): boolean {
  return key.toLowerCase() === "mod" || key.toLowerCase() === "controlormeta"
}
