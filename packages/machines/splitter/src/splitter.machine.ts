import { createMachine, type Params } from "@zag-js/core"
import { trackPointerMove } from "@zag-js/dom-query"
import { ensure, ensureProps, isEqual, next, prev, setRafTimeout } from "@zag-js/utils"
import * as dom from "./splitter.dom"
import type { CursorState, DragHandleId, DragState, KeyboardState, SplitterSchema } from "./splitter.types"
import { getAriaValue } from "./utils/aria"
import { fuzzyNumbersEqual, fuzzySizeEqual } from "./utils/fuzzy"
import {
  findPanelDataIndex,
  getPanelById,
  getPanelLayout,
  getUnsafeDefaultSize,
  panelDataHelper,
  serializePanels,
  sortPanels,
} from "./utils/panel"
import { resizeByDelta } from "./utils/resize-by-delta"
import { validateSizes } from "./utils/validate-sizes"

export const machine = createMachine<SplitterSchema>({
  props({ props }) {
    ensureProps(props, ["panels"])
    return {
      orientation: "horizontal",
      defaultSize: [],
      dir: "ltr",
      ...props,
      panels: sortPanels(props.panels),
    }
  },

  initialState() {
    return "idle"
  },

  context({ prop, bindable, getContext, getRefs }) {
    return {
      size: bindable(() => ({
        value: prop("size"),
        defaultValue: prop("defaultSize"),
        isEqual(a, b) {
          return b != null && fuzzySizeEqual(a, b)
        },
        onChange(value) {
          const ctx = getContext()
          const refs = getRefs()

          const sizesBeforeCollapse = refs.get("panelSizeBeforeCollapse")
          const expandToSizes = Object.fromEntries(sizesBeforeCollapse.entries())
          const dragHandleId = ctx.get("dragState")?.dragHandleId ?? null
          const layout = getPanelLayout(prop("panels"))

          prop("onResize")?.({
            size: value,
            layout,
            dragHandleId,
            expandToSizes,
          })
        },
      })),
      dragState: bindable<DragState | null>(() => ({
        defaultValue: null,
      })),
      keyboardState: bindable<KeyboardState | null>(() => ({
        defaultValue: null,
      })),
    }
  },

  watch({ track, action, prop }) {
    track([() => serializePanels(prop("panels"))], () => {
      action(["syncSize"])
    })
  },

  refs() {
    return {
      panelSizeBeforeCollapse: new Map(),
      prevDelta: 0,
      panelIdToLastNotifiedSizeMap: new Map(),
    }
  },

  computed: {
    horizontal({ prop }) {
      return prop("orientation") === "horizontal"
    },
  },

  on: {
    "SIZE.SET": {
      actions: ["setSize"],
    },
    "PANEL.COLLAPSE": {
      actions: ["collapsePanel"],
    },
    "PANEL.EXPAND": {
      actions: ["expandPanel"],
    },
    "PANEL.RESIZE": {
      actions: ["resizePanel"],
    },
  },

  entry: ["syncSize"],

  states: {
    idle: {
      entry: ["clearDraggingState", "clearKeyboardState"],
      on: {
        POINTER_OVER: {
          target: "hover:temp",
          actions: ["setKeyboardState"],
        },
        FOCUS: {
          target: "focused",
          actions: ["setKeyboardState"],
        },
        POINTER_DOWN: {
          target: "dragging",
          actions: ["setDraggingState"],
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
          actions: ["setDraggingState"],
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
          actions: ["setDraggingState"],
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
        ENTER: {
          actions: ["collapseOrExpandPanel"],
        },
        POINTER_DOWN: {
          target: "dragging",
          actions: ["setDraggingState"],
        },
        KEYBOARD_MOVE: {
          actions: ["setKeyboardValue"],
        },
        "FOCUS.CYCLE": {
          actions: ["focusNextHandleEl"],
        },
      },
    },

    dragging: {
      tags: ["focus"],
      effects: ["trackPointerMove"],
      entry: ["invokeOnResizeStart"],
      on: {
        POINTER_MOVE: {
          actions: ["setPointerValue", "setGlobalCursor"],
        },
        POINTER_UP: {
          target: "idle",
          actions: ["invokeOnResizeEnd", "clearGlobalCursor"],
        },
      },
    },
  },

  implementations: {
    effects: {
      waitForHoverDelay: ({ send }) => {
        return setRafTimeout(() => {
          send({ type: "HOVER_DELAY" })
        }, 250)
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

    actions: {
      setSize(params) {
        const { context, event, prop } = params

        const unsafeSize = event.size
        const prevSize = context.get("size")
        const panels = prop("panels")

        const safeSize = validateSizes({
          size: unsafeSize,
          panels,
        })

        if (!isEqual(prevSize, safeSize)) {
          setSize(params, safeSize)
        }
      },

      syncSize({ context, prop }) {
        const panels = prop("panels")
        let prevSize = context.get("size")

        let unsafeSize: number[] | null = null

        if (prevSize.length === 0) {
          unsafeSize = getUnsafeDefaultSize({
            panels,
            size: context.initial("size"),
          })
        }

        const nextSize = validateSizes({
          size: unsafeSize ?? prevSize,
          panels,
        })

        if (!isEqual(prevSize, nextSize)) {
          context.set("size", nextSize)
        }
      },

      setDraggingState({ context, event, prop, scope }) {
        const orientation = prop("orientation")
        const size = context.get("size")
        const dragHandleId = event.id

        const panelGroupEl = dom.getRootEl(scope)
        if (!panelGroupEl) return

        const handleElement = dom.getResizeTriggerEl(scope, dragHandleId)
        ensure(handleElement, `Drag handle element not found for id "${dragHandleId}"`)

        const initialCursorPosition = orientation === "horizontal" ? event.point.x : event.point.y

        context.set("dragState", {
          dragHandleId: event.id,
          dragHandleRect: handleElement.getBoundingClientRect(),
          initialCursorPosition,
          initialSize: size,
        })
      },

      clearDraggingState({ context }) {
        context.set("dragState", null)
      },

      setKeyboardState({ context, event }) {
        context.set("keyboardState", {
          dragHandleId: event.id,
        })
      },

      clearKeyboardState({ context }) {
        context.set("keyboardState", null)
      },

      collapsePanel(params) {
        const { context, prop, event, refs } = params

        const prevSize = context.get("size")
        const panels = prop("panels")

        const panel = panels.find((panel) => panel.id === event.id)
        ensure(panel, `Panel data not found for id "${event.id}"`)

        if (panel.collapsible) {
          const { collapsedSize = 0, panelSize, pivotIndices } = panelDataHelper(panels, panel, prevSize)

          ensure(panelSize, `Panel size not found for panel "${panel.id}"`)

          if (!fuzzyNumbersEqual(panelSize, collapsedSize)) {
            refs.get("panelSizeBeforeCollapse").set(panel.id, panelSize)

            const isLastPanel = findPanelDataIndex(panels, panel) === panels.length - 1
            const delta = isLastPanel ? panelSize - collapsedSize : collapsedSize - panelSize

            const nextSize = resizeByDelta({
              delta,
              initialSize: prevSize,
              panels,
              pivotIndices,
              prevSize,
              trigger: "imperative-api",
            })

            if (!isEqual(prevSize, nextSize)) {
              setSize(params, nextSize)
            }
          }
        }
      },

      expandPanel(params) {
        const { context, prop, event, refs } = params

        const panels = prop("panels")
        const prevSize = context.get("size")

        const panel = panels.find((panel) => panel.id === event.id)
        ensure(panel, `Panel data not found for id "${event.id}"`)

        if (panel.collapsible) {
          const {
            collapsedSize = 0,
            panelSize = 0,
            minSize: minSizeFromProps = 0,
            pivotIndices,
          } = panelDataHelper(panels, panel, prevSize)

          const minSize = event.minSize ?? minSizeFromProps

          if (fuzzyNumbersEqual(panelSize, collapsedSize)) {
            // Restore this panel to the size it was before it was collapsed, if possible.
            const prevPanelSize = refs.get("panelSizeBeforeCollapse").get(panel.id)

            const baseSize = prevPanelSize != null && prevPanelSize >= minSize ? prevPanelSize : minSize

            const isLastPanel = findPanelDataIndex(panels, panel) === panels.length - 1
            const delta = isLastPanel ? panelSize - baseSize : baseSize - panelSize

            const nextSize = resizeByDelta({
              delta,
              initialSize: prevSize,
              panels,
              pivotIndices,
              prevSize,
              trigger: "imperative-api",
            })

            if (!isEqual(prevSize, nextSize)) {
              setSize(params, nextSize)
            }
          }
        }
      },

      resizePanel(params) {
        const { context, prop, event } = params

        const prevSize = context.get("size")
        const panels = prop("panels")

        const panel = getPanelById(panels, event.id)
        const unsafePanelSize = event.size

        const { panelSize, pivotIndices } = panelDataHelper(panels, panel, prevSize)
        ensure(panelSize, `Panel size not found for panel "${panel.id}"`)

        const isLastPanel = findPanelDataIndex(panels, panel) === panels.length - 1
        const delta = isLastPanel ? panelSize - unsafePanelSize : unsafePanelSize - panelSize

        const nextSize = resizeByDelta({
          delta,
          initialSize: prevSize,
          panels: panels,
          pivotIndices,
          prevSize,
          trigger: "imperative-api",
        })

        if (!isEqual(prevSize, nextSize)) {
          setSize(params, nextSize)
        }
      },

      setPointerValue(params) {
        const { context, event, prop, scope } = params

        const dragState = context.get("dragState")
        if (!dragState) return

        const { dragHandleId, initialSize, initialCursorPosition } = dragState
        const panels = prop("panels")

        const panelGroupElement = dom.getRootEl(scope)
        ensure(panelGroupElement, `Panel group element not found`)

        const pivotIndices = dragHandleId.split(":").map((id) => panels.findIndex((panel) => panel.id === id))

        const horizontal = prop("orientation") === "horizontal"

        const cursorPosition = horizontal ? event.point.x : event.point.y
        const groupRect = panelGroupElement.getBoundingClientRect()
        const groupSizeInPixels = horizontal ? groupRect.width : groupRect.height

        const offsetPixels = cursorPosition - initialCursorPosition
        const offsetPercentage = (offsetPixels / groupSizeInPixels) * 100

        const prevSize = context.get("size")

        const nextSize = resizeByDelta({
          delta: offsetPercentage,
          initialSize: initialSize ?? prevSize,
          panels,
          pivotIndices,
          prevSize,
          trigger: "mouse-or-touch",
        })

        if (!isEqual(prevSize, nextSize)) {
          setSize(params, nextSize)
        }
      },

      setKeyboardValue(params) {
        const { context, event, prop } = params

        const panelDataArray = prop("panels")

        const dragHandleId = event.id as DragHandleId
        const delta = event.delta

        const pivotIndices = dragHandleId
          .split(":")
          .map((id) => panelDataArray.findIndex((panelData) => panelData.id === id))

        const prevSize = context.get("size")

        const nextSize = resizeByDelta({
          delta,
          initialSize: prevSize,
          panels: panelDataArray,
          pivotIndices,
          prevSize,
          trigger: "keyboard",
        })

        if (!isEqual(prevSize, nextSize)) {
          setSize(params, nextSize)
        }
      },

      invokeOnResizeEnd({ context, prop }) {
        queueMicrotask(() => {
          const dragState = context.get("dragState")
          prop("onResizeEnd")?.({
            size: context.get("size"),
            dragHandleId: dragState?.dragHandleId ?? null,
          })
        })
      },

      invokeOnResizeStart({ prop }) {
        queueMicrotask(() => {
          prop("onResizeStart")?.()
        })
      },

      collapseOrExpandPanel(params) {
        const { context, prop } = params

        const panelDataArray = prop("panels")
        const sizes = context.get("size")

        const dragHandleId = context.get("keyboardState")?.dragHandleId
        const [idBefore, idAfter] = dragHandleId?.split(":") ?? []

        const index = panelDataArray.findIndex((panelData) => panelData.id === idBefore)
        if (index === -1) return

        const panelData = panelDataArray[index]
        ensure(panelData, `No panel data found for index ${index}`)

        const size = sizes[index]

        const { collapsedSize = 0, collapsible, minSize = 0 } = panelData

        if (size != null && collapsible) {
          const pivotIndices = [idBefore, idAfter].map((id) =>
            panelDataArray.findIndex((panelData) => panelData.id === id),
          )

          const nextSize = resizeByDelta({
            delta: fuzzyNumbersEqual(size, collapsedSize) ? minSize - collapsedSize : collapsedSize - size,
            initialSize: context.initial("size"),
            panels: panelDataArray,
            pivotIndices,
            prevSize: sizes,
            trigger: "keyboard",
          })

          if (!isEqual(sizes, nextSize)) {
            setSize(params, nextSize)
          }
        }
      },

      setGlobalCursor({ context, scope, prop }) {
        const dragState = context.get("dragState")
        if (!dragState) return

        const panels = prop("panels")
        const horizontal = prop("orientation") === "horizontal"

        const [idBefore] = dragState.dragHandleId.split(":")
        const indexBefore = panels.findIndex((panel) => panel.id === idBefore)
        const panel = panels[indexBefore]

        const size = context.get("size")
        const aria = getAriaValue(size, panels, dragState.dragHandleId)

        const isAtMin =
          fuzzyNumbersEqual(aria.valueNow, aria.valueMin) || fuzzyNumbersEqual(aria.valueNow, panel.collapsedSize)

        const isAtMax = fuzzyNumbersEqual(aria.valueNow, aria.valueMax)
        const cursorState: CursorState = { isAtMin, isAtMax }
        dom.setupGlobalCursor(scope, cursorState, horizontal)
      },

      clearGlobalCursor({ scope }) {
        dom.removeGlobalCursor(scope)
      },

      focusNextHandleEl({ event, scope }) {
        const dragHandles = dom.getResizeTriggerEls(scope)
        const index = dragHandles.findIndex((el) => el.dataset.id === event.id)
        const handleEl = event.shiftKey ? prev(dragHandles, index) : next(dragHandles, index)
        handleEl?.focus()
      },
    },
  },
})

function setSize(params: Params<SplitterSchema>, sizes: number[]) {
  const { refs, prop, context } = params

  const panelsArray = prop("panels")
  const onCollapse = prop("onCollapse")
  const onExpand = prop("onExpand")

  const panelIdToLastNotifiedSizeMap = refs.get("panelIdToLastNotifiedSizeMap")

  context.set("size", sizes)

  sizes.forEach((size, index) => {
    const panelData = panelsArray[index]
    ensure(panelData, `Panel data not found for index ${index}`)

    const { collapsedSize = 0, collapsible, id: panelId } = panelData

    const lastNotifiedSize = panelIdToLastNotifiedSizeMap.get(panelId)
    if (lastNotifiedSize == null || size !== lastNotifiedSize) {
      panelIdToLastNotifiedSizeMap.set(panelId, size)

      if (collapsible && (onCollapse || onExpand)) {
        if (
          (lastNotifiedSize == null || fuzzyNumbersEqual(lastNotifiedSize, collapsedSize)) &&
          !fuzzyNumbersEqual(size, collapsedSize)
        ) {
          onExpand?.({ panelId, size })
        }

        if (
          onCollapse &&
          (lastNotifiedSize == null || !fuzzyNumbersEqual(lastNotifiedSize, collapsedSize)) &&
          fuzzyNumbersEqual(size, collapsedSize)
        ) {
          onCollapse?.({ panelId, size })
        }
      }
    }
  })
}
