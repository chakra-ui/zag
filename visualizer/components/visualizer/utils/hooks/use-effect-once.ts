import { useEffect } from "react"

export function useEffectOnce(fn: VoidFunction) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(fn, [])
}
