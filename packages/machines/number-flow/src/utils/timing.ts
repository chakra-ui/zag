/**
 * CSS `<time>` parsing for the settle fallback timeout (§9.5, §11 "Tab backgrounded").
 */

const DURATION_RE = /^(-?[\d.]+)(ms|s)?$/

export function parseDurationMs(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const match = DURATION_RE.exec(value.trim())
  if (!match) return fallback
  const amount = Number(match[1])
  if (Number.isNaN(amount)) return fallback
  return match[2] === "s" ? amount * 1000 : amount
}

const DEFAULT_SETTLE_BUFFER_MS = 200

export interface SettleTimeoutOptions {
  spinDuration: string | undefined
  stagger: string | undefined
  placeCount: number
}

/** A safety-net timeout in case `transitionend` never fires (element removed, transitions disabled, ...). */
export function getSettleTimeoutMs(options: SettleTimeoutOptions): number {
  const { spinDuration, stagger, placeCount } = options
  return parseDurationMs(spinDuration, 900) + parseDurationMs(stagger, 0) * placeCount + DEFAULT_SETTLE_BUFFER_MS
}
