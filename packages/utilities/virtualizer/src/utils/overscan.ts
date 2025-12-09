import type { OverscanConfig } from "../types"

export const DEFAULT_OVERSCAN_CONFIG: Required<OverscanConfig> = {
  count: 3,
  dynamic: false,
  strategy: "adaptive",
  maxMultiplier: 3,
  directional: false,
  predictive: false,
}

export function resolveOverscanConfig(overscan: OverscanConfig | undefined): Required<OverscanConfig> {
  if (overscan === undefined) return DEFAULT_OVERSCAN_CONFIG
  return { ...DEFAULT_OVERSCAN_CONFIG, ...overscan }
}

/** Scroll end detection delay in milliseconds */
export const SCROLL_END_DELAY_MS = 150
