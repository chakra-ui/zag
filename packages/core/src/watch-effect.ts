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

export function isWatchEffect(value: unknown): value is WatchEffect {
  return typeof value === "object" && value !== null && $watchEffect in value
}
