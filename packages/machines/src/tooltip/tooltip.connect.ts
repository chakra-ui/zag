import { StateMachine as S } from "@ui-machines/core"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/prop-types"
import { dataAttr, getEventKey } from "../utils"
import type { EventKeyMap } from "../utils/types"
import { dom } from "./tooltip.dom"
import { tooltipStore } from "./tooltip.store"
import { TooltipMachineContext, TooltipMachineState } from "./tooltip.types"

export function tooltipConnect<T extends PropTypes = ReactPropTypes>(
  state: S.State<TooltipMachineContext, TooltipMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const { context: ctx } = state

  const isVisible = state.matches("open", "closing")

  const triggerId = dom.getTriggerId(ctx)
  const tooltipId = dom.getTooltipId(ctx)

  return {
    getAnimationState() {
      return {
        enter: tooltipStore.prevId === null && ctx.id === tooltipStore.id,
        exit: tooltipStore.id === null,
      }
    },

    isVisible,

    triggerProps: normalize.button<T>({
      id: triggerId,
      "data-expanded": dataAttr(isVisible),
      "aria-describedby": isVisible ? tooltipId : undefined,
      "data-controls": "tooltip",
      onFocus() {
        send("FOCUS")
      },
      onBlur() {
        if (ctx.id === tooltipStore.id) {
          send("BLUR")
        }
      },
      onPointerDown() {
        if (ctx.id === tooltipStore.id) {
          send("POINTER_DOWN")
        }
      },
      onPointerMove() {
        send("POINTER_ENTER")
      },
      onPointerLeave() {
        send("POINTER_LEAVE")
      },
      onKeyDown(event) {
        const keymap: EventKeyMap = {
          Enter() {
            send("PRESS_ENTER")
          },
          Space() {
            send("PRESS_ENTER")
          },
        }
        const key = getEventKey(event)
        const exec = keymap[key]
        if (exec) exec(event)
      },
    }),

    tooltipProps: normalize.element<T>({
      role: "tooltip",
      id: tooltipId,
      onPointerEnter() {
        send("TOOLTIP_POINTER_ENTER")
      },
      onPointerLeave() {
        send("TOOLTIP_POINTER_LEAVE")
      },
      style: {
        pointerEvents: ctx.interactive ? "auto" : "none",
      },
    }),

    setupPortal() {
      const doc = dom.getDoc(ctx)
      const exist = dom.getPortalEl(ctx)
      if (exist) return exist
      const portal = dom.createPortalEl(ctx)
      doc.body.appendChild(portal)
      return portal
    },
  }
}
