import { createMachine, guards, ref } from "@ui-machines/core"
import { nextTick } from "@ui-machines/dom-utils"
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
      prevValues: ref([]),
      indicatorRect: { left: "0px", top: "0px", width: "0px", height: "0px" },
      measuredRect: false,
      loop: true,
    },

    computed: {
      isHorizontal: (ctx) => ctx.orientation === "horizontal",
      isVertical: (ctx) => ctx.orientation === "vertical",
    },

    created(ctx) {
      if (Boolean(ctx.value)) {
        ctx.prevValues = Array.from(new Set(ctx.prevValues.concat(ctx.value!)))
      }
    },

    watch: {
      focusedValue: "invokeOnFocus",
      value: ["invokeOnChange", "setPrevSelectedTabs"],
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
            actions: "setupDocument",
          },
        },
      },
      idle: {
        entry: "setIndicatorRect",
        on: {
          TAB_FOCUS: {
            target: "focused",
            actions: "setFocusedValue",
          },
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
        ctx.doc = ref(evt.doc)
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
      setPrevSelectedTabs(ctx) {
        if (Boolean(ctx.value)) {
          ctx.prevValues = Array.from(new Set(ctx.prevValues.concat(ctx.value!)))
        }
      },
    },
  },
)
