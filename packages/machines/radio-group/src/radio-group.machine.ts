import { createMachine, guards } from "@zag-js/core"
import { nextTick } from "@zag-js/dom-query"
import { trackElementRect } from "@zag-js/element-rect"
import { dispatchInputCheckedEvent, trackFormControl } from "@zag-js/form-utils"
import { compact, isEqual, isString } from "@zag-js/utils"
import { dom } from "./radio-group.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./radio-group.types"

const { not } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "radio",
      initial: "idle",
      context: {
        value: null,
        activeId: null,
        focusedId: null,
        hoveredId: null,
        disabled: false,
        ...ctx,
        indicatorRect: {},
        canIndicatorTransition: false,
        fieldsetDisabled: false,
      },

      computed: {
        isDisabled: (ctx) => !!ctx.disabled || ctx.fieldsetDisabled,
      },

      entry: ["syncIndicatorRect"],

      exit: ["cleanupObserver"],

      activities: ["trackFormControlState"],

      watch: {
        value: ["setIndicatorTransition", "syncIndicatorRect", "syncInputElements"],
      },

      on: {
        SET_VALUE: [
          {
            guard: not("isTrusted"),
            actions: ["setValue", "dispatchChangeEvent"],
          },
          {
            actions: ["setValue"],
          },
        ],
        SET_HOVERED: {
          actions: "setHovered",
        },
        SET_ACTIVE: {
          actions: "setActive",
        },
        SET_FOCUSED: {
          actions: "setFocused",
        },
      },

      states: {
        idle: {},
      },
    },

    {
      guards: {
        isTrusted: (_ctx, evt) => !!evt.isTrusted,
      },
      activities: {
        trackFormControlState(ctx, _evt, { send, initialContext }) {
          return trackFormControl(dom.getRootEl(ctx), {
            onFieldsetDisabledChange(disabled) {
              ctx.fieldsetDisabled = disabled
            },
            onFormReset() {
              send({ type: "SET_VALUE", value: initialContext.value })
            },
          })
        },
      },

      actions: {
        setValue(ctx, evt) {
          set.value(ctx, evt.value)
        },
        setHovered(ctx, evt) {
          ctx.hoveredId = evt.value
        },
        setActive(ctx, evt) {
          ctx.activeId = evt.value
        },
        setFocused(ctx, evt) {
          ctx.focusedId = evt.value
        },
        syncInputElements(ctx) {
          const inputs = dom.getInputEls(ctx)
          inputs.forEach((input) => {
            input.checked = input.value === ctx.value
          })
        },
        setIndicatorTransition(ctx) {
          ctx.canIndicatorTransition = isString(ctx.value)
        },
        cleanupObserver(ctx) {
          ctx.indicatorCleanup?.()
        },
        syncIndicatorRect(ctx) {
          ctx.indicatorCleanup?.()

          if (!dom.getIndicatorEl(ctx)) return

          const value = ctx.value

          if (value == null) {
            ctx.indicatorRect = {}
            return
          }

          const radioEl = dom.getActiveRadioEl(ctx)
          if (!radioEl) return

          ctx.indicatorCleanup = trackElementRect(radioEl, {
            getRect(el) {
              return dom.getOffsetRect(el)
            },
            onChange(rect) {
              ctx.indicatorRect = dom.resolveRect(rect)
              nextTick(() => {
                ctx.canIndicatorTransition = false
              })
            },
          })
        },
        dispatchChangeEvent(ctx) {
          const inputEls = dom.getInputEls(ctx)
          inputEls.forEach((inputEl) => {
            const checked = inputEl.value === ctx.value
            if (checked === inputEl.checked) return
            dispatchInputCheckedEvent(inputEl, { checked })
          })
        },
      },
    },
  )
}

const invoke = {
  change: (ctx: MachineContext) => {
    if (ctx.value == null) return
    ctx.onChange?.({ value: ctx.value })
  },
}

const set = {
  value: (ctx: MachineContext, value: string) => {
    if (isEqual(ctx.value, value)) return
    ctx.value = value
    invoke.change(ctx)
  },
}
