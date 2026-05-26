import { createGuards, createMachine } from "@zag-js/core"
import { addDomEvent, isHTMLElement, raf, resizeObserverBorderBox, trackPointerMove } from "@zag-js/dom-query"
import {
  addPoints,
  clampPoint,
  clampSize,
  constrainRect,
  createRect,
  getElementRect,
  isPointEqual,
  isSizeEqual,
  resizeRect,
  subtractPoints,
  type Point,
  type Size,
} from "@zag-js/rect-utils"
import { subscribe } from "@zag-js/store"
import { clampValue, ensureProps, invariant, match, pick } from "@zag-js/utils"
import * as dom from "./floating-panel.dom"
import { panelStack } from "./floating-panel.store"
import type { FloatingPanelSchema, IntlTranslations, Stage } from "./floating-panel.types"

const { not, and } = createGuards<FloatingPanelSchema>()

const defaultTranslations: IntlTranslations = {
  minimize: "Minimize window",
  maximize: "Maximize window",
  restore: "Restore window",
}

const FALLBACK_SIZE = Object.freeze({ width: 320, height: 240 })
const FALLBACK_POSITION = Object.freeze({ x: 300, y: 100 })

export const machine = createMachine<FloatingPanelSchema>({
  props({ props }) {
    ensureProps(props, ["id"], "floating-panel")
    return {
      strategy: "fixed",
      gridSize: 1,
      allowOverflow: true,
      resizable: true,
      draggable: true,
      ...props,
      translations: {
        ...defaultTranslations,
        ...props.translations,
      },
    }
  },

  initialState({ prop }) {
    const open = prop("open") ?? prop("defaultOpen")
    return open ? "open" : "closed"
  },

  context({ prop, bindable }) {
    return {
      size: bindable<Size>(() => ({
        defaultValue: prop("defaultSize") ?? FALLBACK_SIZE,
        value: prop("size"),
        isEqual: isSizeEqual,
        hash(v) {
          return `W:${v.width} H:${v.height}`
        },
        onChange(value) {
          prop("onSizeChange")?.({ size: value })
        },
      })),
      position: bindable<Point>(() => ({
        defaultValue: prop("defaultPosition") ?? FALLBACK_POSITION,
        value: prop("position"),
        isEqual: isPointEqual,
        hash(v) {
          return `X:${v.x} Y:${v.y}`
        },
        onChange(value) {
          prop("onPositionChange")?.({ position: value })
        },
      })),
      stage: bindable<Stage>(() => ({
        defaultValue: "default",
        onChange(value) {
          prop("onStageChange")?.({ stage: value })
        },
      })),
      lastEventPosition: bindable<Point | null>(() => ({
        defaultValue: null,
      })),
      prevPosition: bindable<Point | null>(() => ({
        defaultValue: null,
      })),
      prevSize: bindable<Size | null>(() => ({
        defaultValue: null,
      })),
      isTopmost: bindable<boolean | undefined>(() => ({
        defaultValue: undefined,
      })),
    }
  },

  computed: {
    isMaximized: ({ context }) => context.get("stage") === "maximized",
    isMinimized: ({ context }) => context.get("stage") === "minimized",
    isStaged: ({ context }) => context.get("stage") !== "default",
    hasSpecifiedPosition: ({ prop }) => prop("defaultPosition") != null || prop("position") != null,
    canResize: ({ context, prop }) => prop("resizable") && !prop("disabled") && context.get("stage") === "default",
    canDrag: ({ prop, computed }) => prop("draggable") && !prop("disabled") && !computed("isMaximized"),
  },

  watch({ track, context, action, prop }) {
    track([() => context.hash("position")], () => {
      action(["setPositionStyle"])
    })

    track([() => context.hash("size")], () => {
      action(["setSizeStyle"])
    })

    track([() => prop("open")], () => {
      action(["toggleVisibility"])
    })
  },

  effects: ["trackPanelStack"],

  on: {
    CONTENT_FOCUS: {
      actions: ["bringToFrontOfPanelStack"],
    },
    SET_POSITION: {
      actions: ["setPosition"],
    },
    SET_SIZE: {
      actions: ["setSize"],
    },
  },

  states: {
    closed: {
      tags: ["closed"],
      on: {
        "CONTROLLED.OPEN": {
          target: "open",
          actions: ["setAnchorPosition", "setPositionStyle", "setSizeStyle", "setInitialFocus"],
        },
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen", "setAnchorPosition", "setPositionStyle", "setSizeStyle", "setInitialFocus"],
          },
        ],
      },
    },

    open: {
      tags: ["open"],
      entry: ["bringToFrontOfPanelStack"],
      initial: "idle",
      on: {
        "CONTROLLED.CLOSE": {
          target: "closed",
          actions: ["resetRect", "setFinalFocus"],
        },
        CLOSE: [
          {
            guard: "isOpenControlled",
            target: "closed",
            actions: ["invokeOnClose", "setFinalFocus"],
          },
          {
            target: "closed",
            actions: ["invokeOnClose", "resetRect", "setFinalFocus"],
          },
        ],
      },
      states: {
        idle: {
          effects: ["trackBoundaryRect"],
          on: {
            DRAG_START: {
              guard: not("isMaximized"),
              target: "dragging",
              actions: ["setPrevPosition"],
            },
            RESIZE_START: {
              guard: not("isMinimized"),
              target: "resizing",
              actions: ["setPrevSize"],
            },
            ESCAPE: [
              {
                guard: and("isOpenControlled", "closeOnEsc"),
                actions: ["invokeOnClose"],
              },
              {
                guard: "closeOnEsc",
                target: "closed",
                actions: ["invokeOnClose", "resetRect", "setFinalFocus"],
              },
            ],
            MINIMIZE: {
              actions: ["setMinimized"],
            },
            MAXIMIZE: {
              actions: ["setMaximized"],
            },
            RESTORE: {
              actions: ["setRestored"],
            },
            MOVE: {
              actions: ["setPositionFromKeyboard"],
            },
          },
        },
        dragging: {
          effects: ["trackPointerMove"],
          on: {
            DRAG: {
              actions: ["setPositionFromDrag"],
            },
            DRAG_END: {
              target: "idle",
              actions: ["invokeOnDragEnd", "clearPrevPosition"],
            },
            ESCAPE: {
              target: "idle",
              actions: ["restorePosition", "clearPrevPosition"],
            },
          },
        },
        resizing: {
          effects: ["trackPointerMove"],
          on: {
            DRAG: {
              actions: ["setSizeFromDrag"],
            },
            DRAG_END: {
              target: "idle",
              actions: ["invokeOnResizeEnd", "clearPrevSize"],
            },
            ESCAPE: {
              target: "idle",
              actions: ["restoreSize", "clearPrevSize"],
            },
          },
        },
      },
    },
  },

  implementations: {
    guards: {
      closeOnEsc: ({ prop }) => !!prop("closeOnEscape"),
      isMaximized: ({ context }) => context.get("stage") === "maximized",
      isMinimized: ({ context }) => context.get("stage") === "minimized",
      isOpenControlled: ({ prop }) => prop("open") != undefined,
    },

    effects: {
      trackPointerMove({ scope, send, event: evt, prop }) {
        const doc = scope.getDoc()
        const boundaryEl = prop("getBoundaryEl")?.()
        const boundaryRect = dom.getBoundaryRect(scope, boundaryEl, false)
        return trackPointerMove(doc, {
          onPointerMove({ point, event }) {
            const { altKey, shiftKey } = event
            let x = clampValue(point.x, boundaryRect.x, boundaryRect.x + boundaryRect.width)
            let y = clampValue(point.y, boundaryRect.y, boundaryRect.y + boundaryRect.height)
            send({ type: "DRAG", position: { x, y }, axis: evt.axis, altKey, shiftKey })
          },
          onPointerUp() {
            send({ type: "DRAG_END" })
          },
        })
      },

      trackBoundaryRect({ context, scope, prop, computed }) {
        const win = scope.getWin()

        // ResizeObserver fires immediately on init, so we need to skip the first call
        let skip = true

        const exec = () => {
          if (skip) {
            skip = false
            return
          }

          const boundaryEl = prop("getBoundaryEl")?.()
          let boundaryRect = dom.getBoundaryRect(scope, boundaryEl, false)

          if (!computed("isMaximized")) {
            const rect = { ...context.get("position"), ...context.get("size") }
            boundaryRect = constrainRect(rect, boundaryRect)
          }

          context.set("size", pick(boundaryRect, ["width", "height"]))
          context.set("position", pick(boundaryRect, ["x", "y"]))
        }

        const boundaryEl = prop("getBoundaryEl")?.()

        if (isHTMLElement(boundaryEl)) {
          return resizeObserverBorderBox.observe(boundaryEl, exec)
        }

        return addDomEvent(win, "resize", exec)
      },

      trackPanelStack({ context, scope }) {
        const unsub = subscribe(panelStack, () => {
          context.set("isTopmost", panelStack.isTopmost(scope.id!))
          const contentEl = dom.getContentEl(scope)
          if (!contentEl) return

          const index = panelStack.indexOf(scope.id!)
          if (index === -1) return

          contentEl.style.setProperty("--z-index", `${index + 1}`)
        })

        return () => {
          panelStack.remove(scope.id!)
          unsub()
        }
      },
    },

    actions: {
      setPosition({ context, event, prop, scope }) {
        const boundaryEl = prop("getBoundaryEl")?.()
        const boundaryRect = dom.getBoundaryRect(scope, boundaryEl, prop("allowOverflow"))
        const position = clampPoint(event.position, context.get("size"), boundaryRect)
        context.set("position", position)
      },

      setSize({ context, event, scope, prop }) {
        const boundaryEl = prop("getBoundaryEl")?.()
        const boundaryRect = dom.getBoundaryRect(scope, boundaryEl, false)

        let nextSize = event.size
        nextSize = clampSize(nextSize, prop("minSize"), prop("maxSize"))
        nextSize = clampSize(nextSize, prop("minSize"), boundaryRect)

        const nextPosition = clampPoint(context.get("position"), nextSize, boundaryRect)

        context.set("size", nextSize)
        context.set("position", nextPosition)
      },

      setAnchorPosition({ context, computed, prop, scope }) {
        // If no anchor position specified, center in boundary
        if (computed("hasSpecifiedPosition")) return

        // if we persisted the rect, we don't need to set the anchor position
        const hasPrevRect = context.get("prevPosition") || context.get("prevSize")
        if (prop("persistRect") && hasPrevRect) return

        const triggerRect = dom.getTriggerEl(scope)
        const boundaryRect = dom.getBoundaryRect(scope, prop("getBoundaryEl")?.(), false)

        let anchorPosition = prop("getAnchorPosition")?.({
          triggerRect: triggerRect ? DOMRect.fromRect(getElementRect(triggerRect)) : null,
          boundaryRect: DOMRect.fromRect(boundaryRect),
        })

        // If no anchor position specified, center in boundary
        if (!anchorPosition) {
          const size = context.get("size")
          anchorPosition = {
            x: boundaryRect.x + (boundaryRect.width - size.width) / 2,
            y: boundaryRect.y + (boundaryRect.height - size.height) / 2,
          }
        }

        if (!anchorPosition) return
        context.set("position", anchorPosition)
      },

      setPrevPosition({ context, event }) {
        context.set("prevPosition", { ...context.get("position") })
        context.set("lastEventPosition", event.position)
      },

      clearPrevPosition({ context, prop }) {
        if (!prop("persistRect")) context.set("prevPosition", null)
        context.set("lastEventPosition", null)
      },

      restorePosition({ context }) {
        const prevPosition = context.get("prevPosition")
        if (prevPosition) context.set("position", prevPosition)
      },

      setPositionFromDrag({ context, event, prop, scope }) {
        let diff = subtractPoints(event.position, context.get("lastEventPosition"))

        diff.x = Math.round(diff.x / prop("gridSize")) * prop("gridSize")
        diff.y = Math.round(diff.y / prop("gridSize")) * prop("gridSize")

        const prevPosition = context.get("prevPosition")
        if (!prevPosition) return

        let position = addPoints(prevPosition, diff)
        const boundaryEl = prop("getBoundaryEl")?.()
        const boundaryRect = dom.getBoundaryRect(scope, boundaryEl, prop("allowOverflow"))
        position = clampPoint(position, context.get("size"), boundaryRect)

        context.set("position", position)
      },

      setPositionStyle({ scope, context }) {
        const el = dom.getPositionerEl(scope)
        const position = context.get("position")
        el?.style.setProperty("--x", `${position.x}px`)
        el?.style.setProperty("--y", `${position.y}px`)
      },

      resetRect({ context, prop }) {
        context.set("stage", "default")
        if (!prop("persistRect")) {
          context.set("position", context.initial("position"))
          context.set("size", context.initial("size"))
        }
      },

      setPrevSize({ context, event }) {
        context.set("prevSize", { ...context.get("size") })
        context.set("prevPosition", { ...context.get("position") })
        context.set("lastEventPosition", event.position)
      },

      clearPrevSize({ context }) {
        context.set("prevSize", null)
        context.set("prevPosition", null)
        context.set("lastEventPosition", null)
      },

      restoreSize({ context }) {
        const prevSize = context.get("prevSize")
        if (prevSize) context.set("size", prevSize)
        const prevPosition = context.get("prevPosition")
        if (prevPosition) context.set("position", prevPosition)
      },

      setSizeFromDrag({ context, event, scope, prop }) {
        const prevSize = context.get("prevSize")
        const prevPosition = context.get("prevPosition")
        const lastEventPosition = context.get("lastEventPosition")

        if (!prevSize || !prevPosition || !lastEventPosition) return

        const prevRect = createRect({ ...prevPosition, ...prevSize })
        const offset = subtractPoints(event.position, lastEventPosition)

        const nextRect = resizeRect(prevRect, offset, event.axis, {
          scalingOriginMode: event.altKey ? "center" : "extent",
          lockAspectRatio: !!prop("lockAspectRatio") || event.shiftKey,
        })

        let nextSize = pick(nextRect, ["width", "height"])
        let nextPosition = pick(nextRect, ["x", "y"])

        const boundaryEl = prop("getBoundaryEl")?.()
        const boundaryRect = dom.getBoundaryRect(scope, boundaryEl, false)

        nextSize = clampSize(nextSize, prop("minSize"), prop("maxSize"))
        nextSize = clampSize(nextSize, prop("minSize"), boundaryRect)
        context.set("size", nextSize)

        if (nextPosition) {
          const point = clampPoint(nextPosition, nextSize, boundaryRect)
          context.set("position", point)
        }
      },

      setSizeStyle({ scope, context }) {
        queueMicrotask(() => {
          const el = dom.getPositionerEl(scope)
          const size = context.get("size")
          el?.style.setProperty("--width", `${size.width}px`)
          el?.style.setProperty("--height", `${size.height}px`)
        })
      },

      setMaximized({ context, prop, scope }) {
        if (context.get("stage") === "maximized") return

        const wasDefault = context.get("stage") === "default"
        const currentSize = context.get("size")
        const currentPosition = context.get("position")

        const boundaryEl = prop("getBoundaryEl")?.()
        const boundaryRect = dom.getBoundaryRect(scope, boundaryEl, false)
        const nextPosition = pick(boundaryRect, ["x", "y"])
        const nextSize = pick(boundaryRect, ["height", "width"])

        // set max stage
        context.set("stage", "maximized")

        // save previous only when entering staged mode from default
        if (wasDefault) {
          context.set("prevSize", currentSize)
          context.set("prevPosition", currentPosition)
        }

        // update size and position
        context.set("position", nextPosition)
        context.set("size", nextSize)
      },

      setMinimized({ context, scope }) {
        if (context.get("stage") === "minimized") return

        const wasDefault = context.get("stage") === "default"
        const currentSize = context.get("size")
        const currentPosition = context.get("position")

        // set min stage
        context.set("stage", "minimized")

        // save previous only when entering staged mode from default
        if (wasDefault) {
          context.set("prevSize", currentSize)
          context.set("prevPosition", currentPosition)
        }

        // update size
        const headerEl = dom.getHeaderEl(scope)
        if (!headerEl) return
        const size = {
          ...currentSize,
          height: headerEl?.offsetHeight,
        }
        context.set("size", size)
      },

      setRestored({ context, prop, scope }) {
        const boundaryRect = dom.getBoundaryRect(scope, prop("getBoundaryEl")?.(), false)

        // remove stage
        context.set("stage", "default")

        let restoredSize = context.get("size")
        const prevSize = context.get("prevSize")
        if (prevSize) {
          restoredSize = clampSize(prevSize, prop("minSize"), prop("maxSize"))
          restoredSize = clampSize(restoredSize, prop("minSize"), boundaryRect)
        }

        let restoredPosition = context.get("position")
        const prevPosition = context.get("prevPosition")
        if (prevPosition) {
          restoredPosition = clampPoint(prevPosition, restoredSize, boundaryRect)
        }

        context.set("size", restoredSize)
        context.set("position", restoredPosition)
        context.set("prevSize", null)
        context.set("prevPosition", null)
      },

      setPositionFromKeyboard({ context, event, prop, scope }) {
        invariant(event.step == null, "step is required")

        const position = context.get("position")
        const step = event.step

        let nextPosition = match(event.direction, {
          left: { x: position.x - step, y: position.y },
          right: { x: position.x + step, y: position.y },
          up: { x: position.x, y: position.y - step },
          down: { x: position.x, y: position.y + step },
        })

        const boundaryEl = prop("getBoundaryEl")?.()
        const boundaryRect = dom.getBoundaryRect(scope, boundaryEl, false)
        nextPosition = clampPoint(nextPosition, context.get("size"), boundaryRect)
        context.set("position", nextPosition)
      },

      bringToFrontOfPanelStack({ prop }) {
        panelStack.bringToFront(prop("id"))
      },
      invokeOnOpen({ prop }) {
        prop("onOpenChange")?.({ open: true })
      },
      invokeOnClose({ prop }) {
        prop("onOpenChange")?.({ open: false })
      },
      invokeOnDragEnd({ context, prop }) {
        prop("onPositionChangeEnd")?.({ position: context.get("position") })
      },
      invokeOnResizeEnd({ context, prop }) {
        prop("onSizeChangeEnd")?.({ size: context.get("size") })
      },

      setFinalFocus({ scope, prop }) {
        if (prop("restoreFocus") === false) return
        raf(() => {
          const element = prop("finalFocusEl")?.() ?? dom.getTriggerEl(scope)
          element?.focus({ preventScroll: true })
        })
      },

      setInitialFocus({ scope, prop }) {
        raf(() => {
          const element = prop("initialFocusEl")?.() ?? dom.getContentEl(scope)
          element?.focus({ preventScroll: true })
        })
      },

      toggleVisibility({ send, prop, event }) {
        send({ type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: event })
      },
    },
  },
})
