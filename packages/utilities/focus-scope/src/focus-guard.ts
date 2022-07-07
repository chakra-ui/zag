import type { FocusContext } from "./focus-context"

let count = 0

export function focusGuardEffect(ctx: FocusContext) {
  const { doc } = ctx

  function createGuard() {
    const el = doc.createElement("span")
    el.setAttribute("data-focus-guard", "")
    el.tabIndex = 0
    el.style.cssText = "outline: none; opacity: 0; position: fixed; pointer-events: none"
    return el
  }

  const guards = doc.querySelectorAll("[data-focus-guard]")
  doc.body.insertAdjacentElement("afterbegin", guards[0] ?? createGuard())
  doc.body.insertAdjacentElement("beforeend", guards[1] ?? createGuard())
  count++

  return () => {
    if (count === 1) {
      doc.querySelectorAll("[data-focus-guard]").forEach((node) => node.remove())
    }
    count--
  }
}
