import { dataAttr, getEventKey, getEventPoint, isLeftClick, MAX_Z_INDEX } from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { toPx } from "@zag-js/utils"
import { parts } from "./dnd.anatomy"
import * as dom from "./dnd.dom"
import type {
  DndApi,
  DndService,
  DraggableProps,
  DraggableState,
  DragPreviewState,
  DropIndicatorProps,
  DropIndicatorState,
  DropTargetProps,
  DropTargetState,
  RootState,
} from "./dnd.types"

export function connect<T extends PropTypes>(service: DndService, normalize: NormalizeProps<T>): DndApi<T> {
  const { state, send, prop, context, scope, refs } = service

  const isDragging = state.matches("pointer:dragging", "keyboard:session")
  const isKeyboardDragging = state.matches("keyboard:session")
  const dragSource = context.get("dragSource")
  const dropTarget = context.get("dropTarget")
  const dropPlacement = context.get("dropPlacement")
  const pointerPosition = context.get("pointerPosition")
  const dragOffset = refs.get("dragOffset")
  const dragRect = refs.get("dragRect")

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

  function startKeyboardDrag(event: any, value: string) {
    if (!prop("isActivationKey")(event)) return
    event.preventDefault()
    send({ type: "KEYBOARD.GRAB", value })
  }

  // Compute all values being dragged (source + selected, or just source)
  const selectedValues = prop("selectedValues")
  const dragValues: string[] = dragSource ? (selectedValues?.includes(dragSource) ? selectedValues : [dragSource]) : []
  const dragValueSet = new Set(dragValues)
  const defaultInstructions = "Press Enter or Space to start dragging."
  const instructions = prop("translations")?.instructions ?? defaultInstructions
  const roleDescription = prop("translations")?.roleDescription
  const draggableRoleDescription = roleDescription === undefined ? "draggable" : (roleDescription ?? undefined)

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getRootState(): RootState {
    return { dragging: isDragging }
  }

  function getDraggableState(props: DraggableProps): DraggableState {
    const { value, disabled } = props
    const source = dragSource === value
    const canDrag = !disabled && (!prop("canDrag") || prop("canDrag")!(value))
    return { dragging: source, selectedDragging: !source && dragValueSet.has(value), disabled: !canDrag }
  }

  function getDropTargetState(props: DropTargetProps): DropTargetState {
    const over = dropTarget === props.value
    return { over, placement: over ? dropPlacement : null, disabled: !!props.disabled }
  }

  function getDropIndicatorState(props: DropIndicatorProps): DropIndicatorState {
    return { active: dropTarget === props.value && dropPlacement === props.placement }
  }

  function getDragPreviewState(): DragPreviewState {
    return { dragging: isDragging, visible: isDragging && !!pointerPosition }
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

  return {
    isDragging,
    isKeyboardDragging,
    dragSource,
    dragValues,
    dropTarget,
    dropPlacement,
    pointerPosition,
    instructions,

    cancelDrag() {
      send({ type: "DRAG.CANCEL" })
    },

    move(details) {
      send({ type: "ITEM.MOVE", ...details })
    },

    getRootState,
    getRootProps() {
      const rootState = getRootState()
      const columnCount = prop("columnCount")
      return normalize.element({
        ...parts.root.attrs(scope.id),
        id: dom.getRootId(scope),
        dir,
        "data-dragging": dataAttr(rootState.dragging),
        "data-orientation": orientation,
        style: columnCount ? ({ "--column-count": columnCount } as any) : undefined,
      })
    },

    getDraggableState,
    getDraggableProps(props) {
      const { value } = props
      const draggableState = getDraggableState(props)
      const isPartOfDrag = dragValueSet.has(value)

      return normalize.element({
        ...parts.draggable.attrs(scope.id),
        id: dom.getDraggableId(scope, value),
        "data-value": value,
        "data-dragging": dataAttr(draggableState.dragging),
        "data-selected-dragging": dataAttr(draggableState.selectedDragging),
        "data-disabled": dataAttr(draggableState.disabled),
        tabIndex: draggableState.disabled ? undefined : 0,
        "aria-roledescription": draggableRoleDescription,
        "aria-description": draggableState.disabled ? undefined : instructions,
        "aria-grabbed": isDragging ? isPartOfDrag : undefined,
        style: {
          userSelect: "none",
          WebkitUserSelect: "none",
          touchAction: "none",
        },
        onPointerDown(event) {
          if (draggableState.disabled) return
          if (!isLeftClick(event)) return

          const point = getEventPoint(event)
          send({ type: "DRAG.START", value, point })
        },
        onKeyDown(event) {
          if (draggableState.disabled) return
          if (event.defaultPrevented) return

          // During keyboard session, handle session keys
          if (handleKeyboardSession(event)) return
          startKeyboardDrag(event, value)
        },
      })
    },

    getDragHandleProps(props) {
      const { value } = props
      const isPartOfDrag = dragValueSet.has(value)
      const handleState = getDraggableState(props)

      return normalize.element({
        ...parts.dragHandle.attrs(scope.id),
        "data-value": value,
        "data-disabled": dataAttr(handleState.disabled),
        "aria-roledescription": "drag handle",
        "aria-description": handleState.disabled ? undefined : instructions,
        "aria-grabbed": isDragging ? isPartOfDrag : undefined,
        tabIndex: handleState.disabled ? undefined : 0,
        style: {
          userSelect: "none",
          WebkitUserSelect: "none",
          touchAction: "none",
        },
        onPointerDown(event) {
          if (handleState.disabled) return
          if (!isLeftClick(event)) return

          const point = getEventPoint(event)
          send({ type: "DRAG.START", value, point })
        },
        onKeyDown(event) {
          if (handleState.disabled) return
          if (event.defaultPrevented) return

          if (handleKeyboardSession(event)) return
          startKeyboardDrag(event, value)
        },
      })
    },

    getDropTargetState,
    getDropTargetProps(props) {
      const { value } = props
      const dropTargetState = getDropTargetState(props)

      return normalize.element({
        ...parts.dropTarget.attrs(scope.id),
        id: dom.getDropTargetId(scope, value),
        "data-value": value,
        "data-disabled": dataAttr(dropTargetState.disabled),
        "data-drop-target": dataAttr(dropTargetState.over),
        "data-drop-placement": dropTargetState.placement ?? undefined,
        // Make focusable during keyboard session so focus can move here
        tabIndex: isKeyboardDragging ? -1 : undefined,
        onKeyDown(event) {
          handleKeyboardSession(event)
        },
      })
    },

    getDropIndicatorState,
    getDropIndicatorProps(props) {
      const { value, placement } = props
      const dropIndicatorState = getDropIndicatorState(props)

      return normalize.element({
        ...parts.dropIndicator.attrs(scope.id),
        id: dom.getDropIndicatorId(scope, value, placement),
        "data-value": value,
        "data-placement": placement,
        "data-active": dataAttr(dropIndicatorState.active),
        "aria-hidden": true,
      })
    },

    getDragPreviewState,
    getDragPreviewProps() {
      const dragPreviewState = getDragPreviewState()
      return normalize.element({
        ...parts.dragPreview.attrs(scope.id),
        "data-dragging": dataAttr(dragPreviewState.dragging),
        "aria-hidden": true,
        hidden: !dragPreviewState.visible,
        style: {
          "--drag-preview-width": toPx(dragRect?.width),
          "--drag-preview-height": toPx(dragRect?.height),
          position: "fixed",
          top: "0",
          left: "0",
          pointerEvents: "none",
          zIndex: MAX_Z_INDEX,
          transform: pointerPosition
            ? `translate3d(${toPx(pointerPosition.x - (dragOffset?.x ?? 0))}, ${toPx(pointerPosition.y - (dragOffset?.y ?? 0))}, 0)`
            : undefined,
          willChange: dragPreviewState.dragging ? "transform" : undefined,
        },
      })
    },
  }
}
