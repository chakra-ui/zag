import { createMachine } from "@zag-js/core"
import { addDomEvent, contains, getDocument, getEventPoint, getEventTarget } from "@zag-js/dom-utils"
import { debugPolygon, getElementPolygon, isPointInPolygon } from "@zag-js/rect-utils"

type Placement = "top" | "bottom" | "left" | "right"

export type HoverIntentOptions = {
  exitPoint: Point
  placement: Placement
  onCancel?: () => void
  onComplete?: () => void
  timeout?: number
  debug?: boolean
}

type State = {
  value: "intent:start" | "intent:cancel" | "intent:complete"
}

type Point = { x: number; y: number }
type Polygon = Point[]

type Context = HoverIntentOptions & {
  pointerGraceArea: Polygon | null
}

export function hoverIntentMachine(content: HTMLElement, options: HoverIntentOptions) {
  return createMachine<Context, State>(
    {
      id: "hover-intent",
      initial: "intent:start",

      context: {
        ...options,
        pointerGraceArea: null,
      },

      exit: "clearGraceArea",
      entry: "setPointerGraceArea",

      states: {
        "intent:start": {
          after: {
            TIMEOUT: "intent:cancel",
          },
          activities: ["trackPointerMove", "visualizeIfNeeded"],
          on: {
            MOVED_AWAY: "intent:cancel",
            MOVED_INTO: "intent:complete",
          },
        },

        "intent:cancel": {
          type: "final",
          entry: "invokeOnCancel",
        },

        "intent:complete": {
          type: "final",
          entry: "invokeOnComplete",
        },
      },
    },
    {
      activities: {
        trackPointerMove(ctx, _evt, { send }) {
          if (!ctx.pointerGraceArea) return
          return addDomEvent(getDocument(content), "pointermove", (e) => {
            const pointerPosition = getEventPoint(e)
            const target = getEventTarget(e)
            const hasEntered = contains(content, target)
            const isPointerOutsideGraceArea = !isPointInPolygon(ctx.pointerGraceArea!, pointerPosition)

            if (hasEntered) {
              send("MOVED_INTO")
            } else if (isPointerOutsideGraceArea) {
              send("MOVED_AWAY")
            }
          })
        },
        visualizeIfNeeded(ctx) {
          if (!ctx.debug || !ctx.pointerGraceArea) return
          return debugPolygon(ctx.pointerGraceArea)
        },
      },
      actions: {
        invokeOnCancel(ctx) {
          ctx.onCancel?.()
        },
        invokeOnComplete(ctx) {
          ctx.onComplete?.()
        },
        clearGraceArea(ctx) {
          ctx.pointerGraceArea = null
        },
        setPointerGraceArea(ctx) {
          const rect = content.getBoundingClientRect()

          const polygon = getElementPolygon(rect, ctx.placement)
          if (!polygon) return

          const point = { ...ctx.exitPoint }
          const bleed = /(right|bottom)/.test(ctx.placement) ? -5 : +5
          const x = /(right|left)/.test(ctx.placement)

          if (x) point.x += bleed
          else point.y += bleed

          ctx.pointerGraceArea = [point, ...polygon]
        },
      },
      delays: {
        TIMEOUT: (ctx) => ctx.timeout || 250,
      },
    },
  )
}
