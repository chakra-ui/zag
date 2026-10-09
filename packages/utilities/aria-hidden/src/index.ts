import { whenNode } from "@zag-js/dom-query"
import { hideOthers } from "./aria-hidden"

type MaybeElement = HTMLElement | null
type Targets = Array<MaybeElement>
type TargetsOrFn = Targets | (() => Targets)

type Options = {
  defer?: boolean | undefined
}

export function ariaHidden(targetsOrFn: TargetsOrFn, options: Options = {}) {
  const { defer = true } = options
  const getElements = () => {
    const targets = typeof targetsOrFn === "function" ? targetsOrFn() : targetsOrFn
    return targets.filter(Boolean) as HTMLElement[]
  }
  return whenNode(
    () => getElements()[0] ?? null,
    () => hideOthers(getElements()),
    { defer, frame: true },
  )
}
