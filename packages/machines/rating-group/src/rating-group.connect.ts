import { ariaAttr, dataAttr, getEventKey, getEventPoint, getRelativePoint, isLeftClick } from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import * as dom from "./rating-group.dom"
import { parts } from "./rating-group.anatomy"
import type { ItemProps, ItemState, RatingGroupApi, RatingGroupService } from "./rating-group.types"

export function connect<T extends PropTypes>(
  service: RatingGroupService,
  normalize: NormalizeProps<T>,
): RatingGroupApi<T> {
  const { context, send, prop, scope, computed } = service

  const interactive = computed("isInteractive")
  const disabled = computed("isDisabled")
  const readOnly = !!prop("readOnly")
  const required = !!prop("required")
  const value = context.get("value")
  const hoveredValue = context.get("hoveredValue")
  const translations = prop("translations")

  function getItemState(props: ItemProps): ItemState {
    const currentValue = computed("isHovering") ? hoveredValue : value
    const equal = Math.ceil(currentValue) === props.index
    const highlighted = props.index <= currentValue || equal
    const half = equal && Math.abs(currentValue - props.index) === 0.5

    return {
      highlighted,
      half,
      checked: equal || (value === -1 && props.index === 1),
    }
  }

  return {
    hovering: computed("isHovering"),
    value,
    hoveredValue,
    count: prop("count"),
    items: Array.from({ length: prop("count") }).map((_, index) => index + 1),

    setValue(value) {
      send({ type: "SET_VALUE", value })
    },
    clearValue() {
      send({ type: "CLEAR_VALUE" })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        dir: prop("dir"),
        id: dom.getRootId(scope),
      })
    },

    getHiddenInputProps() {
      return normalize.input({
        name: prop("name"),
        form: prop("form"),
        type: "text",
        hidden: true,
        disabled,
        readOnly,
        required: prop("required"),
        id: dom.getHiddenInputId(scope),
        defaultValue: value,
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        dir: prop("dir"),
        id: dom.getLabelId(scope),
        "data-disabled": dataAttr(disabled),
        "data-required": dataAttr(required),
        htmlFor: dom.getHiddenInputId(scope),
        onClick(event) {
          if (event.defaultPrevented) return
          if (!interactive) return
          event.preventDefault()
          const radioEl = dom.getRadioEl(scope, Math.max(1, context.get("value")))
          radioEl?.focus({ preventScroll: true })
        },
      })
    },

    getControlProps() {
      return normalize.element({
        id: dom.getControlId(scope),
        ...parts.control.attrs,
        dir: prop("dir"),
        role: "radiogroup",
        "aria-orientation": "horizontal",
        "aria-labelledby": dom.getLabelId(scope),
        "aria-readonly": ariaAttr(readOnly),
        "data-readonly": dataAttr(readOnly),
        "data-disabled": dataAttr(disabled),
        onPointerMove(event) {
          if (!interactive) return
          if (event.pointerType === "touch") return
          send({ type: "GROUP_POINTER_OVER" })
        },
        onPointerLeave(event) {
          if (!interactive) return
          if (event.pointerType === "touch") return
          send({ type: "GROUP_POINTER_LEAVE" })
        },
      })
    },

    getItemState,

    getItemProps(props) {
      const { index } = props
      const itemState = getItemState(props)
      const valueText = translations.ratingValueText(index)

      return normalize.element({
        ...parts.item.attrs,
        dir: prop("dir"),
        id: dom.getItemId(scope, index.toString()),
        role: "radio",
        tabIndex: (() => {
          if (readOnly) return itemState.checked ? 0 : undefined
          if (disabled) return undefined
          return itemState.checked ? 0 : -1
        })(),
        "aria-roledescription": "rating",
        "aria-label": valueText,
        "aria-disabled": disabled,
        "data-disabled": dataAttr(disabled),
        "data-readonly": dataAttr(readOnly),
        "aria-setsize": prop("count"),
        "aria-checked": itemState.checked,
        "data-checked": dataAttr(itemState.checked),
        "aria-posinset": index,
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-half": dataAttr(itemState.half),
        onPointerDown(event) {
          if (!interactive) return
          if (!isLeftClick(event)) return
          event.preventDefault()
        },
        onPointerMove(event) {
          if (!interactive) return
          const point = getEventPoint(event)
          const relativePoint = getRelativePoint(point, event.currentTarget)
          const percentX = relativePoint.getPercentValue({
            orientation: "horizontal",
            dir: prop("dir"),
          })
          const isMidway = percentX < 0.5
          send({ type: "POINTER_OVER", index, isMidway })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (!interactive) return

          const keyMap: EventKeyMap = {
            ArrowLeft() {
              send({ type: "ARROW_LEFT" })
            },
            ArrowRight() {
              send({ type: "ARROW_RIGHT" })
            },
            ArrowUp() {
              send({ type: "ARROW_LEFT" })
            },
            ArrowDown() {
              send({ type: "ARROW_RIGHT" })
            },
            Space() {
              send({ type: "SPACE", value: index })
            },
            Home() {
              send({ type: "HOME" })
            },
            End() {
              send({ type: "END" })
            },
          }

          const key = getEventKey(event, { dir: prop("dir") })
          const exec = keyMap[key]

          if (exec) {
            event.preventDefault()
            exec(event)
          }
        },
        onClick() {
          if (!interactive) return
          send({ type: "CLICK", value: index })
        },
        onFocus() {
          if (!interactive) return
          send({ type: "FOCUS" })
        },
        onBlur() {
          if (!interactive) return
          send({ type: "BLUR" })
        },
      })
    },
  }
}
