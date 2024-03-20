import type { Position, ResizeTriggerAxis, Size } from "../floating-panel.types"

export interface Options {
  diff: Position
  axis: ResizeTriggerAxis
  prevPosition: Position
  prevSize: Size
  altKey: boolean
}

export function getDiffRect(opts: Options) {
  const { diff, axis, prevPosition, prevSize, altKey } = opts

  const factor = altKey ? 2 : 1

  let nextSize: Size | undefined
  let nextPosition: Position | undefined

  switch (axis as ResizeTriggerAxis) {
    case "n": {
      nextSize = {
        width: prevSize!.width,
        height: prevSize.height - diff.y * factor,
      }
      nextPosition = {
        y: prevPosition.y + diff.y,
        x: prevPosition.x,
      }
      break
    }

    case "e": {
      nextSize = {
        width: prevSize.width + diff.x * factor,
        height: prevSize.height,
      }
      nextPosition = {
        y: prevPosition.y,
        x: altKey ? prevPosition.x - diff.x : prevPosition.x,
      }
      break
    }

    case "w": {
      nextSize = {
        width: prevSize.width - diff.x * factor,
        height: prevSize.height,
      }
      nextPosition = {
        y: prevPosition.y,
        x: altKey ? prevPosition.x + diff.x : prevPosition.x,
      }
      break
    }

    case "s": {
      nextSize = {
        width: prevSize.width,
        height: prevSize.height + diff.y * factor,
      }
      nextPosition = {
        y: altKey ? prevPosition.y - diff.y : prevPosition.y,
        x: prevPosition.x,
      }
      break
    }

    case "ne": {
      nextSize = {
        width: prevSize.width + diff.x * factor,
        height: prevSize.height - diff.y * factor,
      }
      nextPosition = {
        y: prevPosition.y + diff.y,
        x: altKey ? prevPosition.x - diff.x : prevPosition.x,
      }
      break
    }

    case "se": {
      nextSize = {
        width: prevSize.width + diff.x * factor,
        height: prevSize.height + diff.y * factor,
      }
      nextPosition = {
        x: altKey ? prevPosition.x - diff.x : prevPosition.x,
        y: altKey ? prevPosition.y - diff.y : prevPosition.y,
      }
      break
    }

    case "sw": {
      nextSize = {
        width: prevSize.width - diff.x * factor,
        height: prevSize.height + diff.y * factor,
      }
      nextPosition = {
        y: altKey ? prevPosition.y - diff.y : prevPosition.y,
        x: prevPosition.x + diff.x,
      }
      break
    }

    case "nw": {
      nextSize = {
        width: prevSize.width - diff.x * factor,
        height: prevSize.height - diff.y * factor,
      }
      nextPosition = {
        y: prevPosition.y + diff.y,
        x: prevPosition.x + diff.x,
      }
      break
    }

    default: {
      throw new Error(`Invalid axis: ${axis}`)
    }
  }

  return { nextSize, nextPosition }
}
