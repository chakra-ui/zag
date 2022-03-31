import { createMachine, guards, ref } from "@ui-machines/core"
import { getFocusables, nextTick } from "@ui-machines/dom-utils"
import { dom } from "./tabs.dom"
import { MachineContext, MachineState } from "./tabs.types"

const { not } = guards

export const machine = createMachine<MachineContext, MachineState>(
  {
    initial: "unknown",

    context: {
      dir: "ltr",
      orientation: "horizontal",
      activationMode: "automatic",
      value: null,
      focusedValue: null,
      uid: "",
      previousValues: [],
      indicatorRect: { left: "0px", top: "0px", width: "0px", height: "0px" },
      hasMeasuredRect: false,
      isIndicatorRendered: false,
      loop: true,
      messages: {},
    },

    computed: {
      isHorizontal: (ctx) => ctx.orientation === "horizontal",
      isVertical: (ctx) => ctx.orientation === "vertical",
    },

    created(ctx) {
      if (ctx.value != null) {
        const newSelected = Array.from(ctx.previousValues).concat(ctx.value)
        ctx.previousValues = Array.from(new Set(newSelected))
      }
    },

    watch: {
      focusedValue: "invokeOnFocus",
      value: ["invokeOnChange", "setPrevSelectedTabs", "setIndicatorRect", "setTabPanelTabIndex"],
      dir: ["clearMeasured", "setIndicatorRect"],
    },

    on: {
      SET_VALUE: {
        actions: "setValue",
      },
    },

    states: {
      unknown: {
        on: {
          SETUP: {
            target: "idle",
            actions: ["setupDocument", "checkRenderedElements", "setIndicatorRect", "setTabPanelTabIndex"],
          },
        },
      },
      idle: {
        on: {
          TAB_FOCUS: {
            guard: "selectOnFocus",
            target: "focused",
            actions: ["setFocusedValue", "setValue"],
          },
          TAB_CLICK: {
            target: "focused",
            actions: ["setFocusedValue", "setValue"],
          },
        },
      },
      focused: {
        on: {
          TAB_CLICK: {
            target: "focused",
            actions: ["setFocusedValue", "setValue"],
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
          HOME: {
            actions: "focusFirstTab",
          },
          END: {
            actions: "focusLastTab",
          },
          ENTER: {
            guard: not("selectOnFocus"),
            actions: "setValue",
          },
          TAB_FOCUS: [
            {
              guard: "selectOnFocus",
              actions: ["setFocusedValue", "setValue"],
            },
            { actions: "setFocusedValue" },
          ],
          TAB_BLUR: {
            target: "idle",
            actions: "clearFocusedValue",
          },
        },
      },
    },
  },
  {
    guards: {
      isVertical: (ctx) => ctx.isVertical,
      isHorizontal: (ctx) => ctx.isHorizontal,
      selectOnFocus: (ctx) => ctx.activationMode === "automatic",
    },
    actions: {
      setupDocument(ctx, evt) {
        ctx.uid = evt.id
        if (evt.doc) ctx.doc = ref(evt.doc)
      },
      setFocusedValue(ctx, evt) {
        ctx.focusedValue = evt.value
      },
      clearFocusedValue(ctx) {
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
          if (!ctx.isIndicatorRendered || !ctx.value) return
          ctx.indicatorRect = dom.getRectById(ctx, ctx.value)
          if (ctx.hasMeasuredRect) return
          nextTick(() => {
            ctx.hasMeasuredRect = true
          })
        })
      },
      checkRenderedElements(ctx) {
        nextTick(() => {
          ctx.isIndicatorRendered = !!dom.getIndicatorEl(ctx)
        })
      },
      clearMeasured(ctx) {
        ctx.hasMeasuredRect = false
      },
      invokeOnChange(ctx) {
        ctx.onChange?.(ctx.value)
      },
      invokeOnFocus(ctx) {
        ctx.onFocus?.(ctx.focusedValue)
      },
      setPrevSelectedTabs(ctx) {
        if (ctx.value != null) {
          const newSelected = Array.from(ctx.previousValues).concat(ctx.value)
          ctx.previousValues = Array.from(new Set(newSelected))
        }
      },
      // if tab panel contains focusable elements, remove the tabindex attribute
      setTabPanelTabIndex(ctx) {
        nextTick(() => {
          const panel = dom.getActiveTabPanelEl(ctx)
          if (!panel) return
          const focusables = getFocusables(panel)
          if (focusables.length > 0) {
            panel.removeAttribute("tabindex")
          } else {
            panel.setAttribute("tabindex", "0")
          }
        })
      },
    },
  },
)
