import { StateMachine as S } from "@ui-machines/core"
import { dataAttr, EventKeyMap, getEventKey, visuallyHiddenStyle } from "@ui-machines/dom-utils"
import { getRecommendedStyles } from "@ui-machines/popper"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { dom } from "./tooltip.dom"
import { store } from "./tooltip.store"
import { MachineContext, MachineState } from "./tooltip.types"

export function connect<T extends PropTypes = ReactPropTypes>(
  state: S.State<MachineContext, MachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const id = state.context.id

  const isVisible = state.hasTag("visible")

  const triggerId = dom.getTriggerId(state.context)
  const contentId = dom.getContentId(state.context)

  const popperStyles = getRecommendedStyles({
    measured: !!state.context.isPlacementComplete,
  })

  return {
    isVisible,
    hasAriaLabel: state.context.hasAriaLabel,
    open() {
      send("OPEN")
    },
    close() {
      send("CLOSE")
    },
    getAnimationState() {
      return {
        enter: store.prevId === null && id === store.id,
        exit: store.id === null,
      }
    },

    triggerProps: normalize.button<T>({
      "data-part": "trigger",
      id: triggerId,
      "data-expanded": dataAttr(isVisible),
      "aria-describedby": isVisible ? contentId : undefined,
      "data-controls": "tooltip",
      onFocus() {
        send("FOCUS")
      },
      onBlur() {
        if (id === store.id) {
          send("BLUR")
        }
      },
      onPointerDown() {
        if (id === store.id) {
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

    arrowProps: normalize.element<T>({
      id: dom.getArrowId(state.context),
      "data-part": "arrow",
      style: popperStyles.arrow,
    }),

    innerArrowProps: normalize.element<T>({
      "data-part": "arrow-inner",
      style: popperStyles.innerArrow,
    }),

    positionerProps: normalize.element<T>({
      id: dom.getPositionerId(state.context),
      "data-part": "positioner",
      style: popperStyles.floating,
    }),

    contentProps: normalize.element<T>({
      "data-part": "content",
      role: state.context.hasAriaLabel ? undefined : "tooltip",
      id: state.context.hasAriaLabel ? undefined : contentId,
      onPointerEnter() {
        send("TOOLTIP_POINTER_ENTER")
      },
      onPointerLeave() {
        send("TOOLTIP_POINTER_LEAVE")
      },
      style: {
        pointerEvents: state.context.interactive ? "auto" : "none",
      },
    }),

    labelProps: normalize.element<T>({
      "data-part": "label",
      id: contentId,
      role: "tooltip",
      style: visuallyHiddenStyle,
    }),

    createPortal() {
      const doc = dom.getDoc(state.context)
      const exist = dom.getPortalEl(state.context)
      if (exist) return exist
      const portal = dom.createPortalEl(state.context)
      doc.body.appendChild(portal)
      return portal
    },
  }
}
