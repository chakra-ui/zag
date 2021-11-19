import { createMachine, guards, ref } from "@ui-machines/core"
import { nextTick } from "@ui-machines/dom-utils"
import { Context } from "@ui-machines/utils"

import { dom } from "./tabs.dom"

const { not } = guards

export type TabsMachineContext = Context<{
  /**
   * Whether the keyboard navigation will loop from last tab to first, and vice versa.
   * @default true
   */
  loop: boolean
  /**
   * The focused tab id
   */
  focusedValue: string | null
  /**
   * The selected tab id
   */
  value: string | null
  /**
   * The orientation of the tabs. Can be `horizontal` or `vertical`
   * - `horizontal`: only left and right arrow key navigation will work.
   * - `vertical`: only up and down arrow key navigation will work.
   *
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical"
  /**
   * The activation mode of the tabs. Can be `manual` or `automatic`
   * - `manual`: Tabs are activated when clicked or press `enter` key.
   * - `automatic`: Tabs are activated when receiving focus
   * @default "automatic"
   */
  activationMode?: "manual" | "automatic"
  /**
   * @internal The active tab indicator's dom rect
   */
  indicatorRect?: Partial<DOMRect>
  /**
   * @internal Whether the active tab indicator's rect has been measured
   */
  measuredRect?: boolean
  /**
   * Callback to be called when the selected/active tab changes
   */
  onChange?: (id: string | null) => void
  /**
   * Callback to be called when the focused tab changes
   */
  onFocus?: (id: string | null) => void
}>

export type TabsMachineState = {
  value: "unknown" | "idle" | "focused"
}

export const tabsMachine = createMachine<TabsMachineContext, TabsMachineState>(
  {
    initial: "unknown",
    context: {
      dir: "ltr",
      orientation: "horizontal",
      activationMode: "automatic",
      value: null,
      focusedValue: null,
      uid: "",
      indicatorRect: { left: 0, right: 0, width: 0, height: 0 },
      measuredRect: false,
      loop: true,
    },
    watch: {
      focusedValue: "invokeOnFocus",
      value: "invokeOnChange",
    },
    on: {
      SET_VALUE: {
        actions: ["setValue"],
      },
    },
    states: {
      unknown: {
        on: {
          SETUP: {
            target: "idle",
            actions: ["setId", "setOwnerDocument"],
          },
        },
      },
      idle: {
        entry: "setIndicatorRect",
        on: {
          TAB_FOCUS: { target: "focused", actions: "setFocusedValue" },
          TAB_CLICK: {
            target: "focused",
            actions: ["setFocusedValue", "setValue", "setIndicatorRect"],
          },
        },
      },
      focused: {
        on: {
          TAB_CLICK: {
            target: "focused",
            actions: ["setFocusedValue", "setValue", "setIndicatorRect"],
          },
          ARROW_LEFT: {
            guard: "isHorizontal",
            actions: "focusPrevTab",
          },
          ARROW_RIGHT: {
            guard: "isHorizontal",
            actions: "focusNextTab",
          },
          ARROW_UP: {
            guard: "isVertical",
            actions: "focusPrevTab",
          },
          ARROW_DOWN: {
            guard: "isVertical",
            actions: "focusNextTab",
          },
          HOME: { actions: "focusFirstTab" },
          END: { actions: "focusLastTab" },
          ENTER: {
            guard: not("selectOnFocus"),
            actions: ["setValue", "setIndicatorRect"],
          },
          TAB_FOCUS: [
            {
              guard: "selectOnFocus",
              actions: ["setFocusedValue", "setValue", "setIndicatorRect"],
            },
            { actions: "setFocusedValue" },
          ],
          TAB_BLUR: {
            target: "idle",
            actions: "resetFocusedValue",
          },
        },
      },
    },
  },
  {
    guards: {
      isVertical: (ctx) => ctx.orientation === "vertical",
      isHorizontal: (ctx) => ctx.orientation === "horizontal",
      selectOnFocus: (ctx) => ctx.activationMode === "automatic",
    },
    actions: {
      setOwnerDocument(ctx, evt) {
        ctx.doc = ref(evt.doc)
      },
      setId(ctx, evt) {
        ctx.uid = evt.id
      },
      setFocusedValue(ctx, evt) {
        ctx.focusedValue = evt.value
      },
      resetFocusedValue(ctx) {
        ctx.focusedValue = null
      },
      setValue(ctx, evt) {
        ctx.value = evt.value
      },
      focusFirstTab(ctx) {
        nextTick(() => dom.getFirstEl(ctx)?.focus())
      },
      focusLastTab(ctx) {
        nextTick(() => dom.getLastEl(ctx)?.focus())
      },
      focusNextTab(ctx) {
        if (!ctx.focusedValue) return
        const next = dom.getNextEl(ctx, ctx.focusedValue)
        nextTick(() => next?.focus())
      },
      focusPrevTab(ctx) {
        if (!ctx.focusedValue) return
        const prev = dom.getPrevEl(ctx, ctx.focusedValue)
        nextTick(() => prev?.focus())
      },
      setIndicatorRect(ctx) {
        nextTick(() => {
          if (!ctx.value) return
          ctx.indicatorRect = dom.getRectById(ctx, ctx.value)
          if (ctx.measuredRect) return
          nextTick(() => {
            ctx.measuredRect = true
          })
        })
      },
      invokeOnChange(ctx) {
        ctx.onChange?.(ctx.value)
      },
      invokeOnFocus(ctx) {
        ctx.onFocus?.(ctx.focusedValue)
      },
    },
  },
)
