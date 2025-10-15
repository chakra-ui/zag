import { hideOthers } from "./aria-hidden"
import type { MaybeElement, MaybeFn } from "@zag-js/types"

const raf = (fn: VoidFunction) => {
  const frameId = requestAnimationFrame(() => fn())
  return () => cancelAnimationFrame(frameId)
}

type Targets = Array<MaybeElement>
type TargetsOrFn = MaybeFn<Targets>

type Options = {
  defer?: boolean | undefined
}

export function ariaHidden(targetsOrFn: TargetsOrFn, options: Options = {}) {
  const { defer = true } = options
  const func = defer ? raf : (v: any) => v()
  const cleanups: (VoidFunction | undefined)[] = []
  cleanups.push(
    func(() => {
      const targets = typeof targetsOrFn === "function" ? targetsOrFn() : targetsOrFn
      const elements = targets.filter(Boolean) as HTMLElement[]
      if (elements.length === 0) return
      cleanups.push(hideOthers(elements))
    }),
  )
  return () => {
    cleanups.forEach((fn) => fn?.())
  }
}
