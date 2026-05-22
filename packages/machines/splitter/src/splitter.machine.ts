import { createMachine, type Params } from "@zag-js/core"
import { observeChildren, resizeObserverBorderBox, trackPointerMove } from "@zag-js/dom-query"
import { ensure, ensureProps, isEqual, next, prev, setRafTimeout } from "@zag-js/utils"
import * as dom from "./splitter.dom"
import type { CursorState, ResizeTriggerId, DragState, KeyboardState, SplitterSchema } from "./splitter.types"
import { getAriaValue } from "./utils/aria"
import { fuzzyNumbersEqual, fuzzySizeEqual } from "./utils/fuzzy"
import {
  findPanelDataIndex,
  getPanelById,
  getPanelLayout,
  panelDataHelper,
  serializePanels,
  sortPanels,
} from "./utils/panel"
import { preserveFixedPanelSizes } from "./utils/preserve-fixed-panel-sizes"
import { resizeByDelta } from "./utils/resize-by-delta"
import { getGroupSize, normalizePanels, resolvePanelSizes } from "./utils/size"
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
      panels: bindable(() => ({
        defaultValue: normalizePanels(prop("panels"), null, prop("orientation")),
      })),
      size: bindable<number[]>(() => ({
        defaultValue: [],
        isEqual(a, b) {
          return b != null && fuzzySizeEqual(a, b)
        },
        onChange(value) {
          const ctx = getContext()
          const refs = getRefs()

          if (refs.get("suppressOnResize")) return

          const sizesBeforeCollapse = refs.get("panelSizeBeforeCollapse")
          const expandToSizes = Object.fromEntries(sizesBeforeCollapse.entries())
          const resizeTriggerId = ctx.get("dragState")?.resizeTriggerId ?? null
          const layout = getPanelLayout(prop("panels"))

          prop("onResize")?.({
            size: value,
            layout,
            resizeTriggerId,
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
    track(
      [
        () => serializePanels(prop("panels")),
        () => JSON.stringify(prop("size") ?? []),
        () => JSON.stringify(prop("defaultSize") ?? []),
      ],
      () => {
        action(["syncSize"])
      },
    )
  },

  refs() {
    return {
      panelSizeBeforeCollapse: new Map(),
      prevDelta: 0,
      panelIdToLastNotifiedSizeMap: new Map(),
      initialSize: null,
      prevInitialLayout: null,
      prevGroupSize: null,
      lastRequestedSize: null,
      suppressOnResize: false,
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
    "SIZE.RESET": {
      actions: ["resetSize"],
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
    "ROOT.RESIZE": {
      actions: ["syncSize"],
    },
  },

  entry: ["syncSize"],
  exit: ["clearGlobalCursor"],

  effects: ["trackResizeHandles", "trackRootResize"],

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
          actions: ["invokeOnResizeStart", "setKeyboardValue", "invokeOnResizeEnd"],
        },
        "FOCUS.CYCLE": {
          actions: ["focusNextResizeTrigger"],
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
        POINTER_UP: [
          {
            guard: "isResizeTriggerFocused",
            target: "focused",
            actions: ["invokeOnResizeEnd", "setKeyboardState", "clearDraggingState", "clearGlobalCursor"],
          },
          {
            target: "idle",
            actions: ["invokeOnResizeEnd", "clearGlobalCursor"],
          },
        ],
      },
    },
  },

  implementations: {
    guards: {
      isResizeTriggerFocused({ context, scope }) {
        const dragState = context.get("dragState")
        return scope.isActiveElement(dom.getResizeTriggerEl(scope, dragState?.resizeTriggerId))
      },
    },

    effects: {
      trackResizeHandles: ({ prop, scope, send }) => {
        const registry = prop("registry")
        if (!registry) return

        let cleanups: VoidFunction[] = []

        const exec = () => {
          cleanups.forEach((fn) => fn())
          cleanups = dom
            .getResizeTriggerEls(scope)
            .map((resizeTriggerEl) => {
              const id = resizeTriggerEl.dataset.id
              if (!id) return
              return registry!.register({
                id: dom.getResizeTriggerId(scope, id),
                element: resizeTriggerEl as HTMLElement,
                orientation: prop("orientation"),
                onActivate(point) {
                  send({ type: "POINTER_DOWN", id, point })
                },
                onDeactivate() {
                  send({ type: "POINTER_UP" })
                },
              })
            })
            .filter(Boolean) as VoidFunction[]
        }

        exec()

        // Re-register when panels change (DOM updates)
        const observeCleanup = observeChildren(dom.getRootEl(scope), {
          callback: exec,
        })

        return () => {
          cleanups.forEach((fn) => fn())
          observeCleanup?.()
        }
      },
      trackRootResize: ({ scope, send }) => {
        const rootEl = dom.getRootEl(scope)
        if (!rootEl) return

        return resizeObserverBorderBox.observe(rootEl, () => {
          send({ type: "ROOT.RESIZE" })
        })
      },
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
        const { context, event, prop, scope } = params

        const unsafeSize = event.size
        const prevSize = context.get("size")
        const panels = context.get("panels")

        const safeSize = validateSizes({
          size: resolvePanelSizes({
            sizes: unsafeSize,
            panels: prop("panels"),
            rootEl: dom.getRootEl(scope),
            orientation: prop("orientation"),
          }),
          panels,
        })

        if (!isEqual(prevSize, safeSize)) {
          setSize(params, safeSize)
        }
      },

      resetSize(params) {
        const { refs, context, prop, scope } = params
        const initialSize = refs.get("initialSize")

        const nextSize =
          initialSize ??
          validateSizes({
            size: resolvePanelSizes({
              sizes: prop("size") ?? prop("defaultSize"),
              panels: prop("panels"),
              rootEl: dom.getRootEl(scope),
              orientation: prop("orientation"),
            }),
            panels: context.get("panels"),
          })

        setSize(params, nextSize)
      },

      syncSize(params) {
        const { context, scope, prop, refs } = params
        const rootEl = dom.getRootEl(scope)
        if (!rootEl) return

        const orientation = prop("orientation")
        const nextGroupSize = getGroupSize(rootEl, orientation)
        if (nextGroupSize <= 0) return

        const panels = normalizePanels(prop("panels"), rootEl, prop("orientation"))
        context.set("panels", panels)

        const sizeSpec = prop("size") ?? prop("defaultSize")
        const initialLayout = `${getPanelLayout(prop("panels"))}:${JSON.stringify(prop("size") ?? [])}:${JSON.stringify(prop("defaultSize") ?? [])}`
        const prevGroupSize = refs.get("prevGroupSize")
        const currentSize = context.get("size")
        const nextResolvedSize = resolvePanelSizes({
          sizes: sizeSpec,
          panels: prop("panels"),
          rootEl,
          orientation,
        })

        const canPreserveLayout =
          prevGroupSize != null && prevGroupSize !== nextGroupSize && currentSize.length === panels.length

        const nextSize = canPreserveLayout
          ? preserveFixedPanelSizes({
              panels,
              prevLayout: currentSize,
              prevGroupSize,
              nextGroupSize,
            })
          : nextResolvedSize

        const safeSize = validateSizes({
          size: nextSize,
          panels,
        })

        if (refs.get("prevInitialLayout") !== initialLayout) {
          refs.set("initialSize", safeSize)
          refs.set("prevInitialLayout", initialLayout)
        }

        const prevSize = context.get("size")
        if (!isEqual(prevSize, safeSize)) {
          refs.set("suppressOnResize", prop("size") != null || prevSize.length === 0)
          context.set("size", safeSize)
          refs.set("suppressOnResize", false)
        }

        refs.set("prevGroupSize", nextGroupSize)
      },

      setDraggingState({ context, event, prop, scope }) {
        const orientation = prop("orientation")
        const size = context.get("size")
        const resizeTriggerId = event.id
        const resolvedResizeTriggerId = dom.resolveResizeTriggerId(scope, resizeTriggerId)
        if (!resolvedResizeTriggerId) return

        const panelGroupEl = dom.getRootEl(scope)
        if (!panelGroupEl) return

        const handleElement = dom.getResizeTriggerEl(scope, resizeTriggerId)
        ensure(handleElement, () => `Drag handle element not found for id "${resizeTriggerId}"`)

        const initialCursorPosition = orientation === "horizontal" ? event.point.x : event.point.y

        context.set("dragState", {
          resizeTriggerId: event.id,
          resolvedResizeTriggerId,
          resizeTriggerRect: handleElement.getBoundingClientRect(),
          initialCursorPosition,
          initialSize: size,
        })
      },

      clearDraggingState({ context }) {
        context.set("dragState", null)
      },

      setKeyboardState({ context, event, scope }) {
        const id = event.id ?? context.get("dragState")?.resizeTriggerId
        if (id == null) return
        context.set("keyboardState", {
          resizeTriggerId: id,
          resolvedResizeTriggerId: dom.resolveResizeTriggerId(scope, id),
        })
      },

      clearKeyboardState({ context }) {
        context.set("keyboardState", null)
      },

      collapsePanel(params) {
        const { context, event, refs } = params

        const prevSize = context.get("size")
        const panels = context.get("panels")

        const panel = panels.find((panel) => panel.id === event.id)
        ensure(panel, () => `Panel data not found for id "${event.id}"`)

        if (panel.collapsible) {
          const { collapsedSize = 0, panelSize, pivotIndices } = panelDataHelper(panels, panel, prevSize)

          ensure(panelSize != null, () => `Panel size not found for panel "${panel.id}"`)

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
        const { context, event, refs } = params

        const panels = context.get("panels")
        const prevSize = context.get("size")

        const panel = panels.find((panel) => panel.id === event.id)
        ensure(panel, () => `Panel data not found for id "${event.id}"`)

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
        const { context, event } = params

        const prevSize = context.get("size")
        const panels = context.get("panels")

        const panel = getPanelById(panels, event.id)
        const unsafePanelSize = event.size

        const { panelSize, pivotIndices } = panelDataHelper(panels, panel, prevSize)
        ensure(panelSize != null, () => `Panel size not found for panel "${panel.id}"`)

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

        const { resolvedResizeTriggerId, initialSize, initialCursorPosition } = dragState
        const panels = context.get("panels")

        const panelGroupElement = dom.getRootEl(scope)
        ensure(panelGroupElement, () => `Panel group element not found`)

        const pivotIndices = resolvedResizeTriggerId
          .split(":")
          .map((id) => panels.findIndex((panel) => panel.id === id))

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
        const { context, event } = params

        const panelDataArray = context.get("panels")

        const resizeTriggerId = dom.resolveResizeTriggerId(params.scope, event.id as ResizeTriggerId)
        if (!resizeTriggerId) return
        const delta = event.delta

        const pivotIndices = resizeTriggerId
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

      invokeOnResizeEnd({ context, prop, refs }) {
        queueMicrotask(() => {
          const dragState = context.get("dragState")
          prop("onResizeEnd")?.({
            size: refs.get("lastRequestedSize") ?? context.get("size"),
            resizeTriggerId: dragState?.resizeTriggerId ?? null,
          })
        })
      },

      invokeOnResizeStart({ prop }) {
        queueMicrotask(() => {
          prop("onResizeStart")?.()
        })
      },

      collapseOrExpandPanel(params) {
        const { context, refs } = params

        const panelDataArray = context.get("panels")
        const sizes = context.get("size")

        const resizeTriggerId = context.get("keyboardState")?.resolvedResizeTriggerId
        const [idBefore, idAfter] = resizeTriggerId?.split(":") ?? []

        const index = panelDataArray.findIndex((panelData) => panelData.id === idBefore)
        if (index === -1) return

        const panelData = panelDataArray[index]
        ensure(panelData, () => `No panel data found for index ${index}`)

        const size = sizes[index]

        const { collapsedSize = 0, collapsible, minSize = 0 } = panelData

        if (size != null && collapsible) {
          const pivotIndices = [idBefore, idAfter].map((id) =>
            panelDataArray.findIndex((panelData) => panelData.id === id),
          )

          const nextSize = resizeByDelta({
            delta: fuzzyNumbersEqual(size, collapsedSize) ? minSize - collapsedSize : collapsedSize - size,
            initialSize: refs.get("initialSize") ?? sizes,
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

      setGlobalCursor(params) {
        const { context, scope, prop } = params
        const registry = prop("registry")
        // Don't set cursor when registry is enabled - registry manages cursor globally
        if (registry) return

        const dragState = context.get("dragState")
        if (!dragState) return

        const panels = context.get("panels")
        const horizontal = prop("orientation") === "horizontal"

        const [idBefore] = dragState.resolvedResizeTriggerId.split(":")
        const indexBefore = panels.findIndex((panel) => panel.id === idBefore)
        const panel = panels[indexBefore]

        const size = context.get("size")
        const aria = getAriaValue(size, panels, dragState.resolvedResizeTriggerId)

        const isAtMin =
          fuzzyNumbersEqual(aria.valueNow, aria.valueMin) || fuzzyNumbersEqual(aria.valueNow, panel.collapsedSize)

        const isAtMax = fuzzyNumbersEqual(aria.valueNow, aria.valueMax)
        const cursorState: CursorState = { isAtMin, isAtMax }
        dom.setupGlobalCursor(scope, cursorState, horizontal, prop("nonce"))
      },

      clearGlobalCursor({ scope }) {
        dom.removeGlobalCursor(scope)
      },

      focusNextResizeTrigger({ event, scope }) {
        const resizeTriggers = dom.getResizeTriggerEls(scope)
        const index = resizeTriggers.findIndex((el) => el.dataset.id === event.id)
        const handleEl = event.shiftKey ? prev(resizeTriggers, index) : next(resizeTriggers, index)
        handleEl?.focus()
      },
    },
  },
})

function setSize(params: Params<SplitterSchema>, sizes: number[]) {
  const { refs, prop, context } = params

  const panelsArray = context.get("panels")
  const onCollapse = prop("onCollapse")
  const onExpand = prop("onExpand")
  const onResize = prop("onResize")
  const onResizeStart = prop("onResizeStart")
  const onResizeEnd = prop("onResizeEnd")

  const panelIdToLastNotifiedSizeMap = refs.get("panelIdToLastNotifiedSizeMap")

  // Check if this is a programmatic resize (not user interaction)
  const dragState = context.get("dragState")
  const keyboardState = context.get("keyboardState")
  const isProgrammatic = dragState === null && keyboardState === null
  refs.set("lastRequestedSize", sizes)

  // Call onResizeStart for programmatic resizes
  if (isProgrammatic && onResizeStart) {
    queueMicrotask(() => {
      onResizeStart()
    })
  }

  if (prop("size") == null) {
    context.set("size", sizes)
  } else if (onResize) {
    const sizesBeforeCollapse = refs.get("panelSizeBeforeCollapse")
    const expandToSizes = Object.fromEntries(sizesBeforeCollapse.entries())
    const resizeTriggerId = dragState?.resizeTriggerId ?? null
    const layout = getPanelLayout(prop("panels"))

    onResize({
      size: sizes,
      layout,
      resizeTriggerId,
      expandToSizes,
    })
  }

  sizes.forEach((size, index) => {
    const panelData = panelsArray[index]
    ensure(panelData, () => `Panel data not found for index ${index}`)

    const { collapsedSize = 0, collapsible, id: panelId } = panelData

    const lastNotifiedSize = panelIdToLastNotifiedSizeMap.get(panelId)
    if (lastNotifiedSize == null || size !== lastNotifiedSize) {
      panelIdToLastNotifiedSizeMap.set(panelId, size)

      if (collapsible && lastNotifiedSize != null && (onCollapse || onExpand)) {
        if (fuzzyNumbersEqual(lastNotifiedSize, collapsedSize) && !fuzzyNumbersEqual(size, collapsedSize)) {
          onExpand?.({ panelId, size })
        }

        if (!fuzzyNumbersEqual(lastNotifiedSize, collapsedSize) && fuzzyNumbersEqual(size, collapsedSize)) {
          onCollapse?.({ panelId, size })
        }
      }
    }
  })

  // Call onResizeEnd for programmatic resizes
  if (isProgrammatic && onResizeEnd) {
    queueMicrotask(() => {
      onResizeEnd({
        size: sizes,
        resizeTriggerId: null, // Programmatic changes don't have a resize trigger
      })
    })
  }
}
