import type { OverscanConfig } from "../types"

export const DEFAULT_OVERSCAN_CONFIG: Required<OverscanConfig> = {
  count: 3,
  dynamic: false,
}

export function resolveOverscanConfig(overscan: OverscanConfig | number | undefined): Required<OverscanConfig> {
  if (overscan === undefined) return DEFAULT_OVERSCAN_CONFIG
  if (typeof overscan === "number") return { ...DEFAULT_OVERSCAN_CONFIG, count: overscan }
  return { ...DEFAULT_OVERSCAN_CONFIG, ...overscan }
}

/** Scroll end detection delay in milliseconds */
export const SCROLL_END_DELAY_MS = 150
