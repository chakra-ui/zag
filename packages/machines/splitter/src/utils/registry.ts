import { contains, getDocument, getParentElement } from "@zag-js/dom-query"
import type { Orientation, Point } from "@zag-js/types"
import { intersects, toRect } from "./intersects"
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
  private listenerAttached = false
  private options: {
    nonce: string
    hitAreaMargins: Required<HitAreaMargins>
  }

  constructor(options: SplitterRegistryOptions = {}) {
    this.options = {
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
  }

  private getPointerType(event: PointerEvent): "coarse" | "fine" {
    return event.pointerType === "touch" || event.pointerType === "pen" ? "coarse" : "fine"
  }

  private get doc() {
    const firstHandle = this.handles.values().next().value
    return getDocument(firstHandle?.element)
  }

  /**
   * Fast hit-test: only checks pointer proximity to handles (no stacking order).
   * Used for pointermove cursor feedback.
   */
  private findHitHandles(x: number, y: number, pointerType: "coarse" | "fine"): ResizeHandleData[] {
    const intersecting: ResizeHandleData[] = []
    const margin = this.options.hitAreaMargins[pointerType]

    this.handles.forEach((handle) => {
      const rect = handle.element.getBoundingClientRect()
      const hit =
        x >= rect.left - margin && x <= rect.right + margin && y >= rect.top - margin && y <= rect.bottom + margin

      if (hit) intersecting.push(handle)
    })

    return intersecting
  }

  /**
   * Full intersection check: hit-test + stacking order verification.
   * Used for pointerdown activation where correctness matters.
   */
  private findIntersectingHandles(
    x: number,
    y: number,
    pointerType: "coarse" | "fine",
    eventTarget?: EventTarget | null,
  ): ResizeHandleData[] {
    const hits = this.findHitHandles(x, y, pointerType)

    const targetElement = eventTarget instanceof HTMLElement || eventTarget instanceof SVGElement ? eventTarget : null
    if (!targetElement || !contains(this.doc, targetElement)) return hits

    return hits.filter((handle) => {
      const dragHandleElement = handle.element

      if (
        targetElement === dragHandleElement ||
        contains(dragHandleElement, targetElement) ||
        contains(targetElement, dragHandleElement)
      ) {
        return true
      }

      try {
        if (compareStackingOrder(targetElement, dragHandleElement) > 0) {
          const dragHandleRect = dragHandleElement.getBoundingClientRect()
          let currentElement: HTMLElement | SVGElement | null = targetElement

          while (currentElement) {
            if (currentElement.contains(dragHandleElement)) break

            const currentRect = currentElement.getBoundingClientRect()
            if (intersects(toRect(currentRect), toRect(dragHandleRect), true)) {
              return false // Target is above and overlaps — skip this handle
            }

            currentElement = getParentElement(currentElement) as HTMLElement | null
          }
        }
      } catch {
        // If comparison fails (e.g., no common ancestor), keep the handle
      }

      return true
    })
  }

  private handlePointerMove = (event: PointerEvent) => {
    if (this.state.isPointerDown) return // Don't recalculate during drag

    const pointerType = this.getPointerType(event)
    const intersecting = this.findHitHandles(event.clientX, event.clientY, pointerType)
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
    const doc = this.doc
    let styleEl = doc.getElementById(this.globalCursorId) as HTMLStyleElement | null
    const textContent = `* { cursor: ${cursor} !important; }`
    if (styleEl) {
      styleEl.textContent = textContent
    } else {
      styleEl = doc.createElement("style")
      styleEl.id = this.globalCursorId
      styleEl.textContent = textContent
      if (this.options.nonce) {
        styleEl.nonce = this.options.nonce
      }
      doc.head.appendChild(styleEl)
    }
  }

  private clearGlobalCursor() {
    const styleEl = this.doc.getElementById(this.globalCursorId)
    styleEl?.remove()
  }
}

export const registry = (opts: SplitterRegistryOptions = {}) => new SplitterRegistry(opts)
