import { ariaHidden } from "@zag-js/aria-hidden"
import { createMachine, type Params } from "@zag-js/core"
import { raf, trackPointerMove } from "@zag-js/dom-query"
import { createLiveRegion } from "@zag-js/live-region"
import { distance as pointDistance } from "@zag-js/rect-utils"
import { nextIndex, prevIndex } from "@zag-js/utils"
import type { Point } from "@zag-js/types"
import * as dom from "./dnd.dom"
import type { DndSchema, DropPlacement, IntlTranslations } from "./dnd.types"
import { createAutoScroll } from "./utils/auto-scroll"
import { closestEdge } from "./utils/collision"

type ActionParams = Params<DndSchema>

const defaultTranslations: IntlTranslations = {
  pickup: (source) =>
    `Picked up ${source}. Press Tab to navigate to a drop target, then press Enter to drop, or press Escape to cancel.`,
  dragOver: (_source, target, placement) => {
    if (placement === "on") return `Over ${target}. Press Enter to drop.`
    return `${placement === "before" ? "Before" : "After"} ${target}. Press Enter to drop.`
  },
  drop: (source, target, placement) => {
    if (placement === "on") return `Dropped ${source} on ${target}.`
    return `Dropped ${source} ${placement} ${target}.`
  },
  cancel: (source) => `Cancelled dragging ${source}.`,
  instructions: "Press Enter or Space to start dragging.",
}

function getTranslations(params: ActionParams): IntlTranslations {
  return { ...defaultTranslations, ...params.prop("translations") }
}

function getDragValues(params: ActionParams): string[] {
  const source = params.context.get("dragSource")
  if (!source) return []
  const selectedValues = params.prop("selectedValues")
  return selectedValues?.includes(source) ? selectedValues : [source]
}

function getFirstAllowedPlacement(
  source: string,
  target: string,
  placements: DropPlacement[],
  canDrop?: ((source: string, target: string, placement: DropPlacement) => boolean) | null,
): DropPlacement | null {
  if (!canDrop) return placements[0]
  for (const p of placements) {
    if (canDrop(source, target, p)) return p
  }
  return null
}

function isAnyPlacementAllowed(
  source: string,
  target: string,
  placements: DropPlacement[],
  canDrop: (source: string, target: string, placement: DropPlacement) => boolean,
): boolean {
  return placements.some((p) => canDrop(source, target, p))
}

function getLabel(params: ActionParams, value: string): string {
  const getValueText = params.prop("getValueText")
  if (getValueText) return getValueText(value)
  const el = dom.getDraggableEl(params.scope, value)
  return el?.textContent?.trim() ?? value
}

export const machine = createMachine<DndSchema>({
  props({ props }) {
    return {
      orientation: "vertical",
      dropPlacements: ["before", "after"],
      edgeThreshold: 5,
      scrollThreshold: 20,
      stickyDelay: 150,
      dragOverDelay: 500,
      ...props,
    }
  },

  initialState() {
    return "idle"
  },

  context({ bindable }) {
    return {
      dragSource: bindable<string | null>(() => ({ defaultValue: null })),
      dropTarget: bindable<string | null>(() => ({ defaultValue: null })),
      dropPlacement: bindable<DropPlacement | null>(() => ({ defaultValue: null })),
      pointerPosition: bindable<Point | null>(() => ({ defaultValue: null })),
    }
  },

  refs() {
    return {
      liveRegion: null,
      ariaHideCleanup: null,
      pointerOrigin: null,
      announceTimer: null,
      stickyTimer: null,
      dragOverTimer: null,
      activationTimer: null,
      pendingValue: undefined,
      didDrop: false,
      autoScrollMove: null,
      dropTargetSequence: [],
      dropTargetIndex: -1,
    }
  },

  on: {
    "DRAG.CANCEL": {
      target: "idle",
      actions: ["invokeOnDragEnd", "announceCancel", "restoreAriaHidden", "clearDragState"],
    },
  },

  states: {
    idle: {
      on: {
        "DRAG.START": [
          {
            guard: "hasActivationConstraint",
            target: "pointer:pending",
            actions: ["setPendingSource"],
          },
          {
            target: "pointer:dragging",
            actions: ["setDragSource", "invokeOnDragStart", "announcePickup"],
          },
        ],
        "KEYBOARD.GRAB": {
          target: "keyboard:session",
          actions: ["setDragSource", "buildDropSequence", "invokeOnDragStart", "announcePickup"],
        },
      },
    },

    "pointer:pending": {
      effects: ["trackPointerMove", "waitForActivationDelay", "trackEscapeKey"],
      on: {
        "POINTER.MOVE": {
          guard: "isActivationThresholdMet",
          target: "pointer:dragging",
          actions: ["setDragSource", "invokeOnDragStart", "announcePickup"],
        },
        "ACTIVATION.DELAY_MET": {
          target: "pointer:dragging",
          actions: ["setDragSource", "invokeOnDragStart", "announcePickup"],
        },
        "POINTER.UP": {
          target: "idle",
          actions: ["clearDragState"],
        },
      },
    },

    "pointer:dragging": {
      effects: ["trackPointerMove", "setupAutoScroll", "trackEscapeKey"],
      on: {
        "POINTER.MOVE": {
          actions: [
            "updatePointerPosition",
            "updateDropTargetFromPointer",
            "autoScroll",
            "announceDropTargetDebounced",
            "invokeOnDragOverDebounced",
          ],
        },
        "POINTER.UP": [
          {
            guard: "hasValidTarget",
            target: "idle",
            actions: ["commitDrop", "invokeOnDragEnd", "clearDragState"],
          },
          {
            target: "idle",
            actions: ["invokeOnDragEnd", "announceCancel", "clearDragState"],
          },
        ],
      },
    },

    "keyboard:session": {
      effects: ["ariaHideOutside"],
      on: {
        "KEYBOARD.TAB_NEXT": {
          actions: ["cycleNextTarget", "announceDropTarget"],
        },
        "KEYBOARD.TAB_PREV": {
          actions: ["cyclePrevTarget", "announceDropTarget"],
        },
        "KEYBOARD.ARROW_NEXT": {
          actions: ["cycleNextPlacement", "announceDropTarget"],
        },
        "KEYBOARD.ARROW_PREV": {
          actions: ["cyclePrevPlacement", "announceDropTarget"],
        },
        "KEYBOARD.GRID_DOWN": {
          actions: ["cycleGridDown", "announceDropTarget"],
        },
        "KEYBOARD.GRID_UP": {
          actions: ["cycleGridUp", "announceDropTarget"],
        },
        "KEYBOARD.DROP": [
          {
            guard: "hasValidTarget",
            target: "idle",
            actions: ["commitDrop", "invokeOnDragEnd", "restoreAriaHidden", "focusDragSource", "clearDragState"],
          },
          {
            target: "idle",
            actions: ["invokeOnDragEnd", "announceCancel", "restoreAriaHidden", "focusDragSource", "clearDragState"],
          },
        ],
        "KEYBOARD.CANCEL": {
          target: "idle",
          actions: ["invokeOnDragEnd", "announceCancel", "restoreAriaHidden", "clearDragState", "focusDragSource"],
        },
      },
    },
  },

  implementations: {
    guards: {
      hasValidTarget({ context }) {
        return context.get("dropTarget") != null && context.get("dropPlacement") != null
      },
      hasActivationConstraint({ prop }) {
        const constraint = prop("activationConstraint")
        return constraint != null && (constraint.distance != null || constraint.delay != null)
      },
      isActivationThresholdMet({ event, refs, prop }) {
        const constraint = prop("activationConstraint")
        if (!constraint) return true

        const origin = refs.get("pointerOrigin")
        if (!origin) return true

        // Distance threshold
        if (constraint.distance != null) {
          const dist = pointDistance(event.point, origin)
          return dist >= constraint.distance
        }

        return true
      },
    },

    effects: {
      trackEscapeKey({ scope, send }) {
        const doc = scope.getDoc()
        const onKeyDown = (event: KeyboardEvent) => {
          if (event.key === "Escape") {
            event.preventDefault()
            send({ type: "DRAG.CANCEL" })
          }
        }
        doc.addEventListener("keydown", onKeyDown, true)
        return () => doc.removeEventListener("keydown", onKeyDown, true)
      },

      trackPointerMove({ scope, send }) {
        const doc = scope.getDoc()
        return trackPointerMove(doc, {
          onPointerMove({ point }) {
            send({ type: "POINTER.MOVE", point })
          },
          onPointerUp({ point }) {
            send({ type: "POINTER.UP", point })
          },
        })
      },

      waitForActivationDelay({ prop, send }) {
        const constraint = prop("activationConstraint")
        if (!constraint?.delay) return

        const timer = setTimeout(() => {
          send({ type: "ACTIVATION.DELAY_MET" })
        }, constraint.delay)

        return () => clearTimeout(timer)
      },

      setupAutoScroll({ scope, prop, refs }) {
        const scrollThreshold = prop("scrollThreshold")
        if (!scrollThreshold) return

        const rootEl = dom.getRootEl(scope)
        if (!rootEl) return

        const autoScroll = createAutoScroll(rootEl, { threshold: scrollThreshold })
        if (!autoScroll) return

        refs.set("autoScrollMove", autoScroll.move)

        return () => {
          autoScroll.stop()
          refs.set("autoScrollMove", null)
        }
      },

      ariaHideOutside({ scope, context, refs }) {
        const dragSourceValue = context.get("dragSource")
        if (!dragSourceValue) return

        const sourceEl = dom.getDraggableEl(scope, dragSourceValue)
        const targetEls = dom.getDropTargetEls(scope)
        const elements = [sourceEl, ...targetEls].filter(Boolean) as HTMLElement[]

        if (elements.length === 0) return

        const cleanup = ariaHidden(elements, { defer: true })
        refs.set("ariaHideCleanup", cleanup)

        return () => {
          cleanup()
          refs.set("ariaHideCleanup", null)
        }
      },
    },

    actions: {
      setPendingSource({ event, refs }) {
        refs.set("pointerOrigin", event.point ?? null)
        // Store the pending value on pointerOrigin; dragSource stays null until activated
        refs.set("pendingValue", event.value)

        if (!refs.get("liveRegion")) {
          refs.set("liveRegion", createLiveRegion({ level: "assertive" }))
        }
      },

      setDragSource(params) {
        const { context, event, refs } = params
        // Use event.value if available (direct start), or pendingValue (from pending state)
        const value = event.value ?? refs.get("pendingValue")
        context.set("dragSource", value)
        refs.set("pointerOrigin", event.point ?? refs.get("pointerOrigin"))
        refs.set("pendingValue", undefined)

        if (!refs.get("liveRegion")) {
          refs.set("liveRegion", createLiveRegion({ level: "assertive" }))
        }
      },

      clearDragState({ context, refs }) {
        context.set("dragSource", null)
        context.set("dropTarget", null)
        context.set("dropPlacement", null)
        context.set("pointerPosition", null)
        refs.set("pointerOrigin", null)
        refs.set("pendingValue", undefined)
        refs.set("dropTargetSequence", [])
        refs.set("dropTargetIndex", -1)

        const stickyTimer = refs.get("stickyTimer")
        if (stickyTimer) clearTimeout(stickyTimer)

        const announceTimer = refs.get("announceTimer")
        if (announceTimer) clearTimeout(announceTimer)

        const dragOverTimer = refs.get("dragOverTimer")
        if (dragOverTimer) clearTimeout(dragOverTimer)

        const activationTimer = refs.get("activationTimer")
        if (activationTimer) clearTimeout(activationTimer)
      },

      updatePointerPosition({ context, event }) {
        if (event.point) {
          context.set("pointerPosition", event.point)
        }
      },

      autoScroll({ event, refs }) {
        const move = refs.get("autoScrollMove")
        if (move && event.point) {
          move(event.point.x, event.point.y)
        }
      },

      updateDropTargetFromPointer({ context, event, scope, prop, refs }) {
        const collisionFn = prop("collisionStrategy") ?? closestEdge
        const source = context.get("dragSource")!

        // Filter out all dragged items from collision candidates
        const selectedValues = prop("selectedValues")
        const dragValues = selectedValues?.includes(source) ? new Set(selectedValues) : new Set([source])
        const entries = dom.getDropEntries(scope).filter((e) => !dragValues.has(e.value))
        const allowDropOn = prop("dropPlacements").includes("on")

        // For grids, collision uses horizontal reading order for placement
        const isGrid = prop("columnCount") != null
        const collisionOrientation = isGrid ? ("horizontal" as const) : prop("orientation")

        const result = collisionFn(event.point, entries, {
          edgeThreshold: prop("edgeThreshold"),
          allowDropOn,
          orientation: collisionOrientation,
        })

        if (result) {
          const canDrop = prop("canDrop")
          if (canDrop && !canDrop(source, result.value, result.placement)) return

          const stickyTimer = refs.get("stickyTimer")
          if (stickyTimer) {
            clearTimeout(stickyTimer)
            refs.set("stickyTimer", null)
          }

          // Avoid visual jitter at item boundaries.
          // "item[N-1]/after" and "item[N]/before" are the same insertion point.
          // If we're already showing one, don't flip to the other.
          const prevTarget = context.get("dropTarget")
          const prevPlacement = context.get("dropPlacement")

          if (prevTarget && prevPlacement && result.value !== prevTarget && result.placement !== "on") {
            const prevIdx = entries.findIndex((e) => e.value === prevTarget)
            const nextIdx = entries.findIndex((e) => e.value === result.value)
            const isAdjacentFlip =
              (prevPlacement === "after" && result.placement === "before" && nextIdx === prevIdx + 1) ||
              (prevPlacement === "before" && result.placement === "after" && nextIdx === prevIdx - 1)
            if (isAdjacentFlip) return
          }

          context.set("dropTarget", result.value)
          context.set("dropPlacement", result.placement)
        } else {
          // No collision — start sticky timeout if we had a target
          const currentTarget = context.get("dropTarget")
          if (currentTarget && !refs.get("stickyTimer")) {
            const timer = setTimeout(() => {
              context.set("dropTarget", null)
              context.set("dropPlacement", null)
              refs.set("stickyTimer", null)
            }, prop("stickyDelay"))
            refs.set("stickyTimer", timer)
          }
        }
      },

      buildDropSequence({ scope, refs, event, prop }) {
        const source = event.value as string
        const selectedValues = prop("selectedValues")
        const dragValues = selectedValues?.includes(source) ? new Set(selectedValues) : new Set([source])
        const canDrop = prop("canDrop")
        const els = dom.getDropTargetEls(scope)
        const values: string[] = []
        for (const el of els) {
          const value = el.dataset.value
          if (!value || el.dataset.disabled) continue
          if (dragValues.has(value)) continue
          if (canDrop && !isAnyPlacementAllowed(source, value, prop("dropPlacements"), canDrop)) continue
          values.push(value)
        }
        refs.set("dropTargetSequence", values)
        refs.set("dropTargetIndex", -1)
      },

      cycleNextTarget({ context, refs, prop, scope }) {
        const seq = refs.get("dropTargetSequence")
        if (seq.length === 0) return

        const source = context.get("dragSource")!
        const idx = nextIndex(seq, refs.get("dropTargetIndex"))
        refs.set("dropTargetIndex", idx)
        context.set("dropTarget", seq[idx])
        context.set(
          "dropPlacement",
          getFirstAllowedPlacement(source, seq[idx], prop("dropPlacements"), prop("canDrop")),
        )
        dom.focusDropTarget(scope, seq[idx])
      },

      cyclePrevTarget({ context, refs, prop, scope }) {
        const seq = refs.get("dropTargetSequence")
        if (seq.length === 0) return

        const source = context.get("dragSource")!
        const idx = prevIndex(seq, refs.get("dropTargetIndex"))
        refs.set("dropTargetIndex", idx)
        context.set("dropTarget", seq[idx])
        context.set(
          "dropPlacement",
          getFirstAllowedPlacement(source, seq[idx], prop("dropPlacements"), prop("canDrop")),
        )
        dom.focusDropTarget(scope, seq[idx])
      },

      cycleGridDown({ context, refs, prop, scope }) {
        const seq = refs.get("dropTargetSequence")
        if (seq.length === 0) return

        const source = context.get("dragSource")!
        const step = prop("columnCount") ?? 1
        const idx = nextIndex(seq, refs.get("dropTargetIndex"), { step, loop: false })
        refs.set("dropTargetIndex", idx)
        context.set("dropTarget", seq[idx])
        context.set(
          "dropPlacement",
          getFirstAllowedPlacement(source, seq[idx], prop("dropPlacements"), prop("canDrop")),
        )
        dom.focusDropTarget(scope, seq[idx])
      },

      cycleGridUp({ context, refs, prop, scope }) {
        const seq = refs.get("dropTargetSequence")
        if (seq.length === 0) return

        const source = context.get("dragSource")!
        const step = prop("columnCount") ?? 1
        const idx = prevIndex(seq, refs.get("dropTargetIndex"), { step, loop: false })
        refs.set("dropTargetIndex", idx)
        context.set("dropTarget", seq[idx])
        context.set(
          "dropPlacement",
          getFirstAllowedPlacement(source, seq[idx], prop("dropPlacements"), prop("canDrop")),
        )
        dom.focusDropTarget(scope, seq[idx])
      },

      cycleNextPlacement({ context, prop }) {
        const placements = prop("dropPlacements")
        const current = context.get("dropPlacement")
        if (!current || placements.length <= 1) return

        const canDrop = prop("canDrop")
        const source = context.get("dragSource")
        const target = context.get("dropTarget")
        let idx = placements.indexOf(current)

        for (let i = 0; i < placements.length; i++) {
          idx = (idx + 1) % placements.length
          const candidate = placements[idx]
          if (!canDrop || !source || !target || canDrop(source, target, candidate)) {
            context.set("dropPlacement", candidate)
            return
          }
        }
      },

      cyclePrevPlacement({ context, prop }) {
        const placements = prop("dropPlacements")
        const current = context.get("dropPlacement")
        if (!current || placements.length <= 1) return

        const canDrop = prop("canDrop")
        const source = context.get("dragSource")
        const target = context.get("dropTarget")
        let idx = placements.indexOf(current)

        for (let i = 0; i < placements.length; i++) {
          idx = (idx - 1 + placements.length) % placements.length
          const candidate = placements[idx]
          if (!canDrop || !source || !target || canDrop(source, target, candidate)) {
            context.set("dropPlacement", candidate)
            return
          }
        }
      },

      commitDrop(params) {
        const { context, prop, refs } = params
        const source = context.get("dragSource")!
        const target = context.get("dropTarget")!
        const placement = context.get("dropPlacement")!
        const values = getDragValues(params)

        prop("onDrop")?.({ source, values, target, placement })
        refs.set("didDrop", true)

        const t = getTranslations(params)
        const sourceLabel = getLabel(params, source)
        const targetLabel = getLabel(params, target)
        refs.get("liveRegion")?.announce(t.drop(sourceLabel, targetLabel, placement))
      },

      invokeOnDragStart(params) {
        const { context, prop } = params
        prop("onDragStart")?.({ source: context.get("dragSource")!, values: getDragValues(params) })
      },

      invokeOnDragOverDebounced(params) {
        const { context, prop, refs } = params
        const dragOverTimer = refs.get("dragOverTimer")
        if (dragOverTimer) clearTimeout(dragOverTimer)

        const timer = setTimeout(() => {
          const target = context.get("dropTarget")
          const placement = context.get("dropPlacement")
          if (!target || !placement) return
          prop("onDragOver")?.({
            source: context.get("dragSource")!,
            values: getDragValues(params),
            target,
            placement,
          })
          refs.set("dragOverTimer", null)
        }, prop("dragOverDelay"))
        refs.set("dragOverTimer", timer)
      },

      invokeOnDragEnd(params) {
        const { context, prop, refs } = params
        const source = context.get("dragSource")
        if (!source) return
        const didDrop = !!refs.get("didDrop")
        prop("onDragEnd")?.({
          source,
          values: getDragValues(params),
          target: didDrop ? context.get("dropTarget") : null,
          placement: didDrop ? context.get("dropPlacement") : null,
          dropped: didDrop,
        })
        refs.set("didDrop", false)
      },

      announcePickup(params) {
        const { context, refs } = params
        const source = context.get("dragSource")
        if (!source) return

        const t = getTranslations(params)
        const values = getDragValues(params)
        const label = values.length > 1 ? `${values.length} items` : getLabel(params, source)
        refs.get("liveRegion")?.announce(t.pickup(label))
      },

      announceDropTarget(params) {
        const { context, refs } = params
        const target = context.get("dropTarget")
        const placement = context.get("dropPlacement")
        const source = context.get("dragSource")
        if (!target || !placement || !source) return

        const t = getTranslations(params)
        const sourceLabel = getLabel(params, source)
        const targetLabel = getLabel(params, target)
        refs.get("liveRegion")?.announce(t.dragOver(sourceLabel, targetLabel, placement))
      },

      announceDropTargetDebounced(params) {
        const { context, refs, prop } = params
        const announceTimer = refs.get("announceTimer")
        if (announceTimer) clearTimeout(announceTimer)

        const timer = setTimeout(() => {
          const target = context.get("dropTarget")
          const placement = context.get("dropPlacement")
          const source = context.get("dragSource")
          if (!target || !placement || !source) return

          const t = getTranslations(params)
          const sourceLabel = getLabel(params, source)
          const targetLabel = getLabel(params, target)
          refs.get("liveRegion")?.announce(t.dragOver(sourceLabel, targetLabel, placement))
        }, prop("dragOverDelay"))
        refs.set("announceTimer", timer)
      },

      announceCancel(params) {
        const { context, refs } = params
        const source = context.get("dragSource")
        if (!source) return

        const t = getTranslations(params)
        const label = getLabel(params, source)
        refs.get("liveRegion")?.announce(t.cancel(label))
      },

      restoreAriaHidden({ refs }) {
        const cleanup = refs.get("ariaHideCleanup")
        cleanup?.()
        refs.set("ariaHideCleanup", null)
      },

      focusDragSource({ context, scope }) {
        const source = context.get("dragSource")
        if (!source) return
        raf(() => {
          dom.focusDraggable(scope, source)
        })
      },
    },
  },
})
