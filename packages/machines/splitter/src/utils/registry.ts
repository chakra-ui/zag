import { getDocument } from "@zag-js/dom-query"
import type { Orientation, Point } from "@zag-js/types"
import { intersects, rectToRectangle } from "./intersects"
import { compareStackingOrder } from "./stacking-order"

export interface ResizeHandleData {
  id: string
  element: HTMLElement
  orientation: Orientation
  onActivate: (point: Point) => void
  onDeactivate: VoidFunction
}

interface PointerState {
  activeHandleIds: Set<string>
  isPointerDown: boolean
}

export interface HitAreaMargins {
  /**
   * The margin for coarse pointers (touch, pen)
   * @default 15
   */
  coarse?: number
  /**
   * The margin for fine pointers (mouse)
   * @default 5
   */
  fine?: number
}

export interface SplitterRegistryOptions {
  /**
   * The root node for the registry. Use this to scope the registry to a shadow DOM.
   * @default document
   */
  getRootNode?: () => Document | ShadowRoot
  /**
   * The nonce for the injected cursor stylesheet (for CSP compliance).
   */
  nonce?: string
  /**
   * The hit area margins for resize handles.
   * Larger margins make it easier to grab handles, especially on touch devices.
   */
  hitAreaMargins?: HitAreaMargins
}

export class SplitterRegistry {
  private handles = new Map<string, ResizeHandleData>()
  private state: PointerState = {
    activeHandleIds: new Set(),
    isPointerDown: false,
  }
  private cleanupFns: Array<VoidFunction> = []
  private listenerAttached = false
  private options: Required<Omit<SplitterRegistryOptions, "hitAreaMargins">> & {
    hitAreaMargins: Required<HitAreaMargins>
  }

  constructor(options: SplitterRegistryOptions = {}) {
    this.options = {
      getRootNode: options.getRootNode ?? (() => document),
      nonce: options.nonce ?? "",
      hitAreaMargins: {
        coarse: options.hitAreaMargins?.coarse ?? 15,
        fine: options.hitAreaMargins?.fine ?? 5,
      },
    }
  }

  register(data: ResizeHandleData): VoidFunction {
    this.handles.set(data.id, data)
    this.attachGlobalListeners()

    return () => {
      this.handles.delete(data.id)
      this.state.activeHandleIds.delete(data.id)
      if (this.handles.size === 0) {
        this.detachGlobalListeners()
      }
    }
  }

  private attachGlobalListeners() {
    if (this.listenerAttached) return
    this.doc.addEventListener("pointermove", this.handlePointerMove, true)
    this.doc.addEventListener("pointerdown", this.handlePointerDown, true)
    this.doc.addEventListener("pointerup", this.handlePointerUp, true)
    this.listenerAttached = true
  }

  private detachGlobalListeners() {
    if (!this.listenerAttached) return

    this.doc.removeEventListener("pointermove", this.handlePointerMove, true)
    this.doc.removeEventListener("pointerdown", this.handlePointerDown, true)
    this.doc.removeEventListener("pointerup", this.handlePointerUp, true)
    this.listenerAttached = false

    this.cleanupFns.forEach((fn) => fn())
    this.cleanupFns = []
  }

  private getPointerType(event: PointerEvent): "coarse" | "fine" {
    return event.pointerType === "touch" || event.pointerType === "pen" ? "coarse" : "fine"
  }

  private isPointInRect(
    point: { x: number; y: number },
    rect: DOMRect,
    margins: { top: number; right: number; bottom: number; left: number },
  ): boolean {
    return (
      point.x >= rect.left - margins.left &&
      point.x <= rect.right + margins.right &&
      point.y >= rect.top - margins.top &&
      point.y <= rect.bottom + margins.bottom
    )
  }

  private get doc() {
    return getDocument(this.options.getRootNode())
  }

  private findIntersectingHandles(
    x: number,
    y: number,
    pointerType: "coarse" | "fine",
    eventTarget?: EventTarget | null,
  ): ResizeHandleData[] {
    const intersecting: ResizeHandleData[] = []

    // Get target element if provided
    const targetElement = eventTarget instanceof HTMLElement || eventTarget instanceof SVGElement ? eventTarget : null

    this.handles.forEach((handle) => {
      const dragHandleElement = handle.element
      const dragHandleRect = dragHandleElement.getBoundingClientRect()
      const margin = this.options.hitAreaMargins[pointerType]

      // Check if pointer is within hit area (with margins)
      const eventIntersects =
        x >= dragHandleRect.left - margin &&
        x <= dragHandleRect.right + margin &&
        y >= dragHandleRect.top - margin &&
        y <= dragHandleRect.bottom + margin

      if (!eventIntersects) {
        return
      }

      // Check if target is above handle in stacking order
      if (
        targetElement &&
        targetElement !== dragHandleElement &&
        this.doc.contains(targetElement) &&
        !dragHandleElement.contains(targetElement) &&
        !targetElement.contains(dragHandleElement)
      ) {
        try {
          // Use stacking-order library to check if target is above handle
          if (compareStackingOrder(targetElement, dragHandleElement) > 0) {
            // Target is above handle - check if they overlap
            // Walk up the parent tree to check intersections
            // (The target might be a small element inside a larger container)
            let currentElement: HTMLElement | SVGElement | null = targetElement
            let didIntersect = false

            while (currentElement) {
              if (currentElement.contains(dragHandleElement)) {
                break
              }

              const currentRect = currentElement.getBoundingClientRect()
              if (intersects(rectToRectangle(currentRect), rectToRectangle(dragHandleRect), true)) {
                didIntersect = true
                break
              }

              currentElement = currentElement.parentElement
            }

            if (didIntersect) {
              // Target is above and overlaps - skip this handle
              return
            }
          }
        } catch {
          // If comparison fails (e.g., no common ancestor), fall through
        }
      }

      intersecting.push(handle)
    })

    return intersecting
  }

  private handlePointerMove = (event: PointerEvent) => {
    if (this.state.isPointerDown) return // Don't recalculate during drag

    const pointerType = this.getPointerType(event)
    const intersecting = this.findIntersectingHandles(event.clientX, event.clientY, pointerType, event.target)
    const newActiveIds = new Set(intersecting.map((h) => h.id))

    // Check if active set changed
    const changed =
      newActiveIds.size !== this.state.activeHandleIds.size ||
      [...newActiveIds].some((id) => !this.state.activeHandleIds.has(id))

    if (changed) {
      this.state.activeHandleIds = newActiveIds
      this.updateCursor(intersecting)
    }
  }

  private handlePointerDown = (event: PointerEvent) => {
    const pointerType = this.getPointerType(event)
    const intersecting = this.findIntersectingHandles(event.clientX, event.clientY, pointerType, event.target)

    if (intersecting.length > 0) {
      this.state.isPointerDown = true
      this.state.activeHandleIds = new Set(intersecting.map((h) => h.id))

      // Activate all intersecting handles
      const point = { x: event.clientX, y: event.clientY }
      intersecting.forEach((handle) => {
        handle.onActivate(point)
      })

      this.updateCursor(intersecting)
    }
  }

  private handlePointerUp = (_event: PointerEvent) => {
    if (this.state.isPointerDown) {
      this.state.isPointerDown = false

      // Deactivate all handles
      this.handles.forEach((handle) => {
        if (this.state.activeHandleIds.has(handle.id)) {
          handle.onDeactivate()
        }
      })

      this.state.activeHandleIds.clear()
      this.clearGlobalCursor()
    }
  }

  private updateCursor(intersecting: ResizeHandleData[]) {
    if (intersecting.length === 0) {
      this.clearGlobalCursor()
      return
    }

    const hasHorizontal = intersecting.some((h) => h.orientation === "horizontal")
    const hasVertical = intersecting.some((h) => h.orientation === "vertical")

    let cursor = "default"
    if (hasHorizontal && hasVertical) {
      cursor = "move"
    } else if (hasHorizontal) {
      cursor = "ew-resize"
    } else if (hasVertical) {
      cursor = "ns-resize"
    }

    this.setGlobalCursor(cursor)
  }

  private globalCursorId = "splitter-registry-cursor"

  private setGlobalCursor(cursor: string) {
    let styleEl = this.doc.getElementById(this.globalCursorId) as HTMLStyleElement | null
    const textContent = `* { cursor: ${cursor} !important; }`
    if (styleEl) {
      styleEl.textContent = textContent
    } else {
      styleEl = this.doc.createElement("style")
      styleEl.id = this.globalCursorId
      styleEl.textContent = textContent

      // Apply nonce if provided (for CSP compliance)
      if (this.options.nonce) {
        styleEl.nonce = this.options.nonce
      }

      // Append to appropriate location
      if ("head" in this.doc) {
        this.doc.head.appendChild(styleEl)
      } else {
        // For ShadowRoot, append to the root
        const rootNode = this.options.getRootNode()
        rootNode.appendChild(styleEl)
      }
    }
  }

  private clearGlobalCursor() {
    const rootNode = this.options.getRootNode()
    const doc = "nodeType" in rootNode ? (rootNode as Document) : (rootNode as ShadowRoot).ownerDocument

    if (!doc) return

    const styleEl = doc.getElementById(this.globalCursorId)
    styleEl?.remove()
  }
}

export const registry = (opts: SplitterRegistryOptions = {}) => new SplitterRegistry(opts)
