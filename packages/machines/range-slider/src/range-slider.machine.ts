import { createMachine, ref } from "@zag-js/core"
import { nextTick, raf, trackFormReset, trackInputPropertyMutation, trackPointerMove } from "@zag-js/dom-utils"
import { multiply } from "@zag-js/number-utils"
import { getElementRect } from "@zag-js/rect-utils"
import { isNumber } from "@zag-js/utils"
import { dom, getClosestIndex } from "./range-slider.dom"
import { MachineContext, MachineState } from "./range-slider.types"
import { utils } from "./range-slider.utils"

export const machine = createMachine<MachineContext, MachineState>(
  {
    id: "range-slider",
    initial: "unknown",

    context: {
      thumbSize: null,
      uid: "48",
      threshold: 5,
      activeIndex: -1,
      min: 0,
      max: 100,
      step: 1,
      value: [0, 100],
      initialValue: [],
      orientation: "horizontal",
      dir: "ltr",
      minStepsBetweenThumbs: 0,
    },

    computed: {
      isHorizontal: (ctx) => ctx.orientation === "horizontal",
      isVertical: (ctx) => ctx.orientation === "vertical",
      isRtl: (ctx) => ctx.orientation === "horizontal" && ctx.dir === "rtl",
      isInteractive: (ctx) => !(ctx.readonly || ctx.disabled),
      spacing: (ctx) => multiply(ctx.minStepsBetweenThumbs, ctx.step),
      hasMeasuredThumbSize: (ctx) => ctx.thumbSize != null,
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
        actions: "incrementAtIndex",
      },
      DECREMENT: {
        actions: "decrementAtIndex",
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
            actions: ["setActiveIndex", "invokeOnChangeStart", "setPointerValue", "focusActiveThumb"],
          },
          FOCUS: {
            target: "focus",
            actions: "setActiveIndex",
          },
        },
      },
      focus: {
        entry: "focusActiveThumb",
        on: {
          POINTER_DOWN: {
            target: "dragging",
            actions: ["setActiveIndex", "invokeOnChangeStart", "setPointerValue", "focusActiveThumb"],
          },
          ARROW_LEFT: {
            guard: "isHorizontal",
            actions: "decrementAtIndex",
          },
          ARROW_RIGHT: {
            guard: "isHorizontal",
            actions: "incrementAtIndex",
          },
          ARROW_UP: {
            guard: "isVertical",
            actions: "incrementAtIndex",
          },
          ARROW_DOWN: {
            guard: "isVertical",
            actions: "decrementAtIndex",
          },
          PAGE_UP: {
            actions: "incrementAtIndex",
          },
          PAGE_DOWN: {
            actions: "decrementAtIndex",
          },
          HOME: {
            actions: "setActiveThumbToMin",
          },
          END: {
            actions: "setActiveThumbToMax",
          },
          BLUR: {
            target: "idle",
            actions: "clearActiveIndex",
          },
        },
      },
      dragging: {
        entry: "focusActiveThumb",
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
        let cleanup: Array<VoidFunction | undefined> = []
        nextTick(() => {
          for (let i = 0; i < ctx.value.length; i++) {
            const el = dom.getInputEl(ctx, i)
            if (!el) return
            cleanup.push(
              trackInputPropertyMutation(el, {
                type: "input",
                property: "value",
                fn(value) {
                  send({ type: "SET_VALUE", value: parseFloat(value), index: i })
                },
              }),
            )
          }
        })
        return () => cleanup.forEach((fn) => fn?.())
      },
      trackFormReset(ctx) {
        let cleanup: Array<VoidFunction | undefined> = []
        nextTick(() => {
          for (let i = 0; i < ctx.value.length; i++) {
            const el = dom.getInputEl(ctx, i)
            cleanup.push(
              trackFormReset(el, () => {
                if (ctx.initialValue[i] != null) {
                  ctx.value[i] = ctx.initialValue[i]
                }
              }),
            )
          }
        })
        return () => cleanup.forEach((fn) => fn?.())
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
      invokeOnChangeStart(ctx) {
        ctx.onChangeStart?.(ctx.value)
      },
      invokeOnChangeEnd(ctx) {
        ctx.onChangeEnd?.(ctx.value)
      },
      invokeOnChange(ctx, evt) {
        if (evt.type !== "SETUP") {
          ctx.onChange?.(ctx.value)
        }
      },
      dispatchChangeEvent(ctx, evt) {
        if (evt.type !== "SETUP") {
          dom.dispatchChangeEvent(ctx)
        }
      },
      setThumbSize(ctx) {
        raf(() => {
          const thumbs = dom.getElements(ctx)
          ctx.thumbSize = thumbs.map((thumb) => {
            const { width, height } = getElementRect(thumb)
            return { width, height }
          })
        })
      },
      setActiveIndex(ctx, evt) {
        ctx.activeIndex = evt.index ?? getClosestIndex(ctx, evt)
      },
      clearActiveIndex(ctx) {
        ctx.activeIndex = -1
      },
      setPointerValue(ctx, evt) {
        const value = dom.getValueFromPoint(ctx, evt.point)
        if (value == null) return
        ctx.value[ctx.activeIndex] = utils.convert(ctx, value, ctx.activeIndex)
      },
      focusActiveThumb(ctx) {
        nextTick(() => {
          const thumb = dom.getThumbEl(ctx, ctx.activeIndex)
          thumb?.focus()
        })
      },
      decrementAtIndex(ctx, evt) {
        ctx.value[ctx.activeIndex] = utils.decrement(ctx, evt.index, evt.step)
      },
      incrementAtIndex(ctx, evt) {
        ctx.value[ctx.activeIndex] = utils.increment(ctx, evt.index, evt.step)
      },
      setActiveThumbToMin(ctx) {
        const { min } = utils.getRangeAtIndex(ctx)
        ctx.value[ctx.activeIndex] = min
      },
      setActiveThumbToMax(ctx) {
        const { max } = utils.getRangeAtIndex(ctx)
        ctx.value[ctx.activeIndex] = max
      },
      checkValue(ctx) {
        let value = utils.check(ctx, ctx.value)
        Object.assign(ctx, { value, initialValue: value.slice() })
      },
      setValue(ctx, evt) {
        // set value at specified index
        if (isNumber(evt.index) && isNumber(evt.value)) {
          ctx.value[evt.index] = utils.convert(ctx, evt.value, evt.index)
          return
        }

        // set values
        if (Array.isArray(evt.value)) {
          ctx.value = utils.check(ctx, evt.value)
        }
      },
    },
  },
)
