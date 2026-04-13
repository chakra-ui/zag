import { dataAttr, getEventKey, getEventPoint, isLeftClick, MAX_Z_INDEX } from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./dnd.anatomy"
import * as dom from "./dnd.dom"
import type { DndApi, DndService } from "./dnd.types"

export function connect<T extends PropTypes>(service: DndService, normalize: NormalizeProps<T>): DndApi<T> {
  const { state, send, prop, context, scope } = service

  const isDragging = state.matches("pointer:dragging", "keyboard:session")
  const isKeyboardDragging = state.matches("keyboard:session")
  const dragSource = context.get("dragSource")
  const dropTarget = context.get("dropTarget")
  const dropPlacement = context.get("dropPlacement")
  const pointerPosition = context.get("pointerPosition")

  const orientation = prop("orientation")
  const isVertical = orientation === "vertical"
  const isGrid = prop("columnCount") != null
  const dir = prop("dir")

  function handleKeyboardSession(event: any) {
    if (!isKeyboardDragging) return false
    if (event.defaultPrevented) return false

    const keyMap: EventKeyMap = {
      Tab() {
        event.preventDefault()
        send({ type: event.shiftKey ? "KEYBOARD.TAB_PREV" : "KEYBOARD.TAB_NEXT" })
      },
      Enter() {
        event.preventDefault()
        send({ type: "KEYBOARD.DROP" })
      },
      Escape() {
        event.preventDefault()
        send({ type: "KEYBOARD.CANCEL" })
      },
    }

    if (isGrid) {
      // Grid: all 4 arrows active. Left/Right = reading order, Up/Down = jump rows
      keyMap.ArrowRight = () => {
        event.preventDefault()
        send({ type: "KEYBOARD.TAB_NEXT" })
      }
      keyMap.ArrowLeft = () => {
        event.preventDefault()
        send({ type: "KEYBOARD.TAB_PREV" })
      }
      keyMap.ArrowDown = () => {
        event.preventDefault()
        send({ type: "KEYBOARD.GRID_DOWN" })
      }
      keyMap.ArrowUp = () => {
        event.preventDefault()
        send({ type: "KEYBOARD.GRID_UP" })
      }
    } else {
      // List: 2 arrows based on orientation
      keyMap[isVertical ? "ArrowDown" : "ArrowRight"] = () => {
        event.preventDefault()
        send({ type: "KEYBOARD.ARROW_NEXT" })
      }
      keyMap[isVertical ? "ArrowUp" : "ArrowLeft"] = () => {
        event.preventDefault()
        send({ type: "KEYBOARD.ARROW_PREV" })
      }
    }

    const key = getEventKey(event, { dir })
    const exec = keyMap[key]
    if (exec) {
      exec(event)
      return true
    }
    return false
  }

  // Compute all values being dragged (source + selected, or just source)
  const selectedValues = prop("selectedValues")
  const dragValues: string[] = dragSource ? (selectedValues?.includes(dragSource) ? selectedValues : [dragSource]) : []
  const dragValueSet = new Set(dragValues)
  const defaultInstructions = "Press Enter or Space to start dragging."
  const instructions = prop("translations")?.instructions ?? defaultInstructions

  return {
    isDragging,
    isKeyboardDragging,
    dragSource,
    dragValues,
    dropTarget,
    dropPlacement,
    pointerPosition,
    instructions,

    getItemState(value) {
      return {
        isDragging: dragValueSet.has(value),
        isOver: dropTarget === value,
        dropPlacement: dropTarget === value ? dropPlacement : null,
        isDisabled: prop("canDrag") ? !prop("canDrag")!(value) : false,
      }
    },

    cancelDrag() {
      send({ type: "DRAG.CANCEL" })
    },

    getRootProps() {
      const columnCount = prop("columnCount")
      return normalize.element({
        ...parts.root.attrs(scope.id),
        id: dom.getRootId(scope),
        dir,
        "data-dragging": dataAttr(isDragging),
        "data-orientation": orientation,
        style: columnCount ? ({ "--column-count": columnCount } as any) : undefined,
      })
    },

    getDraggableProps(props) {
      const { value, disabled } = props
      const isSource = dragSource === value
      const isPartOfDrag = dragValueSet.has(value)
      const canDrag = !disabled && (!prop("canDrag") || prop("canDrag")!(value))

      return normalize.element({
        ...parts.draggable.attrs(scope.id),
        id: dom.getDraggableId(scope, value),
        "data-value": value,
        "data-dragging": dataAttr(isSource),
        "data-selected-dragging": dataAttr(!isSource && isPartOfDrag),
        "data-disabled": dataAttr(!canDrag),
        tabIndex: canDrag ? 0 : undefined,
        "aria-roledescription": "draggable",
        "aria-description": canDrag ? instructions : undefined,
        "aria-grabbed": isDragging ? isPartOfDrag : undefined,
        onPointerDown(event) {
          if (!canDrag) return
          if (!isLeftClick(event)) return

          const point = getEventPoint(event)
          send({ type: "DRAG.START", value, point })
        },
        onKeyDown(event) {
          if (!canDrag) return
          if (event.defaultPrevented) return

          // During keyboard session, handle session keys
          if (handleKeyboardSession(event)) return

          const keyMap: EventKeyMap = {
            Enter() {
              event.preventDefault()
              send({ type: "KEYBOARD.GRAB", value })
            },
            Space() {
              event.preventDefault()
              send({ type: "KEYBOARD.GRAB", value })
            },
          }

          const key = getEventKey(event, { dir })
          const exec = keyMap[key]
          exec?.(event)
        },
      })
    },

    getDragHandleProps(props) {
      const { value, disabled } = props
      const isPartOfDrag = dragValueSet.has(value)
      const canDrag = !disabled && (!prop("canDrag") || prop("canDrag")!(value))

      return normalize.element({
        ...parts.dragHandle.attrs(scope.id),
        "data-value": value,
        "data-disabled": dataAttr(!canDrag),
        "aria-roledescription": "drag handle",
        "aria-description": canDrag ? instructions : undefined,
        "aria-grabbed": isDragging ? isPartOfDrag : undefined,
        tabIndex: canDrag ? 0 : undefined,
        onPointerDown(event) {
          if (!canDrag) return
          if (!isLeftClick(event)) return

          const point = getEventPoint(event)
          send({ type: "DRAG.START", value, point })
        },
        onKeyDown(event) {
          if (!canDrag) return
          if (event.defaultPrevented) return

          if (handleKeyboardSession(event)) return

          const keyMap: EventKeyMap = {
            Enter() {
              event.preventDefault()
              send({ type: "KEYBOARD.GRAB", value })
            },
            Space() {
              event.preventDefault()
              send({ type: "KEYBOARD.GRAB", value })
            },
          }

          const key = getEventKey(event, { dir })
          const exec = keyMap[key]
          exec?.(event)
        },
      })
    },

    getDropTargetProps(props) {
      const { value, disabled } = props
      const isOver = dropTarget === value
      const activePlacement = isOver ? dropPlacement : null

      return normalize.element({
        ...parts.dropTarget.attrs(scope.id),
        id: dom.getDropTargetId(scope, value),
        "data-value": value,
        "data-disabled": dataAttr(!!disabled),
        "data-drop-target": dataAttr(isOver),
        "data-drop-placement": activePlacement ?? undefined,
        // Make focusable during keyboard session so focus can move here
        tabIndex: isKeyboardDragging ? -1 : undefined,
        onKeyDown(event) {
          handleKeyboardSession(event)
        },
      })
    },

    getDropIndicatorProps(props) {
      const { value, placement } = props
      const isActive = dropTarget === value && dropPlacement === placement

      return normalize.element({
        ...parts.dropIndicator.attrs(scope.id),
        id: dom.getDropIndicatorId(scope, value, placement),
        "data-value": value,
        "data-placement": placement,
        "data-active": dataAttr(isActive),
        "aria-hidden": true,
      })
    },

    getDragPreviewProps() {
      return normalize.element({
        ...parts.dragPreview.attrs(scope.id),
        "data-dragging": dataAttr(isDragging),
        "aria-hidden": true,
        hidden: !isDragging || !pointerPosition,
        style: {
          position: "fixed",
          top: "0",
          left: "0",
          pointerEvents: "none",
          zIndex: MAX_Z_INDEX,
          transform: pointerPosition ? `translate3d(${pointerPosition.x}px, ${pointerPosition.y}px, 0)` : undefined,
          willChange: isDragging ? "transform" : undefined,
        },
      })
    },
  }
}
