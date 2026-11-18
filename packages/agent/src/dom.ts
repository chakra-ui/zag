// Reading the page the way a person would name things on it.

// Text nodes joined with spaces, so "Ada Okafor" and "Admin" in two cells don't run together.
export function textOf(el: Element | null | undefined): string {
  if (!el) return ""
  let text = ""
  let parent: Node | null = null
  const walker = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    const node = walker.currentNode
    // Text split by the framework inside one element ("Remove ", name, "?") stays together.
    text += (parent && node.parentNode !== parent ? " " : "") + (node.nodeValue ?? "")
    parent = node.parentNode
  }
  return text.replace(/\s+/g, " ").trim()
}

const byIds = (el: Element, ids: string) => {
  const doc = el.ownerDocument
  return ids
    .split(/\s+/)
    .map((id) => textOf(doc.getElementById(id)))
    .filter(Boolean)
    .join(" ")
}

/** The element's accessible name, from aria-labelledby, aria-label, a label, or its text. */
export function nameOf(el: Element | null | undefined, useText = true): string | undefined {
  if (!el) return undefined
  const labelledBy = el.getAttribute("aria-labelledby")
  if (labelledBy) {
    const name = byIds(el, labelledBy)
    if (name) return name
  }
  const label = el.getAttribute("aria-label")?.trim()
  if (label) return label
  if (el.id) {
    const forLabel = el.ownerDocument.querySelector(`label[for="${CSS.escape(el.id)}"]`)
    if (forLabel) return textOf(forLabel)
  }
  const wrapping = el.closest("label")
  if (wrapping) return textOf(wrapping)
  return useText ? textOf(el) || undefined : undefined
}

export const isShown = (el: Element | null | undefined): el is HTMLElement => {
  if (!el || !el.isConnected) return false
  const html = el as HTMLElement
  if (typeof html.checkVisibility === "function") return html.checkVisibility()
  return html.getClientRects().length > 0
}

// `aria-hidden` the app wrote hides a decorative part from agents too. The one a modal sets on the page behind it,
// marked `data-aria-hidden`, doesn't: that page is still there, and a dialog's steps can come back to it.
export const isOffLimits = (el: Element) =>
  !!el.closest("[data-agent-hidden], [aria-hidden='true']:not([data-aria-hidden])")

/** The sections that hold an element, like its tab panel and accordion item, by their trigger's text. */
export function sectionsOf(el: Element): string[] {
  const names: string[] = []
  let node: Element | null = el.parentElement
  while (node) {
    const role = node.getAttribute("role")
    if (
      node.hasAttribute("aria-labelledby") &&
      (role === "tabpanel" || role === "region" || node.hasAttribute("hidden"))
    ) {
      const name = nameOf(node, false)
      if (name) names.unshift(name)
    }
    node = node.parentElement
  }
  return names
}

/** Other text on the element's row, like the member name beside a menu trigger. */
export function rowOf(el: Element, name?: string): string | undefined {
  const row = el.closest("li, tr, [role='row']")
  if (!row) return undefined
  let text = textOf(row)
  const own = textOf(el)
  if (own) text = text.replace(own, " ")
  if (name) text = text.replace(name, " ")
  text = text.replace(/\s+/g, " ").trim()
  if (!text || text === name) return undefined
  return text
}

export function buttonsIn(container: Element | null | undefined) {
  if (!container) return []
  return Array.from(container.querySelectorAll<HTMLElement>("button, [role='button']")).filter(
    (button) => isShown(button) && !button.hasAttribute("disabled"),
  )
}

// Two frames, so the framework has rendered what a call changed. A hidden tab
// runs no frames, so a timer stands in there.
export const frames = () =>
  new Promise<void>((resolve) => {
    if (document.hidden) setTimeout(resolve, 32)
    else requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })

// Native setter plus an input event, so React, Vue and others see the change.
export function fillValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, value)
  el.dispatchEvent(new Event("input", { bubbles: true }))
  el.dispatchEvent(new Event("change", { bubbles: true }))
}

export const fold = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

export const wordsOf = (text: string): string[] => Array.from(fold(text).match(/[\p{L}\p{N}]+/gu) ?? [])

// What a secret field shows instead of its value: one an agent may fill but never read.
export const REDACTED = "[redacted]"

export const isSecret = (el: Element | null | undefined) =>
  !!el &&
  (!!el.closest("[data-agent-secret]") ||
    (el instanceof HTMLInputElement && el.type === "password") ||
    /^(cc-|one-time-code)/.test((el as HTMLInputElement).autocomplete ?? ""))
