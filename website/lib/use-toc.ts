import { normalizeProps, useMachine } from "@zag-js/react"
import * as toc from "@zag-js/toc"
import { useId } from "react"

export type TocEntry = { content: string; slug: string; lvl: number }

/** Tracks which heading is in view, below the sticky header */
export function useToc(entries: TocEntry[]) {
  const service = useMachine(toc.machine, {
    id: useId(),
    items: entries.map((entry) => ({ value: entry.slug, depth: entry.lvl })),
    rootMargin: "-112px 0px -60% 0px",
  })
  return toc.connect(service, normalizeProps)
}
