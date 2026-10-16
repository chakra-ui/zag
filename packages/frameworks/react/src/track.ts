"use client"

import { useEffect, useRef } from "react"

export const useTrack = (deps: any[], effect: VoidFunction) => {
  const values = (deps ?? []).map((d) => (typeof d === "function" ? d() : d))
  // Compared against the values the last run saw, not a mounted flag: an `<Activity>` that hides
  // the component disconnects its effects, and the first run after it reconnects must still see a
  // change made while hidden.
  const previous = useRef<any[] | null>(null)

  useEffect(() => {
    const prev = previous.current
    previous.current = values
    if (prev === null) return
    const changed = prev.length !== values.length || values.some((value, index) => !Object.is(value, prev[index]))
    if (changed) return effect()
  }, values)
}
