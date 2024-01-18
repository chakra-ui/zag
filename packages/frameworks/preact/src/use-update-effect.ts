import { useEffect, useRef, type EffectCallback } from "preact/hooks"

export function useUpdateEffect(callback: EffectCallback, deps: any[]) {
  const render = useRef(false)
  const effect = useRef(false)

  useEffect(() => {
    const mounted = render.current
    const run = mounted && effect.current
    if (run) {
      return callback()
    }
    effect.current = true
  }, deps)

  useEffect(() => {
    render.current = true
    return () => {
      render.current = false
    }
  }, [])
}
