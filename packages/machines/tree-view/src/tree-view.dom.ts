import { createScope, getByTypeahead, isHTMLElement, isHiddenElement } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./tree-view.types"

export const dom = createScope({
  getLabelId: (ctx: Ctx) => `tree-label:${ctx.id}`,
  getRootId: (ctx: Ctx) => `tree-root:${ctx.id}`,
  getTreeId: (ctx: Ctx) => `tree-tree:${ctx.id}`,
  getItemId: (ctx: Ctx, id: string) => `tree-item:${ctx.id}:${id}`,
  getBranchId: (ctx: Ctx, id: string) => `tree-branch:${ctx.id}:${id}`,

  getTreeEl(ctx: Ctx) {
    return dom.getById(ctx, dom.getTreeId(ctx))
  },

  getBranchEl(node: HTMLElement) {
    let parent = node.parentElement
    while (parent) {
      if (parent.dataset.part === "branch") return parent
      parent = parent.parentElement
    }
    return null
  },

  getFocusedEl(ctx: Ctx) {
    if (!ctx.focusedId) return null
    return dom.getById(ctx, ctx.focusedId)
  },

  focusNode(node: Node | Element | null | undefined) {
    if (isHTMLElement(node)) node.focus()
  },

  getTreeWalker(ctx: Ctx) {
    const treeEl = dom.getTreeEl(ctx)
    if (!treeEl) throw new Error("Tree view not found")

    const docEl = dom.getDoc(ctx)

    return docEl.createTreeWalker(treeEl, NodeFilter.SHOW_ELEMENT, {
      acceptNode(node: HTMLElement) {
        if (isHiddenElement(node)) {
          return NodeFilter.FILTER_REJECT
        }

        if (node.role === "treeitem" && node.dataset.part !== "branch") {
          return NodeFilter.FILTER_ACCEPT
        }

        if (node.role === "button" && node.dataset.part === "branch-trigger") {
          return NodeFilter.FILTER_ACCEPT
        }

        return NodeFilter.FILTER_SKIP
      },
    })
  },

  getMatchingEl(ctx: Ctx, key: string) {
    const walker = dom.getTreeWalker(ctx)

    const elements: HTMLElement[] = []
    let node = walker.firstChild()

    while (node) {
      if (isHTMLElement(node)) elements.push(node)
      node = walker.nextNode()
    }

    return getByTypeahead(elements, {
      state: ctx.typeahead,
      key,
      activeId: ctx.focusedId,
    })
  },
})
