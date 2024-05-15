import { createScope, getByTypeahead, isHTMLElement, isHiddenElement, query, queryAll } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./tree-view.types"

interface TreeWalkerOpts {
  skipHidden?: boolean
  root?: HTMLElement | null
}

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `tree-root:${ctx.id}`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `tree-label:${ctx.id}`,
  getTreeId: (ctx: Ctx) => ctx.ids?.tree ?? `tree-tree:${ctx.id}`,

  getNodeId(node: Node | null | undefined) {
    if (!isHTMLElement(node)) return null
    return node.dataset.branch ?? node.dataset.item ?? null
  },

  getNodeEl(ctx: Ctx, id: string) {
    const node = dom.getItemEl(ctx, id) ?? dom.getBranchEl(ctx, id)
    if (node?.dataset.part === "branch") {
      return query(node, "[data-part=branch-control]")
    }
    return node
  },

  getTreeEl(ctx: Ctx) {
    return dom.getById(ctx, dom.getTreeId(ctx))
  },

  getBranchEl(ctx: Ctx, id: string) {
    const selector = `[role=treeitem][data-branch="${id}"]`
    return query(dom.getTreeEl(ctx), selector)
  },
  getItemEl(ctx: Ctx, id: string) {
    const selector = `[role=treeitem][data-item="${id}"]`
    return query(dom.getTreeEl(ctx), selector)
  },
  getBranchControlEl(ctx: Ctx, id: string) {
    const selector = "[data-part=branch-control]"
    return query(dom.getBranchEl(ctx, id), selector)
  },

  getFocusedEl(ctx: Ctx) {
    if (!ctx.focusedValue) return null
    return dom.getById(ctx, ctx.focusedValue)
  },

  focusNode(node: Node | Element | null | undefined, options?: FocusOptions) {
    if (isHTMLElement(node)) node.focus(options)
  },

  getNodeDepth(node: HTMLElement | null) {
    return node?.dataset.depth ? Number(node.dataset.depth) : -1
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

        if (node.role === "button" && node.dataset.part === "branch-control") {
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
      state: ctx.typeaheadState,
      key,
      activeId: ctx.focusedValue,
      itemToId: (v) => dom.getNodeId(v) ?? v.id,
    })
  },

  getTreeNodes(ctx: Ctx, options: TreeWalkerOpts = {}) {
    const walker = dom.getTreeWalker(ctx, options)

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

  getBranchNodes(ctx: Ctx, depth: number | null) {
    if (depth === -1) return []
    return queryAll(dom.getTreeEl(ctx), `[role=treeitem][data-part=branch][data-depth="${depth}"]`)
  },

  getNodesInRange(nodes: HTMLElement[], startNode: HTMLElement, endNode: HTMLElement) {
    const nextSet = new Set<string>()

    nodes.forEach((node) => {
      const nodeId = dom.getNodeId(node)
      if (nodeId == null) return

      // compare node position with firstSelectedEl and focusedEl
      // if node is between firstSelectedEl and focusedEl, add it to nextSet
      if (node === startNode || node === endNode) {
        nextSet.add(nodeId)
        return
      }

      // use node.compareDocumentPosition to compare node position
      // https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition

      const startPos = node.compareDocumentPosition(startNode)
      const endPos = node.compareDocumentPosition(endNode)

      // if node is before firstSelectedEl and after focusedEl, add it to nextSet
      if (startPos & Node.DOCUMENT_POSITION_FOLLOWING && endPos & Node.DOCUMENT_POSITION_PRECEDING) {
        nextSet.add(nodeId)
        return
      }

      // if node is after firstSelectedEl and before focusedEl, add it to nextSet
      if (startPos & Node.DOCUMENT_POSITION_PRECEDING && endPos & Node.DOCUMENT_POSITION_FOLLOWING) {
        nextSet.add(nodeId)
        return
      }
    })

    return Array.from(nextSet)
  },
})
