import { ariaAttr, dataAttr, getEventKey, getEventTarget, isModifierKey, isPrintableKey } from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./menubar.anatomy"
import * as dom from "./menubar.dom"
import type { MenubarApi, MenubarService, RootState } from "./menubar.types"

export function connect<T extends PropTypes>(service: MenubarService, normalize: NormalizeProps<T>): MenubarApi<T> {
  const { context, send, prop, scope } = service

  const hasOpenMenu = context.get("hasOpenMenu")
  const activeId = context.get("activeId")
  const orientation = prop("orientation")
  const isHorizontal = orientation === "horizontal"
  const disabled = !!prop("disabled")

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getRootState(): RootState {
    return { hasOpenMenu, disabled, orientation }
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

  return {
    hasOpenMenu,
    orientation,
    disabled,

    getMenuContext() {
      return { rootId: dom.getRootId(scope), disabled, orientation, activeId }
    },

    getRootState,
    getRootProps() {
      const rootState = getRootState()
      return normalize.element({
        ...parts.root.attrs(scope.id),
        id: dom.getRootId(scope),
        role: "menubar",
        dir: prop("dir"),
        "aria-orientation": rootState.orientation,
        "data-orientation": rootState.orientation,
        "aria-disabled": ariaAttr(rootState.disabled),
        "data-disabled": dataAttr(rootState.disabled),
        // Explicit "true"/"false" so menu triggers can read it via `dataset.hasOpenMenu`.
        "data-has-open-menu": rootState.hasOpenMenu ? "true" : "false",
        onKeyDown(event) {
          if (event.defaultPrevented || disabled) return
          const target = getEventTarget<HTMLElement>(event)
          // Only handle navigation when focus is on a menubar trigger. Open-menu content
          // is portalled outside the root, so its keys never reach here.
          if (!dom.isTriggerEl(target)) return

          const keyMap: EventKeyMap = {
            ArrowRight() {
              if (isHorizontal) send({ type: "TRIGGER.FOCUS_NEXT" })
            },
            ArrowLeft() {
              if (isHorizontal) send({ type: "TRIGGER.FOCUS_PREV" })
            },
            ArrowDown() {
              if (!isHorizontal) send({ type: "TRIGGER.FOCUS_NEXT" })
            },
            ArrowUp() {
              if (!isHorizontal) send({ type: "TRIGGER.FOCUS_PREV" })
            },
            Home() {
              send({ type: "TRIGGER.FOCUS_FIRST" })
            },
            End() {
              send({ type: "TRIGGER.FOCUS_LAST" })
            },
          }

          const exec = keyMap[getEventKey(event, { dir: prop("dir"), orientation })]
          if (exec) {
            exec(event)
            event.preventDefault()
            return
          }

          // Typeahead: jump to the trigger whose label matches the typed key(s).
          if (isPrintableKey(event) && !isModifierKey(event)) {
            send({ type: "TYPEAHEAD", key: event.key })
            event.preventDefault()
          }
        },
      })
    },
  }
}
