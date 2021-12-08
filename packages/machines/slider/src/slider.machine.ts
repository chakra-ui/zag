import { createMachine, ref } from "@ui-machines/core"
import { nextTick, trackPointerMove } from "@ui-machines/dom-utils"
import { clamp, decrement, increment, snapToStep } from "@ui-machines/number-utils"
import { getElementRect } from "@ui-machines/rect-utils"
import { dom } from "./slider.dom"
import { MachineContext, MachineState } from "./slider.types"

export const machine = createMachine<MachineContext, MachineState>(
  {
    id: "slider-machine",
    initial: "unknown",
    context: {
      thumbSize: { width: 0, height: 0 },
      uid: "slider",
      disabled: false,
      threshold: 5,
      dir: "ltr",
      origin: "start",
      orientation: "horizontal",
      value: 0,
      step: 1,
      min: 0,
      max: 100,
    },

    computed: {
      isHorizontal: (ctx) => ctx.orientation === "horizontal",
      isVertical: (ctx) => ctx.orientation === "vertical",
      isRtl: (ctx) => ctx.orientation === "horizontal" && ctx.dir === "rtl",
    },

    created(ctx) {
      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range#value
      if (ctx.value == null) {
        ctx.value = ctx.max < ctx.min ? ctx.min : ctx.min + (ctx.max - ctx.min) / 2
      }
    },

    watch: {
      value: ["invokeOnChange", "dispatchChangeEvent"],
    },

    on: {
      STOP: "focus",
    },

    states: {
      unknown: {
        on: {
          SETUP: {
            target: "idle",
            actions: ["setupDocument", "setThumbSize"],
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
            actions: ["decrement"],
          },
          ARROW_RIGHT: {
            guard: "isHorizontal",
            actions: ["increment"],
          },
          ARROW_UP: {
            guard: "isVertical",
            actions: ["increment"],
          },
          ARROW_DOWN: {
            guard: "isVertical",
            actions: ["decrement"],
          },
          PAGE_UP: {
            actions: ["increment"],
          },
          PAGE_DOWN: {
            actions: ["decrement"],
          },
          HOME: {
            actions: ["setToMin"],
          },
          END: {
            actions: ["setToMax"],
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
        ctx.doc = ref(evt.doc)
        ctx.uid = evt.id
      },
      invokeOnChangeStart(ctx) {
        ctx.onChangeStart?.(ctx.value)
      },
      invokeOnChangeEnd(ctx) {
        ctx.onChangeEnd?.(ctx.value)
      },
      invokeOnChange(ctx) {
        ctx.onChange?.(ctx.value)
      },
      dispatchChangeEvent(ctx) {
        dom.dispatchChangeEvent(ctx)
      },
      setThumbSize(ctx) {
        nextTick(() => {
          const thumb = dom.getThumbEl(ctx)
          if (!thumb) return
          const { width, height } = getElementRect(thumb)
          ctx.thumbSize.width = width
          ctx.thumbSize.height = height
        })
      },
      setPointerValue(ctx, evt) {
        const value = dom.getValueFromPoint(ctx, evt.point)
        if (value == null) return
        ctx.value = value
      },
      focusThumb(ctx) {
        nextTick(() => dom.getThumbEl(ctx)?.focus())
      },
      decrement(ctx, evt) {
        let value = decrement(ctx.value, evt.step ?? ctx.step)
        value = parseFloat(snapToStep(value, ctx.step))
        ctx.value = clamp(value, ctx)
      },
      increment(ctx, evt) {
        let value = increment(ctx.value, evt.step ?? ctx.step)
        value = parseFloat(snapToStep(value, ctx.step))
        ctx.value = clamp(value, ctx)
      },
      setToMin(ctx) {
        ctx.value = ctx.min
      },
      setToMax(ctx) {
        ctx.value = ctx.max
      },
      setValue(ctx, evt) {
        ctx.value = evt.value
      },
    },
  },
)
