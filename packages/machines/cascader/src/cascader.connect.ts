import { dataAttr, getEventKey, isLeftClick } from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { Service } from "@zag-js/core"
import { parts } from "./cascader.anatomy"
import { dom } from "./cascader.dom"
import type { CascaderApi, CascaderSchema, ItemProps, ItemState, LevelProps } from "./cascader.types"

export function connect<T extends PropTypes>(
  service: Service<CascaderSchema>,
  normalize: NormalizeProps<T>,
): CascaderApi<T> {
  const { send, context, prop, scope, computed, state } = service

  const collection = prop("collection")
  const value = context.get("value")
  const open = state.hasTag("open")
  const focused = state.matches("focused")
  const highlightedPath = context.get("highlightedPath")
  const currentPlacement = context.get("currentPlacement")
  const isDisabled = computed("isDisabled")
  const isInteractive = computed("isInteractive")
  const valueText = computed("valueText")
  const levelDepth = computed("levelDepth")

  const popperStyles = getPlacementStyles({
    ...prop("positioning"),
    placement: currentPlacement,
  })

  return {
    collection,
    value,
    valueText,
    highlightedPath,
    open,
    focused,

    setValue(value: string[][]) {
      send({ type: "VALUE.SET", value })
    },

    setOpen(open: boolean) {
      if (open) {
        send({ type: "OPEN" })
      } else {
        send({ type: "CLOSE" })
      }
    },

    highlight(path: string[] | null) {
      send({ type: "HIGHLIGHTED_PATH.SET", value: path })
    },

    selectItem(value: string) {
      send({ type: "ITEM.SELECT", value })
    },

    clearValue() {
      send({ type: "VALUE.CLEAR" })
    },

    getLevelValues(level: number): string[] {
      return context.get("levelValues")[level] || []
    },

    getLevelDepth(): number {
      return levelDepth
    },

    getParentValue(level: number): string | null {
      const values = context.get("value")
      if (values.length === 0) return null

      // Use the most recent value path
      const mostRecentValue = values[values.length - 1]
      return mostRecentValue[level] || null
    },

    getItemState(props: ItemProps): ItemState {
      const { value: itemValue } = props
      const node = collection.findNode(itemValue)
      const indexPath = collection.getIndexPath(itemValue)
      const depth = indexPath ? indexPath.length : 0

      // Check if this item is highlighted (part of the highlighted path)
      const isHighlighted = highlightedPath ? highlightedPath.includes(itemValue) : false

      // Check if item is selected (part of any selected path)
      const isSelected = value.some((path) => path.includes(itemValue))

      return {
        value: itemValue,
        disabled: !!prop("isItemDisabled")?.(itemValue),
        highlighted: isHighlighted,
        selected: isSelected,
        hasChildren: node ? collection.isBranchNode(node) : false,
        depth,
      }
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(scope),
        "data-disabled": dataAttr(isDisabled),
        "data-readonly": dataAttr(prop("readOnly")),
        "data-invalid": dataAttr(prop("invalid")),
        "data-state": open ? "open" : "closed",
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        id: dom.getLabelId(scope),
        htmlFor: dom.getTriggerId(scope),
        "data-disabled": dataAttr(isDisabled),
        "data-readonly": dataAttr(prop("readOnly")),
        "data-invalid": dataAttr(prop("invalid")),
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        id: dom.getControlId(scope),
        "data-disabled": dataAttr(isDisabled),
        "data-readonly": dataAttr(prop("readOnly")),
        "data-invalid": dataAttr(prop("invalid")),
        "data-state": open ? "open" : "closed",
      })
    },

    getTriggerProps() {
      return normalize.button({
        ...parts.trigger.attrs,
        id: dom.getTriggerId(scope),
        type: "button",
        role: "combobox",
        "aria-controls": dom.getContentId(scope),
        "aria-expanded": open,
        "aria-haspopup": "listbox",
        "aria-labelledby": dom.getLabelId(scope),
        "aria-describedby": dom.getValueTextId(scope),
        "data-state": open ? "open" : "closed",
        "data-disabled": dataAttr(isDisabled),
        "data-readonly": dataAttr(prop("readOnly")),
        "data-invalid": dataAttr(prop("invalid")),
        disabled: isDisabled,
        onFocus() {
          if (!isInteractive) return
          send({ type: "TRIGGER.FOCUS" })
        },
        onBlur() {
          send({ type: "TRIGGER.BLUR" })
        },
        onClick(event) {
          if (!isInteractive) return
          if (!isLeftClick(event)) return
          send({ type: "TRIGGER.CLICK" })
        },
        onKeyDown(event) {
          if (!isInteractive) return
          const key = getEventKey(event)

          switch (key) {
            case "ArrowDown":
              event.preventDefault()
              send({ type: "TRIGGER.ARROW_DOWN" })
              break
            case "ArrowUp":
              event.preventDefault()
              send({ type: "TRIGGER.ARROW_UP" })
              break
            case "Enter":
            case " ":
              event.preventDefault()
              send({ type: "TRIGGER.ENTER" })
              break
            case "Escape":
              send({ type: "TRIGGER.ESCAPE" })
              break
          }
        },
      })
    },

    getIndicatorProps() {
      return normalize.element({
        ...parts.indicator.attrs,
        id: dom.getIndicatorId(scope),
        "data-state": open ? "open" : "closed",
        "data-disabled": dataAttr(isDisabled),
        "data-readonly": dataAttr(prop("readOnly")),
        "data-invalid": dataAttr(prop("invalid")),
      })
    },

    getValueTextProps() {
      return normalize.element({
        ...parts.valueText.attrs,
        id: dom.getValueTextId(scope),
        "data-disabled": dataAttr(isDisabled),
        "data-readonly": dataAttr(prop("readOnly")),
        "data-invalid": dataAttr(prop("invalid")),
        "data-placeholder": dataAttr(!value.length),
      })
    },

    getClearTriggerProps() {
      return normalize.button({
        ...parts.clearTrigger.attrs,
        id: dom.getClearTriggerId(scope),
        type: "button",
        "aria-label": "Clear value",
        hidden: !value.length,
        "data-disabled": dataAttr(isDisabled),
        "data-readonly": dataAttr(prop("readOnly")),
        "data-invalid": dataAttr(prop("invalid")),
        disabled: isDisabled,
        onClick(event) {
          if (!isInteractive) return
          if (!isLeftClick(event)) return
          send({ type: "VALUE.CLEAR" })
        },
      })
    },

    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs,
        id: dom.getPositionerId(scope),
        style: popperStyles.floating,
      })
    },

    getContentProps() {
      return normalize.element({
        ...parts.content.attrs,
        id: dom.getContentId(scope),
        role: "listbox",
        "aria-labelledby": dom.getLabelId(scope),
        "data-state": open ? "open" : "closed",
        hidden: !open,
        tabIndex: 0,
        onKeyDown(event) {
          if (!isInteractive) return
          const key = getEventKey(event)

          const keyMap: Record<string, () => void> = {
            ArrowDown() {
              send({ type: "CONTENT.ARROW_DOWN" })
            },
            ArrowUp() {
              send({ type: "CONTENT.ARROW_UP" })
            },
            ArrowRight() {
              send({ type: "CONTENT.ARROW_RIGHT" })
            },
            ArrowLeft() {
              send({ type: "CONTENT.ARROW_LEFT" })
            },
            Home() {
              send({ type: "CONTENT.HOME" })
            },
            End() {
              send({ type: "CONTENT.END" })
            },
            Enter() {
              send({ type: "CONTENT.ENTER" })
            },
            " "() {
              send({ type: "CONTENT.ENTER" })
            },
            Escape() {
              send({ type: "CONTENT.ESCAPE" })
            },
          }

          const exec = keyMap[key]
          if (exec) {
            exec()
            event.preventDefault()
          }
        },
      })
    },

    getLevelProps(props: LevelProps) {
      const { level } = props
      return normalize.element({
        ...parts.level.attrs,
        id: dom.getLevelId(scope, level),
        "data-level": level,
      })
    },

    getLevelContentProps(props: LevelProps) {
      const { level } = props
      return normalize.element({
        ...parts.levelContent.attrs,
        id: dom.getLevelContentId(scope, level),
        "data-level": level,
      })
    },

    getItemProps(props: ItemProps) {
      const { value: itemValue } = props
      const itemState = this.getItemState(props)

      return normalize.element({
        ...parts.item.attrs,
        id: dom.getItemId(scope, itemValue),
        role: "option",
        "data-value": itemValue,
        "data-disabled": dataAttr(itemState.disabled),
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-selected": dataAttr(itemState.selected),
        "data-has-children": dataAttr(itemState.hasChildren),
        "data-depth": itemState.depth,
        "aria-selected": itemState.selected,
        "aria-disabled": itemState.disabled,
        onClick(event) {
          if (!isInteractive) return
          if (!isLeftClick(event)) return
          if (itemState.disabled) return
          send({ type: "ITEM.CLICK", value: itemValue })
        },
        onPointerMove() {
          if (itemState.disabled) return
          send({ type: "ITEM.POINTER_MOVE", value: itemValue })
        },
        onPointerLeave() {
          send({ type: "ITEM.POINTER_LEAVE", value: itemValue })
        },
      })
    },

    getItemTextProps(props: ItemProps) {
      const { value: itemValue } = props
      const itemState = this.getItemState(props)
      return normalize.element({
        ...parts.itemText.attrs,
        "data-value": itemValue,
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-selected": dataAttr(itemState.selected),
        "data-disabled": dataAttr(itemState.disabled),
      })
    },

    getItemIndicatorProps(props: ItemProps) {
      const { value: itemValue } = props
      const itemState = this.getItemState(props)

      return normalize.element({
        ...parts.itemIndicator.attrs,
        "data-value": itemValue,
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-has-children": dataAttr(itemState.hasChildren),
        hidden: !itemState.hasChildren,
      })
    },
  }
}
