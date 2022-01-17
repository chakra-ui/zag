import { StateMachine as S } from "@ui-machines/core"
import { EventKeyMap, isFocusable, isTabbable, validateBlur } from "@ui-machines/dom-utils"
import { PLACEMENT_STYLE } from "@ui-machines/popper"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { dom } from "./popover.dom"
import type { MachineContext, MachineState } from "./popover.types"

export function connect<T extends PropTypes = ReactPropTypes>(
  state: S.State<MachineContext, MachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const { context: ctx } = state
  const isOpen = state.matches("open")

  return {
    isOpen,
    portalled: ctx.__portalled,

    open() {
      send("OPEN")
    },
    close() {
      send("CLOSE")
    },

    arrowProps: normalize.element<T>({
      id: dom.getArrowId(ctx),
      "data-part": "arrow",
      style: PLACEMENT_STYLE.arrow(),
    }),

    innerArrowProps: normalize.element<T>({
      "data-part": "arrow--inner",
      style: PLACEMENT_STYLE.innerArrow(),
    }),

    anchorProps: normalize.element<T>({
      "data-part": "anchor",
      id: dom.getAnchorId(ctx),
    }),

    triggerProps: normalize.button<T>({
      "data-part": "trigger",
      "data-placement": ctx.__placement,
      id: dom.getTriggerId(ctx),
      "aria-haspopup": "dialog",
      "aria-expanded": isOpen,
      "aria-controls": dom.getContentId(ctx),
      onClick() {
        send("TRIGGER_CLICK")
      },
    }),

    contentProps: normalize.element<T>({
      "data-part": "popover",
      id: dom.getContentId(ctx),
      tabIndex: -1,
      role: "dialog",
      hidden: !isOpen,
      "aria-labelledby": dom.getHeaderId(ctx),
      "aria-describedby": dom.getBodyId(ctx),
      style: PLACEMENT_STYLE.floating(),
      "data-placement": ctx.__placement,
      onKeyDown(event) {
        const keyMap: EventKeyMap = {
          Escape(event) {
            send("ESCAPE")
            event.stopPropagation()
          },
          Tab(event) {
            const type = event.shiftKey ? "SHIFT_TAB" : "TAB"
            send({
              type,
              preventDefault() {
                event.preventDefault()
              },
            })
          },
        }

        const exec = keyMap[event.key]
        exec?.(event)
      },
      onBlur(event) {
        const isValidBlur = validateBlur(event, {
          exclude: [dom.getTriggerEl(ctx), dom.getContentEl(ctx)],
          fallback: ctx.pointerdownNode,
        })

        const el = (event.relatedTarget ?? ctx.pointerdownNode) as HTMLElement
        const focusable = isTabbable(el) || isFocusable(el)

        if (isValidBlur) {
          send({ type: "INTERACT_OUTSIDE", focusable })
        }
      },
    }),

    headerProps: normalize.element<T>({
      "data-part": "header",
      id: dom.getHeaderId(ctx),
    }),

    bodyProps: normalize.element<T>({
      "data-part": "body",
      id: dom.getBodyId(ctx),
    }),

    closeButtonProps: normalize.button<T>({
      "data-part": "close-button",
      id: dom.getCloseButtonId(ctx),
      type: "button",
      "aria-label": "Close",
      onClick() {
        send("CLOSE")
      },
    }),
  }
}
