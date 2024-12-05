import { hideOthers } from "./aria-hidden"

const raf = (fn: VoidFunction) => {
  const frameId = requestAnimationFrame(() => fn())
  return () => cancelAnimationFrame(frameId)
}

type MaybeElement = HTMLElement | null
type Targets = Array<MaybeElement>
type TargetsOrFn = Targets | (() => Targets)

type Options = {
  defer?: boolean
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
