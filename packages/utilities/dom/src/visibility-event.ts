import { cast } from "@ui-machines/utils"
import { addDomEvent } from "./listener"

export function trackDocumentVisibility(_doc: Document, callback: (hidden: boolean) => void) {
  const doc = cast(_doc) as Document & { msHidden?: boolean; webkitHidden?: boolean }
  return addDomEvent(doc, "visibilitychange", () => {
    const hidden = doc.hidden || doc.msHidden || doc.webkitHidden
    callback(!!hidden)
  })
}
