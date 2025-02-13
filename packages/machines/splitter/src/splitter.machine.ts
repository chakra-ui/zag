import { createMachine } from "@zag-js/core"
import { getRelativePoint, raf, trackPointerMove } from "@zag-js/dom-query"
import { compact } from "@zag-js/utils"
import * as dom from "./splitter.dom"
import type { PanelSizeData, ResizeState, SplitterSchema } from "./splitter.types"
import { clamp, getHandleBounds, getHandlePanels, getNormalizedPanels, getPanelBounds } from "./splitter.utils"

export const machine = createMachine<SplitterSchema>({
  props({ props }) {
    return {
      orientation: "horizontal",
      defaultSize: [],
      ...compact(props),
    }
  },

  initialState() {
    return "idle"
  },

  context({ prop, bindable, getContext }) {
    return {
      activeResizeId: bindable<string | null>(() => ({
        defaultValue: null,
      })),
      size: bindable<PanelSizeData[]>(() => ({
        defaultValue: prop("defaultSize"),
        value: prop("size"),
        hash(a) {
          return a.map((panel) => `${panel.id}:${panel.size}`).join(",")
        },
        onChange(value) {
          const context = getContext()
          prop("onSizeChange")?.({
            size: value,
            activeHandleId: context.get("activeResizeId"),
          })
        },
      })),
      activeResizeState: bindable<ResizeState>(() => ({
        defaultValue: { isAtMin: false, isAtMax: false },
      })),
    }
  },

  refs({ context }) {
    return {
      previousPanels: getNormalizedPanels(context.get("size")),
    }
  },

  watch({ track, action, context }) {
    track([() => context.hash("size")], () => {
      action(["setActiveResizeState"])
    })
  },

  computed: {
    isHorizontal: ({ prop }) => prop("orientation") === "horizontal",
    panels: ({ context }) => getNormalizedPanels(context.get("size")),
  },

  on: {
    SET_PANEL_SIZE: {
      actions: ["setPanelSize"],
    },
  },
  states: {
    idle: {
      entry: ["clearActiveHandleId"],
      on: {
        POINTER_OVER: {
          target: "hover:temp",
          actions: ["setActiveHandleId"],
        },
        FOCUS: {
          target: "focused",
          actions: ["setActiveHandleId"],
        },
        DOUBLE_CLICK: {
          actions: ["resetStartPanel", "setPreviousPanels"],
        },
      },
    },

    "hover:temp": {
      effects: ["waitForHoverDelay"],
      on: {
        HOVER_DELAY: {
          target: "hover",
        },
        POINTER_DOWN: {
          target: "dragging",
          actions: ["setActiveHandleId"],
        },
        POINTER_LEAVE: {
          target: "idle",
        },
      },
    },

    hover: {
      tags: ["focus"],
      on: {
        POINTER_DOWN: {
          target: "dragging",
        },
        POINTER_LEAVE: {
          target: "idle",
        },
      },
    },

    focused: {
      tags: ["focus"],
      on: {
        BLUR: {
          target: "idle",
        },
        POINTER_DOWN: {
          target: "dragging",
          actions: ["setActiveHandleId"],
        },
        ARROW_LEFT: {
          guard: "isHorizontal",
          actions: ["shrinkStartPanel", "setPreviousPanels"],
        },
        ARROW_RIGHT: {
          guard: "isHorizontal",
          actions: ["expandStartPanel", "setPreviousPanels"],
        },
        ARROW_UP: {
          guard: "isVertical",
          actions: ["shrinkStartPanel", "setPreviousPanels"],
        },
        ARROW_DOWN: {
          guard: "isVertical",
          actions: ["expandStartPanel", "setPreviousPanels"],
        },
        ENTER: [
          {
            guard: "isStartPanelAtMax",
            actions: ["setStartPanelToMin", "setPreviousPanels"],
          },
          { actions: ["setStartPanelToMax", "setPreviousPanels"] },
        ],
        HOME: {
          actions: ["setStartPanelToMin", "setPreviousPanels"],
        },
        END: {
          actions: ["setStartPanelToMax", "setPreviousPanels"],
        },
      },
    },

    dragging: {
      tags: ["focus"],
      entry: ["focusResizeHandle"],
      effects: ["trackPointerMove"],
      on: {
        POINTER_MOVE: {
          actions: ["setPointerValue", "setGlobalCursor", "invokeOnResize"],
        },
        POINTER_UP: {
          target: "focused",
          actions: ["setPreviousPanels", "clearGlobalCursor", "blurResizeHandle", "invokeOnResizeEnd"],
        },
      },
    },
  },

  implementations: {
    effects: {
      waitForHoverDelay: ({ send }) => {
        const id = setTimeout(() => {
          send({ type: "HOVER_DELAY" })
        }, 250)
        return () => clearTimeout(id)
      },
      trackPointerMove: ({ scope, send }) => {
        const doc = scope.getDoc()
        return trackPointerMove(doc, {
          onPointerMove(info) {
            send({ type: "POINTER_MOVE", point: info.point })
          },
          onPointerUp() {
            send({ type: "POINTER_UP" })
          },
        })
      },
    },

    guards: {
      isStartPanelAtMin: ({ context }) => context.get("activeResizeState").isAtMin,
      isStartPanelAtMax: ({ context }) => context.get("activeResizeState").isAtMax,
      isHorizontal: ({ prop }) => prop("orientation") === "horizontal",
      isVertical: ({ prop }) => prop("orientation") !== "horizontal",
    },

    actions: {
      setGlobalCursor({ context, scope, computed }) {
        const activeState = context.get("activeResizeState")
        const isHorizontal = computed("isHorizontal")
        dom.setupGlobalCursor(scope, activeState, isHorizontal)
      },
      clearGlobalCursor({ scope }) {
        dom.removeGlobalCursor(scope)
      },
      invokeOnResize({ context, prop }) {
        prop("onSizeChange")?.({
          size: Array.from(context.get("size")),
          activeHandleId: context.get("activeResizeId"),
        })
      },
      invokeOnResizeEnd({ context, prop }) {
        prop("onSizeChangeEnd")?.({
          size: Array.from(context.get("size")),
          activeHandleId: context.get("activeResizeId"),
        })
      },
      setActiveHandleId({ context, event }) {
        context.set("activeResizeId", event.id)
      },
      clearActiveHandleId({ context }) {
        context.set("activeResizeId", null)
      },
      setPanelSize({ context, event }) {
        const { id, size } = event
        context.set("size", (prev) =>
          prev.map((panel) => {
            const panelSize = clamp(size, panel.minSize ?? 0, panel.maxSize ?? 100)
            return panel.id === id ? { ...panel, size: panelSize } : panel
          }),
        )
      },
      setStartPanelToMin({ context, computed }) {
        const bounds = getPanelBounds(computed("panels"), context.get("activeResizeId"))
        if (!bounds) return
        const { before, after } = bounds
        context.set("size", (prev) => {
          const next = prev.slice()
          next[before.index].size = before.min
          next[after.index].size = after.min
          return next
        })
      },
      setStartPanelToMax({ context, computed }) {
        const bounds = getPanelBounds(computed("panels"), context.get("activeResizeId"))
        if (!bounds) return
        const { before, after } = bounds
        context.set("size", (prev) => {
          const next = prev.slice()
          next[before.index].size = before.max
          next[after.index].size = after.max
          return next
        })
      },
      expandStartPanel({ context, event, computed }) {
        const bounds = getPanelBounds(computed("panels"), context.get("activeResizeId"))
        if (!bounds) return
        const { before, after } = bounds
        context.set("size", (prev) => {
          const next = prev.slice()
          next[before.index].size = before.up(event.step)
          next[after.index].size = after.down(event.step)
          return next
        })
      },
      shrinkStartPanel({ context, event, computed }) {
        const bounds = getPanelBounds(computed("panels"), context.get("activeResizeId"))
        if (!bounds) return
        const { before, after } = bounds
        context.set("size", (prev) => {
          const next = prev.slice()
          next[before.index].size = before.down(event.step)
          next[after.index].size = after.up(event.step)
          return next
        })
      },
      resetStartPanel({ context, computed }) {
        const bounds = getPanelBounds(computed("panels"), context.get("activeResizeId"))
        if (!bounds) return
        const { before, after } = bounds
        const initialSize = context.initial("size")
        context.set("size", (prev) => {
          const next = prev.slice()
          next[before.index].size = initialSize[before.index].size
          next[after.index].size = initialSize[after.index].size
          return next
        })
      },
      focusResizeHandle({ scope, context }) {
        raf(() => {
          const activeId = context.get("activeResizeId")
          if (!activeId) return
          dom.getResizeTriggerEl(scope, activeId)?.focus({ preventScroll: true })
        })
      },
      blurResizeHandle({ scope, context }) {
        raf(() => {
          const activeId = context.get("activeResizeId")
          if (!activeId) return
          dom.getResizeTriggerEl(scope, activeId)?.blur()
        })
      },
      setPreviousPanels({ refs, computed }) {
        refs.set("previousPanels", computed("panels").slice())
      },
      setActiveResizeState({ context, computed }) {
        const panels = getPanelBounds(computed("panels"), context.get("activeResizeId"))
        if (!panels) return
        const { before } = panels
        context.set("activeResizeState", {
          isAtMin: before.isAtMin,
          isAtMax: before.isAtMax,
        })
      },
      setPointerValue({ context, event, prop, scope, computed }) {
        const panels = getHandlePanels(computed("panels"), context.get("activeResizeId"))
        const bounds = getHandleBounds(computed("panels"), context.get("activeResizeId"))

        if (!panels || !bounds) return

        const rootEl = dom.getRootEl(scope)
        if (!rootEl) return

        const relativePoint = getRelativePoint(event.point, rootEl)
        const percentValue = relativePoint.getPercentValue({
          dir: prop("dir"),
          orientation: prop("orientation"),
        })

        let pointValue = percentValue * 100

        // update active resize state here because we use `previousPanels` in the calculations
        context.set("activeResizeState", {
          isAtMin: pointValue < bounds.min,
          isAtMax: pointValue > bounds.max,
        })

        pointValue = clamp(pointValue, bounds.min, bounds.max)

        const { before, after } = panels

        const offset = pointValue - before.end
        context.set("size", (prev) => {
          const next = prev.slice()
          next[before.index].size = before.size + offset
          next[after.index].size = after.size - offset
          return next
        })
      },
    },
  },
})
