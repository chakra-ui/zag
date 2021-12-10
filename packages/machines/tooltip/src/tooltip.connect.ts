import { StateMachine as S } from "@ui-machines/core"
import { dataAttr, EventKeyMap, getEventKey, visuallyHiddenStyle } from "@ui-machines/dom-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { dom } from "./tooltip.dom"
import { store } from "./tooltip.store"
import { MachineContext, MachineState } from "./tooltip.types"

export function connect<T extends PropTypes = ReactPropTypes>(
  state: S.State<MachineContext, MachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const { context: ctx } = state

  const isVisible = state.matches("open", "closing")

  const triggerId = dom.getTriggerId(ctx)
  const tooltipId = dom.getTooltipId(ctx)

  return {
    isVisible,
    hasAriaLabel: ctx.hasAriaLabel,

    getAnimationState() {
      return {
        enter: store.prevId === null && ctx.id === store.id,
        exit: store.id === null,
      }
    },

    triggerProps: normalize.button<T>({
      "data-part": "trigger",
      id: triggerId,
      "data-expanded": dataAttr(isVisible),
      "aria-describedby": isVisible ? tooltipId : undefined,
      "data-controls": "tooltip",
      onFocus() {
        send("FOCUS")
      },
      onBlur() {
        if (ctx.id === store.id) {
          send("BLUR")
        }
      },
      onPointerDown() {
        if (ctx.id === store.id) {
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
        if (exec) {
          exec(event)
        }
      },
    }),

    contentProps: normalize.element<T>({
      "data-part": "content",
      role: ctx.hasAriaLabel ? undefined : "tooltip",
      id: ctx.hasAriaLabel ? undefined : tooltipId,
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

    labelProps: normalize.element<T>({
      "data-part": "label",
      id: tooltipId,
      role: "tooltip",
      style: visuallyHiddenStyle,
    }),

    createPortal() {
      const doc = dom.getDoc(ctx)
      const exist = dom.getPortalEl(ctx)
      if (exist) return exist
      const portal = dom.createPortalEl(ctx)
      doc.body.appendChild(portal)
      return portal
    },
  }
}
