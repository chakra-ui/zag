import { useEffect } from "react"

export function useEffectOnce(fn: VoidFunction) {
  useEffect(fn, [])
}
