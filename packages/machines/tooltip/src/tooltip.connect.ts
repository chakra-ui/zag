import { StateMachine as S } from "@ui-machines/core"
import { dataAttr, visuallyHiddenStyle } from "@ui-machines/dom-utils"
import { getPlacementStyles } from "@ui-machines/popper"
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
  const hasAriaLabel = state.context.hasAriaLabel

  const isOpen = state.hasTag("open")

  const triggerId = dom.getTriggerId(state.context)
  const contentId = dom.getContentId(state.context)

  const popperStyles = getPlacementStyles({
    measured: !!state.context.isPlacementComplete,
  })

  return {
    isOpen,
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
      "data-expanded": dataAttr(isOpen),
      "aria-describedby": isOpen ? contentId : undefined,
      onClick() {
        send("CLICK")
      },
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
      onPointerCancel() {
        send("POINTER_LEAVE")
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
      role: hasAriaLabel ? undefined : "tooltip",
      id: hasAriaLabel ? undefined : contentId,
      "data-placement": state.context.currentPlacement,
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
      children: state.context["aria-label"],
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
