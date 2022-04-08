import { createMachine, ref } from "@zag-js/core"
import { nextTick, raf, trackFormReset, trackInputPropertyMutation, trackPointerMove } from "@zag-js/dom-utils"
import { dom } from "./slider.dom"
import { MachineContext, MachineState } from "./slider.types"
import { utils } from "./slider.utils"

export const machine = createMachine<MachineContext, MachineState>(
  {
    id: "slider-machine",
    initial: "unknown",
    context: {
      thumbSize: null,
      uid: "",
      disabled: false,
      threshold: 5,
      dir: "ltr",
      origin: "start",
      orientation: "horizontal",
      initialValue: null,
      value: 0,
      step: 1,
      min: 0,
      max: 100,
    },

    computed: {
      isHorizontal: (ctx) => ctx.orientation === "horizontal",
      isVertical: (ctx) => ctx.orientation === "vertical",
      isRtl: (ctx) => ctx.orientation === "horizontal" && ctx.dir === "rtl",
      isInteractive: (ctx) => !(ctx.disabled || ctx.readonly),
      hasMeasuredThumbSize: (ctx) => ctx.thumbSize !== null,
    },

    watch: {
      value: ["invokeOnChange", "dispatchChangeEvent"],
    },

    activities: ["trackFormReset", "trackScriptedUpdate"],

    on: {
      SET_VALUE: {
        actions: "setValue",
      },
      INCREMENT: {
        actions: "increment",
      },
      DECREMENT: {
        actions: "decrement",
      },
    },

    states: {
      unknown: {
        on: {
          SETUP: {
            target: "idle",
            actions: ["setupDocument", "setThumbSize", "checkValue"],
          },
        },
      },

      idle: {
        on: {
          POINTER_DOWN: {
            target: "dragging",
            actions: ["setPointerValue", "invokeOnChangeStart", "focusThumb"],
          },
          FOCUS: "focus",
        },
      },

      focus: {
        entry: "focusThumb",
        on: {
          POINTER_DOWN: {
            target: "dragging",
            actions: ["setPointerValue", "invokeOnChangeStart", "focusThumb"],
          },
          ARROW_LEFT: {
            guard: "isHorizontal",
            actions: "decrement",
          },
          ARROW_RIGHT: {
            guard: "isHorizontal",
            actions: "increment",
          },
          ARROW_UP: {
            guard: "isVertical",
            actions: "increment",
          },
          ARROW_DOWN: {
            guard: "isVertical",
            actions: "decrement",
          },
          PAGE_UP: {
            actions: "increment",
          },
          PAGE_DOWN: {
            actions: "decrement",
          },
          HOME: {
            actions: "setToMin",
          },
          END: {
            actions: "setToMax",
          },
          BLUR: "idle",
        },
      },

      dragging: {
        entry: "focusThumb",
        activities: "trackPointerMove",
        on: {
          POINTER_UP: {
            target: "focus",
            actions: "invokeOnChangeEnd",
          },
          POINTER_MOVE: {
            actions: "setPointerValue",
          },
        },
      },
    },
  },
  {
    guards: {
      isHorizontal: (ctx) => ctx.isHorizontal,
      isVertical: (ctx) => ctx.isVertical,
    },

    activities: {
      trackScriptedUpdate(ctx, _, { send }) {
        let cleanup: VoidFunction | undefined
        nextTick(() => {
          const el = dom.getInputEl(ctx)
          if (!el) return
          cleanup = trackInputPropertyMutation(el, {
            type: "input",
            property: "value",
            fn(value) {
              send({ type: "SET_VALUE", value: parseFloat(value) })
            },
          })
        })
        return () => cleanup?.()
      },
      trackFormReset(ctx) {
        let cleanup: VoidFunction | undefined
        nextTick(() => {
          const el = dom.getInputEl(ctx)
          if (!el) return
          cleanup = trackFormReset(el, () => {
            if (ctx.initialValue != null) ctx.value = ctx.initialValue
          })
        })
        return cleanup
      },
      trackPointerMove(ctx, _evt, { send }) {
        return trackPointerMove({
          ctx,
          onPointerMove(info) {
            send({ type: "POINTER_MOVE", point: info.point })
          },
          onPointerUp() {
            send("POINTER_UP")
          },
        })
      },
    },

    actions: {
      setupDocument(ctx, evt) {
        if (evt.doc) ctx.doc = ref(evt.doc)
        ctx.uid = evt.id
      },
      checkValue(ctx) {
        const value = utils.convert(ctx, ctx.value)
        Object.assign(ctx, { value, initialValue: value })
      },
      invokeOnChangeStart(ctx) {
        ctx.onChangeStart?.({ value: ctx.value })
      },
      invokeOnChangeEnd(ctx) {
        ctx.onChangeEnd?.({ value: ctx.value })
      },
      invokeOnChange(ctx) {
        ctx.onChange?.({ value: ctx.value })
      },
      dispatchChangeEvent(ctx) {
        dom.dispatchChangeEvent(ctx)
      },
      setThumbSize(ctx) {
        raf(() => {
          const el = dom.getThumbEl(ctx)
          if (!el) return
          ctx.thumbSize = { width: el.offsetWidth, height: el.offsetHeight }
        })
      },
      setPointerValue(ctx, evt) {
        const value = dom.getValueFromPoint(ctx, evt.point)
        if (value == null) return
        ctx.value = utils.clamp(ctx, value)
      },
      focusThumb(ctx) {
        nextTick(() => dom.getThumbEl(ctx)?.focus())
      },
      decrement(ctx, evt) {
        ctx.value = utils.decrement(ctx, evt.step)
      },
      increment(ctx, evt) {
        ctx.value = utils.increment(ctx, evt.step)
      },
      setToMin(ctx) {
        ctx.value = ctx.min
      },
      setToMax(ctx) {
        ctx.value = ctx.max
      },
      setValue(ctx, evt) {
        ctx.value = utils.convert(ctx, evt.value)
      },
    },
  },
)
