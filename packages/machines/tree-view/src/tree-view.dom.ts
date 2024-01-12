import { createScope, getByTypeahead, isHTMLElement, isHiddenElement } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./tree-view.types"

interface TreeWalkerOpts {
  skipHidden?: boolean
  root?: HTMLElement | null
}

export const dom = createScope({
  getLabelId: (ctx: Ctx) => `tree-label:${ctx.id}`,
  getRootId: (ctx: Ctx) => `tree-root:${ctx.id}`,
  getTreeId: (ctx: Ctx) => `tree-tree:${ctx.id}`,
  getItemId: (ctx: Ctx, id: string) => `tree-item:${ctx.id}:${id}`,
  getBranchId: (ctx: Ctx, id: string) => `tree-branch:${ctx.id}:${id}`,
  getBranchTriggerId: (ctx: Ctx, id: string) => `tree-branch-trigger:${ctx.id}:${id}`,

  getTreeEl(ctx: Ctx) {
    return dom.getById(ctx, dom.getTreeId(ctx))
  },

  getBranchEl(ctx: Ctx, id: string) {
    return dom.getById(ctx, dom.getBranchId(ctx, id))
  },
  getItemEl(ctx: Ctx, id: string) {
    return dom.getById(ctx, dom.getItemId(ctx, id))
  },
  getBranchTriggerEl(ctx: Ctx, id: string) {
    return dom.getById(ctx, dom.getBranchTriggerId(ctx, id))
  },

  getFocusedEl(ctx: Ctx) {
    if (!ctx.focusedId) return null
    return dom.getById(ctx, ctx.focusedId)
  },

  focusNode(node: Node | Element | null | undefined) {
    if (isHTMLElement(node)) node.focus()
  },

  getTreeWalker(ctx: Ctx, opts?: TreeWalkerOpts) {
    const { skipHidden = true, root } = opts ?? {}

    const treeEl = root || dom.getTreeEl(ctx)
    if (!treeEl) throw new Error("Tree or branch root not found")

    const doc = dom.getDoc(ctx)

    return doc.createTreeWalker(treeEl, NodeFilter.SHOW_ELEMENT, {
      acceptNode(node: HTMLElement) {
        if (skipHidden && isHiddenElement(node)) {
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
