import { createGuards, createMachine } from "@zag-js/core"
import { addDomEvent, isHTMLElement, raf, trackPointerMove } from "@zag-js/dom-query"
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

export const machine = createMachine<FloatingPanelSchema>({
  props({ props }) {
    ensureProps(props, ["id"], "floating-panel")
    return {
      strategy: "fixed",
      gridSize: 1,
      defaultSize: { width: 320, height: 240 },
      defaultPosition: { x: 300, y: 100 },
      allowOverflow: true,
      resizable: true,
      draggable: true,
      ...props,
      hasSpecifiedPosition: !!props.defaultPosition || !!props.position,
      translations: {
        ...defaultTranslations,
        ...props.translations,
      },
    }
  },

  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen")
    return open ? "open" : "closed"
  },

  context({ prop, bindable }) {
    return {
      size: bindable<Size>(() => ({
        defaultValue: prop("defaultSize"),
        value: prop("size"),
        isEqual: isSizeEqual,
        sync: true,
        hash(v) {
          return `W:${v.width} H:${v.height}`
        },
        onChange(value) {
          prop("onSizeChange")?.({ size: value })
        },
      })),
      position: bindable<Point>(() => ({
        defaultValue: prop("defaultPosition"),
        value: prop("position"),
        isEqual: isPointEqual,
        sync: true,
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
    canResize: ({ context, prop }) => (prop("resizable") || !prop("disabled")) && context.get("stage") === "default",
    canDrag: ({ prop, computed }) => (prop("draggable") || !prop("disabled")) && !computed("isMaximized"),
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
          actions: ["setAnchorPosition", "setPositionStyle", "setSizeStyle", "focusContentEl"],
        },
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen", "setAnchorPosition", "setPositionStyle", "setSizeStyle", "focusContentEl"],
          },
        ],
      },
    },

    open: {
      tags: ["open"],
      entry: ["bringToFrontOfPanelStack"],
      effects: ["trackBoundaryRect"],
      on: {
        DRAG_START: {
          guard: not("isMaximized"),
          target: "open.dragging",
          actions: ["setPrevPosition"],
        },
        RESIZE_START: {
          guard: not("isMinimized"),
          target: "open.resizing",
          actions: ["setPrevSize"],
        },
        "CONTROLLED.CLOSE": {
          target: "closed",
          actions: ["resetRect", "focusTriggerEl"],
        },
        CLOSE: [
          {
            guard: "isOpenControlled",
            target: "closed",
            actions: ["invokeOnClose"],
          },
          {
            target: "closed",
            actions: ["invokeOnClose", "resetRect", "focusTriggerEl"],
          },
        ],
        ESCAPE: [
          {
            guard: and("isOpenControlled", "closeOnEsc"),
            actions: ["invokeOnClose"],
          },
          {
            guard: "closeOnEsc",
            target: "closed",
            actions: ["invokeOnClose", "resetRect", "focusTriggerEl"],
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

    "open.dragging": {
      tags: ["open"],
      effects: ["trackPointerMove"],
      exit: ["clearPrevPosition"],
      on: {
        DRAG: {
          actions: ["setPosition"],
        },
        DRAG_END: {
          target: "open",
          actions: ["invokeOnDragEnd"],
        },
        "CONTROLLED.CLOSE": {
          target: "closed",
          actions: ["resetRect"],
        },
        CLOSE: [
          {
            guard: "isOpenControlled",
            target: "closed",
            actions: ["invokeOnClose"],
          },
          {
            target: "closed",
            actions: ["invokeOnClose", "resetRect"],
          },
        ],
        ESCAPE: {
          target: "open",
        },
      },
    },

    "open.resizing": {
      tags: ["open"],
      effects: ["trackPointerMove"],
      exit: ["clearPrevSize"],
      on: {
        DRAG: {
          actions: ["setSize"],
        },
        DRAG_END: {
          target: "open",
          actions: ["invokeOnResizeEnd"],
        },
        "CONTROLLED.CLOSE": {
          target: "closed",
          actions: ["resetRect"],
        },
        CLOSE: [
          {
            guard: "isOpenControlled",
            target: "closed",
            actions: ["invokeOnClose"],
          },
          {
            target: "closed",
            actions: ["invokeOnClose", "resetRect"],
          },
        ],
        ESCAPE: {
          target: "open",
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
          const obs = new win.ResizeObserver(exec)
          obs.observe(boundaryEl)
          return () => obs.disconnect()
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
      setAnchorPosition({ context, prop, scope }) {
        // If no anchor position specified, center in boundary
        if (prop("hasSpecifiedPosition")) return

        // if we persisted the rect, we don't need to set the anchor position
        const hasPrevRect = context.get("prevPosition") || context.get("prevSize")
        if (prop("persistRect") && hasPrevRect) return

        raf(() => {
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
        })
      },

      setPrevPosition({ context, event }) {
        context.set("prevPosition", { ...context.get("position") })
        context.set("lastEventPosition", event.position)
      },

      clearPrevPosition({ context, prop }) {
        if (!prop("persistRect")) context.set("prevPosition", null)
        context.set("lastEventPosition", null)
      },

      setPosition({ context, event, prop, scope }) {
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

      setSize({ context, event, scope, prop }) {
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
        // set max stage
        context.set("stage", "maximized")

        // save previous
        context.set("prevSize", context.get("size"))
        context.set("prevPosition", context.get("position"))

        // update size and position
        const boundaryEl = prop("getBoundaryEl")?.()
        const boundaryRect = dom.getBoundaryRect(scope, boundaryEl, false)

        context.set("position", pick(boundaryRect, ["x", "y"]))
        context.set("size", pick(boundaryRect, ["height", "width"]))
      },

      setMinimized({ context, scope }) {
        // set min stage
        context.set("stage", "minimized")

        // save previous
        context.set("prevSize", context.get("size"))
        context.set("prevPosition", context.get("position"))

        // update size
        const headerEl = dom.getHeaderEl(scope)
        if (!headerEl) return
        const size = {
          ...context.get("size"),
          height: headerEl?.offsetHeight,
        }
        context.set("size", size)
      },

      setRestored({ context, prop, scope }) {
        const boundaryRect = dom.getBoundaryRect(scope, prop("getBoundaryEl")?.(), false)

        // remove stage
        context.set("stage", "default")

        // restore size
        const prevSize = context.get("prevSize")
        if (prevSize) {
          let nextSize = prevSize
          nextSize = clampSize(nextSize, prop("minSize"), prop("maxSize"))
          nextSize = clampSize(nextSize, prop("minSize"), boundaryRect)

          context.set("size", nextSize)
          context.set("prevSize", null)
        }

        // restore position
        if (context.get("prevPosition")) {
          let nextPosition = context.get("prevPosition")
          nextPosition = clampPoint(nextPosition!, context.get("size"), boundaryRect)

          context.set("position", nextPosition)
          context.set("prevPosition", null)
        }
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

      focusTriggerEl({ scope }) {
        raf(() => {
          dom.getTriggerEl(scope)?.focus()
        })
      },

      focusContentEl({ scope }) {
        raf(() => {
          dom.getContentEl(scope)?.focus()
        })
      },

      toggleVisibility({ send, prop, event }) {
        send({ type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: event })
      },
    },
  },
})
