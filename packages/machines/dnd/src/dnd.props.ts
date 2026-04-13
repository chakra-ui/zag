import { createProps } from "@zag-js/types"
import { createSplitProps } from "@zag-js/utils"
import type { DndProps, DraggableProps, DragHandleProps, DropIndicatorProps, DropTargetProps } from "./dnd.types"

export const props = createProps<DndProps>()([
  "activationConstraint",
  "dragOverDelay",
  "canDrag",
  "canDrop",
  "collisionStrategy",
  "columnCount",
  "dir",
  "dropPlacements",
  "edgeThreshold",
  "getRootNode",
  "id",
  "ids",
  "onDragEnd",
  "onDragOver",
  "onDragStart",
  "onDrop",
  "orientation",
  "scrollThreshold",
  "selectedValues",
  "stickyDelay",
  "getValueText",
  "translations",
])

export const splitProps = createSplitProps<Partial<DndProps>>(props)

export const draggableProps = createProps<DraggableProps>()(["value", "disabled"])
export const splitDraggableProps = createSplitProps<DraggableProps>(draggableProps)

export const dropTargetProps = createProps<DropTargetProps>()(["value", "disabled"])
export const splitDropTargetProps = createSplitProps<DropTargetProps>(dropTargetProps)

export const dropIndicatorProps = createProps<DropIndicatorProps>()(["value", "placement"])
export const splitDropIndicatorProps = createSplitProps<DropIndicatorProps>(dropIndicatorProps)

export const dragHandleProps = createProps<DragHandleProps>()(["value", "disabled"])
export const splitDragHandleProps = createSplitProps<DragHandleProps>(dragHandleProps)
