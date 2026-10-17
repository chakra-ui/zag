"use client"

import { useEffect, useRef } from "react"

export const useTrack = (deps: any[], effect: VoidFunction) => {
  const values = (deps ?? []).map((d) => (typeof d === "function" ? d() : d))
  const previous = useRef<any[] | null>(null)

  // Compare against the last run, not a mounted flag, so effects reconnecting after
  // a hidden <Activity> still see changes made while hidden
  useEffect(() => {
    const prev = previous.current
    previous.current = values
    if (prev === null) return

    const changed = prev.length !== values.length || values.some((value, index) => !Object.is(value, prev[index]))
    if (changed) return effect()
  }, values)
}
