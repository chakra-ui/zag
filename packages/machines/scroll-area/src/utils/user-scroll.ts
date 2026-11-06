import type { BindableRefs } from "@zag-js/core"
import type { ScrollAreaSchema } from "../scroll-area.types"

type Refs = BindableRefs<ScrollAreaSchema>

export function markUserScroll(refs: Refs) {
  refs.set("programmaticScroll", false)
  resetUserScroll(refs)
}

export function resetUserScroll(refs: Refs) {
  refs.get("scrollEndTimeout").start(100, () => {
    refs.set("programmaticScroll", true)
  })
}
