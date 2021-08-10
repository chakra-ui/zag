import { createMachine, preserve } from "@ui-machines/core"
import { nextTick } from "@core-foundation/utils"
import { WithDOM } from "../type-utils"
import { getElements } from "./rating.dom"

export type RatingMachineContext = WithDOM<{
  name?: string
  value: number
  hoveredValue: number
  readonly?: boolean
  disabled?: boolean
  allowHalf?: boolean
  autofocus?: boolean
  getLabelText?(value: number): string
}>

export type RatingMachineState = {
  value: "mounted" | "idle" | "interacting"
}

export const ratingMachine = createMachine<RatingMachineContext, RatingMachineState>(
  {
    initial: "mounted",
    context: {
      uid: "rating-input",
      value: -1,
      hoveredValue: -1,
    },
    states: {
      mounted: {
        on: {
          SETUP: {
            target: "idle",
            actions: ["setOwnerDocument", "setId"],
          },
        },
      },
      idle: {
        entry: "clearHoveredValue",
        on: {
          GROUP_POINTER_OVER: "interacting",
          FOCUS: [
            {
              target: "interacting",
              actions: "setHoveredValue",
              cond: "isHoveredValueEmpty",
            },
            { target: "interacting" },
          ],
        },
      },
      interacting: {
        on: {
          POINTER_OVER: {
            actions: "setHoveredValue",
          },
          GROUP_POINTER_LEAVE: {
            actions: "clearHoveredValue",
          },
          BLUR: "idle",
          CLICK: {
            actions: ["setValue", "focusActiveRadio"],
          },
          SPACE: {
            cond: "isValueEmpty",
            actions: "setValue",
          },
          ARROW_LEFT: {
            actions: ["setPrevValue", "focusActiveRadio"],
          },
          ARROW_RIGHT: {
            actions: ["setNextValue", "focusActiveRadio"],
          },
          GO_TO_MIN: {
            actions: ["setValueToMin", "focusActiveRadio"],
          },
          GO_TO_MAX: {
            actions: ["setValueToMax", "focusActiveRadio"],
          },
        },
      },
    },
  },
  {
    guards: {
      isRtl: (ctx) => ctx.direction === "rtl",
      isInteractive: (ctx) => !(ctx.disabled || ctx.readonly),
      isHoveredValueEmpty: (ctx) => ctx.hoveredValue === -1,
      isValueEmpty: (ctx) => ctx.value === -1,
    },
    actions: {
      setId(ctx, evt) {
        ctx.uid = evt.uid
      },
      setOwnerDocument(ctx, evt) {
        ctx.doc = preserve(evt.doc)
      },
      clearHoveredValue(ctx) {
        ctx.hoveredValue = -1
      },
      focusActiveRadio(ctx) {
        const { radio } = getElements(ctx)
        nextTick(() => radio?.focus())
      },
      setPrevValue(ctx) {
        const factor = ctx.allowHalf ? 0.5 : 1
        ctx.value = Math.max(factor, ctx.value - factor)
      },
      setNextValue(ctx) {
        const factor = ctx.allowHalf ? 0.5 : 1
        ctx.value = Math.min(5, ctx.value + factor)
      },
      setValueToMin(ctx) {
        ctx.value = 1
      },
      setValueToMax(ctx) {
        ctx.value = 5
      },
      setValue(ctx) {
        ctx.value = ctx.hoveredValue
      },
      setHoveredValue(ctx, evt) {
        const factor = ctx.allowHalf && evt.isMidway ? 0.5 : 0
        ctx.hoveredValue = evt.index - factor
      },
    },
  },
)
