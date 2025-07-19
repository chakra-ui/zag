import { setup } from "@zag-js/core"
import { nextTick, queryAll, trackPointerMove, trackVisualViewport } from "@zag-js/dom-query"
import type { Point } from "@zag-js/types"
import { hasProp, last } from "@zag-js/utils"
import * as dom from "./bottom-sheet.dom"
import type { BottomSheetSchema } from "./bottom-sheet.types"
import { getSnapOffsets } from "./utils/get-snap-offset"

const { guards, createMachine } = setup<BottomSheetSchema>()

const { and, not } = guards

const FAST_SWIPE_VELOCITY = 800
const MEDIUM_SWIPE_VELOCITY = 400

export const machine = createMachine({
  props({ props }) {
    return {
      snapPoints: [200, "60%", "100%"],
      resizable: false,
      modal: true,
      defaultSnapIndex: 0,
      ...props,
    }
  },

  context({ bindable, prop }) {
    return {
      snapIndex: bindable<number>(() => ({
        defaultValue: prop("defaultSnapIndex"),
        value: prop("snapIndex"),
        onChange(value) {
          prop("onSnapPointChange")?.({
            snapPoint: prop("snapPoints")[value],
            snapIndex: value,
          })
        },
      })),
      dragOffset: bindable<number | null>(() => ({
        defaultValue: null,
      })),
      viewportHeight: bindable<number | null>(() => ({
        defaultValue: null,
      })),
      pointerStartPoint: bindable<Point | null>(() => ({
        defaultValue: null,
      })),
      visible: bindable<boolean>(() => ({
        defaultValue: false,
      })),
    }
  },

  computed: {
    snapPoint: ({ context, prop }) => {
      const snapPoints = prop("snapPoints")
      const idx = context.get("snapIndex")
      return snapPoints?.[idx] ?? null
    },
    snapPointOffsets: ({ context, prop }) => {
      const snapPoints = prop("snapPoints")
      const vh = context.get("viewportHeight")
      return getSnapOffsets(snapPoints, vh)
    },
    snapPointOffset: ({ context, computed }) => {
      const snapPointOffsets = computed("snapPointOffsets")
      const idx = context.get("snapIndex")
      return snapPointOffsets?.[idx] ?? null
    },
    lastSnapPointOffset: ({ computed }) => {
      const snapPointOffsets = computed("snapPointOffsets")
      return last(snapPointOffsets) ?? null
    },
  },

  watch({ prop, track, action }) {
    track([() => prop("snapIndex")], () => {
      action(["setSnapHeight"])
    })
  },

  entry: ["setViewportHeight"],

  effects: ["trackVisualViewport"],

  initialState({ prop }) {
    return prop("open") || prop("defaultOpen") ? "open" : "closed"
  },

  states: {
    closed: {
      tags: ["closed"],
      on: {
        "controlled.open": {
          target: "open",
        },
        open: {
          target: "open",
          actions: ["invokeOnOpen", "markScrollableRegions"],
        },
      },
    },

    open: {
      tags: ["open"],
      entry: ["setVisible", "restoreScrollYIfNeeded"],
      on: {
        "controlled.close": {
          target: "closing",
        },
        "grabber.pointerdown": {
          target: "panning",
          actions: ["setPointerStart"],
        },
        close: {
          target: "closing",
          actions: ["clearVisible"],
        },
      },
    },

    panning: {
      tags: ["open"],
      effects: ["trackPointerMove"],
      entry: ["preventScrollY"],
      on: {
        "grabber.drag": {
          actions: ["setDragOffset"],
        },
        "grabber.release": [
          {
            guard: and("isFastSwipe", "hasDraggedUp"),
            target: "open",
            actions: ["setHighestSnapIndex", "clearDragOffset"],
          },
          {
            guard: "isFastSwipe",
            target: "closing",
            actions: ["clearVisible", "setDragOffsetToMax"],
          },
          {
            guard: and("isMediumSwipe", "isFirstSnap", not("hasDraggedUp")),
            target: "closing",
            actions: ["clearVisible", "setDragOffsetToMax"],
          },
          {
            guard: "isMediumSwipe",
            target: "open",
            actions: ["setPrevOrNextSnapIndex", "clearDragOffset"],
          },
          {
            target: "open",
            actions: ["setClosestSnapIndex", "clearDragOffset"],
          },
        ],
      },
    },

    closing: {
      tags: ["open"],
      effects: ["waitForAnimation"],
      on: {
        "animation.complete": {
          target: "closed",
          actions: ["invokeOnClose", "clearDragOffset", "resetSnapIndex"],
        },
      },
    },
  },

  implementations: {
    guards: {
      isFirstSnap: ({ context }) => context.get("snapIndex") === 0,
      isFastSwipe: ({ event }) => event.velocity.y > FAST_SWIPE_VELOCITY,
      isMediumSwipe: ({ context, event }) => {
        const distance = event.point.y - context.get("pointerStartPoint")!.y
        const vh = context.get("viewportHeight") ?? 0
        return event.velocity.y > MEDIUM_SWIPE_VELOCITY && Math.abs(distance) < vh * 0.4
      },
      hasDraggedUp: ({ context, event }) => {
        const distance = event.point.y - context.get("pointerStartPoint")!.y
        return distance < 0
      },
    },

    effects: {
      trackPointerMove({ send, scope }) {
        return trackPointerMove(scope.getDoc(), {
          // startPoint: context.get("pointerStartPoint"),
          onPointerMove({ point }) {
            send({ type: "grabber.drag", point })
          },
          onPointerUp({ point }) {
            send({ type: "grabber.release", point })
          },
        })
      },
      trackVisualViewport({ context, scope }) {
        return trackVisualViewport(scope.getDoc(), (size) => {
          context.set("viewportHeight", size.height)
        })
      },
      preventScrollY({ scope }) {
        const { y: elements } = dom.getScrollEls(scope)
        elements.forEach((el) => {
          const y = el.scrollHeight > el.clientHeight
          if (y) {
            Object.assign(el, { _overflowY: el.style.overflowY })
            el.style.overflowY = "hidden"
          }
        })
      },
      waitForAnimation({ send }) {
        const timeout = setTimeout(() => {
          send({ type: "animation.complete" })
        }, 300)
        return () => clearTimeout(timeout)
      },
    },
    actions: {
      resetSnapIndex({ context }) {
        context.set("snapIndex", 0)
      },
      setViewportHeight({ context, scope }) {
        const win = scope.getWin()
        context.set("viewportHeight", win.innerHeight)
      },
      setVisible({ context }) {
        nextTick(() => {
          context.set("visible", true)
        })
      },
      clearVisible({ context }) {
        context.set("visible", false)
      },
      clearDragOffset({ context }) {
        context.set("dragOffset", null)
      },
      setDragOffsetToMax({ context }) {
        context.set("dragOffset", context.get("viewportHeight"))
      },
      setDragOffset({ context, computed, event }) {
        const startPoint = context.get("pointerStartPoint")
        if (startPoint == null) return

        const distance = startPoint.y - event.point.y
        const offset = (computed("snapPointOffset") ?? 0) - distance

        const lastSnapPointOffset = computed("lastSnapPointOffset")
        if (lastSnapPointOffset != null && offset < lastSnapPointOffset) return
        context.set("dragOffset", offset)
      },
      setHighestSnapIndex({ context, computed }) {
        context.set("snapIndex", computed("snapPointOffsets").length - 1)
      },
      setClosestSnapIndex({ context, computed, event }) {
        const pointerStartPoint = context.get("pointerStartPoint")
        if (pointerStartPoint == null) return

        const distance = pointerStartPoint.y - event.point.y
        const position = (computed("snapPointOffset") ?? 0) - distance

        const closest = computed("snapPointOffsets").reduce((prev, curr) => {
          if (typeof prev !== "number" || typeof curr !== "number") return prev
          return Math.abs(curr - position) < Math.abs(prev - position) ? curr : prev
        })

        context.set("snapIndex", computed("snapPointOffsets").indexOf(closest))
      },
      setPrevOrNextSnapIndex({ context, event }) {
        const pointerStartPoint = context.get("pointerStartPoint")
        if (pointerStartPoint == null) return

        const distance = event.point.y - pointerStartPoint.y
        const dragDirection = distance < 0 ? 1 : -1
        context.set("snapIndex", (prev) => prev + dragDirection)
      },
      setPointerStart({ context, event }) {
        context.set("pointerStartPoint", event.point)
      },
      setSnapHeight({ scope, computed }) {
        const contentEl = dom.getContentEl(scope)
        if (!contentEl) return
        contentEl.style.setProperty("--snap-point-height", `${computed("snapPoint")}px`)
      },
      markScrollableRegions({ scope }) {
        const contentEl = dom.getContentEl(scope)
        if (!contentEl) return
        const elements = queryAll(contentEl, "*")
        elements.forEach((el) => {
          const x = el.scrollWidth > el.clientWidth
          const y = el.scrollHeight > el.clientHeight
          if (x || y) el.dataset.scrollable = `${x ? "x" : ""}${y ? "y" : ""}`
        })
      },
      restoreScrollYIfNeeded({ context, prop, scope }) {
        const isMaxSnapOffset = context.get("snapIndex") === last(prop("snapPoints"))
        if (!isMaxSnapOffset) return

        const { y: elements } = dom.getScrollEls(scope)
        elements.forEach((node) => {
          if (!hasProp(node, "_overflowY")) return
          node.style.overflowY = node._overflowY
          delete node._overflowY
        })
      },
      invokeOnOpen({ prop }) {
        prop("onOpenChange")?.({ open: true })
      },
      invokeOnClose({ prop }) {
        prop("onOpenChange")?.({ open: false })
      },
      toggleVisibility({ send, flush, prop, event }) {
        flush(() => {
          send({ type: prop("open") ? "controlled.open" : "controlled.close", previousEvent: event })
        })
      },
    },
  },
})
