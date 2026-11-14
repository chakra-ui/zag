"use client"

import { noop } from "@zag-js/utils"
import { useEffect, useRef } from "react"

export const useTrack = (deps: any[], effect: VoidFunction) => {
  const values = (deps ?? []).map((d) => (typeof d === "function" ? d() : d))
  // Seeded with initial values so changes made while inside a hidden <Activity> aren't missed
  const previous = useRef<any[]>(values)

  useEffect(() => {
    const prev = previous.current
    previous.current = values

    const changed = prev.length !== values.length || values.some((value, index) => !Object.is(value, prev[index]))
    if (changed) return effect()
  }, values)
}

/** `notify` is a no-op here: React re-renders on prop changes, so there is nothing to subscribe to. */
export const useEffectSync = (reconcile: VoidFunction): VoidFunction => {
  useEffect(reconcile)
  return noop
}
