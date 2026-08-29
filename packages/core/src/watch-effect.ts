const $watchEffect = Symbol.for("zag.watchEffect")

/**
 * A getter for a tracked value. Returns a primitive so deps compare reliably; use `context.hash()`
 * or `toString()` for anything else. Shared with `TrackFn`.
 */
export type DepFn = () => string | number | boolean | null | undefined

/** Getters for the values that gate an effect. */
export type WatchEffectDeps = DepFn[]

/** The re-runnable portion of an effect. */
export type WatchEffectSetup = () => VoidFunction | void

/** Re-runs an effect when any of `deps` change. Received from an effect implementation. */
export type WatchEffectFn = (deps: WatchEffectDeps, setup: WatchEffectSetup) => WatchEffect

export interface WatchEffect {
  [$watchEffect]: true
  deps: WatchEffectDeps
  setup: WatchEffectSetup
}

/**
 * Re-runs `setup` when `deps` change, without re-entering the owning state — the effect counterpart
 * to `track` in `watch`. Anything outside the call runs once.
 *
 * Deps must read props, context or computed; `refs` are not tracked. Unlike Vue's `watchEffect`,
 * they are explicit rather than auto-tracked.
 */
export function watchEffect(deps: WatchEffectDeps, setup: WatchEffectSetup): WatchEffect {
  return { [$watchEffect]: true, deps, setup }
}

/**
 * One running effect, as tracked by an adapter. Keyed per invocation rather than per state path,
 * so a re-entered path keeps every setup's own cleanup.
 */
export interface EffectRecord {
  id: number
  path: string
  cleanup: VoidFunction | undefined
  deps?: WatchEffectDeps | undefined
  values?: any[] | undefined
  /** Set while a restart is queued, so several dep changes in one tick coalesce. */
  pending?: boolean | undefined
  setup?: WatchEffectSetup | undefined
}

export function isWatchEffect(value: unknown): value is WatchEffect {
  return typeof value === "object" && value !== null && $watchEffect in value
}
