import { useEffect } from "preact/hooks"

export function useEffectOnce(fn: VoidFunction) {
  useEffect(fn, [])
}
