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

  getNodeId(node: Node | null | undefined) {
    if (!isHTMLElement(node)) return ""
    return node.dataset.branch ?? node.id
  },

  getNodeEl(ctx: Ctx, id: string) {
    const node = dom.getById(ctx, id)
    if (node?.dataset.part === "branch") {
      return node.querySelector<HTMLElement>("[data-part=branch-trigger]")
    }
    return node
  },

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

  getTreeNodes(ctx: Ctx) {
    const walker = dom.getTreeWalker(ctx)

    const nodes: HTMLElement[] = []
    let node = walker.firstChild()

    while (node) {
      if (isHTMLElement(node)) {
        nodes.push(node)
      }
      node = walker.nextNode()
    }

    return nodes
  },

  getNodeIdsBetween(nodes: HTMLElement[], startNode: HTMLElement, endNode: HTMLElement) {
    const nextSet = new Set<string>()

    nodes.forEach((node) => {
      // compare node position with firstSelectedEl and focusedEl
      // if node is between firstSelectedEl and focusedEl, add it to nextSet
      if (node === startNode || node === endNode) {
        nextSet.add(dom.getNodeId(node))
        return
      }

      // use node.compareDocumentPosition to compare node position
      // https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition

      const startPos = node.compareDocumentPosition(startNode)
      const endPos = node.compareDocumentPosition(endNode)

      // if node is before firstSelectedEl and after focusedEl, add it to nextSet
      if (startPos & Node.DOCUMENT_POSITION_FOLLOWING && endPos & Node.DOCUMENT_POSITION_PRECEDING) {
        nextSet.add(dom.getNodeId(node))
        return
      }

      // if node is after firstSelectedEl and before focusedEl, add it to nextSet
      if (startPos & Node.DOCUMENT_POSITION_PRECEDING && endPos & Node.DOCUMENT_POSITION_FOLLOWING) {
        nextSet.add(dom.getNodeId(node))
        return
      }
    })

    return nextSet
  },
})
