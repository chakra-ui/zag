import { createMachine, ref } from "@zag-js/core"
import { addDomEvent } from "@zag-js/dom-event"
import { isHTMLElement } from "@zag-js/dom-query"
import { disableTextSelection, restoreTextSelection } from "@zag-js/text-selection"
import { compact } from "@zag-js/utils"
import { dom } from "./pressable.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./pressable.types"
import { isHTMLAnchorLink, isOverTarget, isValidKeyboardEvent, shouldPreventDefaultKeyboard } from "./pressable.utils"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "pressable",
      initial: "idle",
      context: {
        longPressDelay: 500,
        ...ctx,
        wasPressedDown: false,
        ignoreClickAfterPress: false,
        target: null,
        pointerId: null,
        pointerType: null,
        cleanups: ref([]),
      },

      exit: ["restoreTextSelection", "removeDocumentListeners"],

      states: {
        idle: {
          entry: ["resetPointerContext", "restoreTextSelection", "removeDocumentListeners"],
          on: {
            POINTER_DOWN: [
              {
                guard: "isVirtualPointer",
                actions: "setPointerType",
              },
              {
                target: "pressed:in",
                actions: [
                  "setPressedDown",
                  "setPointerType",
                  "setPointerId",
                  "setTarget",
                  "focusIfNeeded",
                  "disableTextSelection",
                  "invokeOnPressStart",
                  "trackDocumentPointerEvents",
                ],
              },
            ],
            KEY_DOWN: {
              target: "pressed:in",
              actions: ["setTarget", "setPointerType", "invokeOnPressStart", "trackDocumentKeyup"],
            },
            CLICK: {
              actions: [
                "focusIfNeeded",
                "invokeOnPressStart",
                "enableClickAfterPress",
                "invokeOnPressEnd",
                "invokeOnPress",
              ],
            },
          },
        },

        "pressed:in": {
          tags: "pressed",
          entry: "preventContextMenu",
          after: {
            LONG_PRESS_DELAY: {
              guard: "wasPressedDown",
              actions: ["clearPressedDown", "invokeOnLongPress"],
            },
          },
          on: {
            POINTER_LEAVE: [
              {
                guard: "cancelOnPointerExit",
                target: "idle",
                actions: ["clearPressedDown", "invokeOnPressEnd"],
              },
              {
                target: "pressed:out",
                actions: ["invokeOnPressEnd"],
              },
            ],
            DOC_POINTER_UP: [
              {
                guard: "wasPressedDown",
                target: "idle",
                actions: [
                  "clearPressedDown",
                  "invokeOnPressUp",
                  "enableClickAfterPress",
                  "invokeOnPressEnd",
                  "invokeOnPress",
                ],
              },
              {
                target: "idle",
                actions: ["clearPressedDown", "invokeOnPressUp", "enableClickAfterPress", "invokeOnPressEnd"],
              },
            ],
            DOC_KEY_UP: {
              target: "idle",
              actions: [
                "clearPressedDown",
                "invokeOnPressUp",
                "disableClickAfterPress",
                "invokeOnPressEnd",
                "invokeOnPress",
                "triggerClickIfAnchor",
              ],
            },
            DOC_POINTER_CANCEL: {
              target: "idle",
              actions: "clearPressedDown",
            },
            DRAG_START: {
              target: "idle",
              actions: "clearPressedDown",
            },
          },
        },

        "pressed:out": {
          on: {
            POINTER_ENTER: {
              target: "pressed:in",
              actions: "invokeOnPressStart",
            },
            DOC_POINTER_UP: {
              target: "idle",
            },
            DOC_POINTER_CANCEL: "idle",
            DRAG_START: "idle",
          },
        },
      },
    },

    {
      delays: {
        LONG_PRESS_DELAY: (ctx) => ctx.longPressDelay,
      },
      guards: {
        isVirtualPointer: (_ctx, evt) => evt.pointerType === "virtual",
        cancelOnPointerExit: (ctx) => !!ctx.cancelOnPointerExit,
        wasPressedDown: (ctx) => ctx.wasPressedDown,
      },
      actions: {
        trackDocumentPointerEvents(ctx, _evt, { send }) {
          const doc = dom.getDoc(ctx)

          const onPointerMove = (event: PointerEvent) => {
            if (event.pointerId !== ctx.pointerId) return
            const isOver = isOverTarget(event, ctx.target)
            send({
              type: isOver ? "POINTER_ENTER" : "POINTER_LEAVE",
              currentTarget: event.currentTarget,
              pointerType: event.pointerType,
            })
          }

          const onPointerUp = (event: PointerEvent) => {
            if (event.pointerId !== ctx.pointerId || event.button !== 0) return
            send({
              type: "DOC_POINTER_UP",
              currentTarget: event.currentTarget,
              pointerType: event.pointerType,
            })
          }

          const onPointerCancel = (event: PointerEvent | MouseEvent) => {
            send({
              type: "DOC_POINTER_CANCEL",
              currentTarget: event.currentTarget,
            })
          }

          const cleanup = [
            addDomEvent(doc, "pointermove", onPointerMove, false),
            addDomEvent(doc, "pointerup", onPointerUp, false),
            addDomEvent(doc, "pointercancel", onPointerCancel, false),
          ]

          // When user presses the left button and quickly presses the context menu button
          if (ctx.pointerType !== "touch") {
            cleanup.push(addDomEvent(doc, "contextmenu", onPointerCancel, false))
          }

          ctx.cleanups.push(...cleanup)
        },
        trackDocumentKeyup(ctx, evt, { send }) {
          const doc = dom.getDoc(ctx)

          const onKeyup = (event: KeyboardEvent) => {
            if (!isValidKeyboardEvent(event)) return

            if (shouldPreventDefaultKeyboard(event.target as Element)) {
              event.preventDefault()
            }

            send({
              type: "DOC_KEY_UP",
              // forward the previously store keyboard type
              pointerType: evt.pointerType,
            })
          }

          const cleanup = addDomEvent(doc, "keyup", onKeyup, false)
          ctx.cleanups.push(cleanup)
        },
        removeDocumentListeners(ctx) {
          ctx.cleanups.forEach((fn) => fn?.())
          ctx.cleanups = ref([])
        },
        resetPointerContext(ctx) {
          ctx.pointerId = null
          ctx.pointerType = null
        },
        disableTextSelection(ctx) {
          if (!ctx.target || ctx.allowTextSelectionOnPress) return
          disableTextSelection({ target: ctx.target, doc: dom.getDoc(ctx) })
        },
        restoreTextSelection(ctx) {
          if (ctx.allowTextSelectionOnPress || !ctx.target) return
          restoreTextSelection({ target: ctx.target, doc: dom.getDoc(ctx) })
        },
        setPointerToVirtual(ctx) {
          ctx.pointerType = "virtual"
        },
        setPointerType(ctx, evt) {
          ctx.pointerType = evt.pointerType
        },
        setPointerId(ctx, evt) {
          ctx.pointerId = evt.pointerId
        },
        setTarget(ctx, evt) {
          ctx.target = ref(evt.currentTarget)
        },
        focusIfNeeded(ctx, evt) {
          if (ctx.disabled || ctx.preventFocusOnPress) return
          evt.currentTarget.focus({ preventScroll: true })
        },
        invokeOnPressStart(ctx, evt) {
          if (ctx.disabled) return
          ctx.onPressStart?.({
            type: "pressstart",
            pointerType: evt.pointerType || ctx.pointerType,
            target: evt.currentTarget,
          })
        },
        invokeOnPressUp(ctx, evt) {
          if (ctx.disabled) return
          ctx.onPressUp?.({
            type: "pressup",
            pointerType: evt.pointerType || ctx.pointerType,
            target: evt.currentTarget,
          })
        },
        invokeOnPressEnd(ctx, evt) {
          if (ctx.disabled) return
          ctx.onPressEnd?.({
            type: "pressend",
            pointerType: evt.pointerType || ctx.pointerType,
            target: evt.currentTarget,
          })
        },
        invokeOnPress(ctx, evt) {
          if (ctx.disabled) return
          ctx.onPress?.({
            type: "press",
            pointerType: evt.pointerType || ctx.pointerType,
            target: evt.currentTarget,
          })
        },
        triggerClickIfAnchor(ctx, evt) {
          let target = evt.currentTarget as Element
          if (!isHTMLElement(ctx.target)) return

          const isAnchor = isHTMLAnchorLink(ctx.target) || ctx.target.getAttribute("role") === "link"

          if (ctx.target.contains(target) && isAnchor) {
            ctx.target.click()
          }
        },
        invokeOnLongPress(ctx, evt) {
          if (!ctx.target) return
          ctx.onLongPress?.({
            type: "longpress",
            pointerType: evt.pointerType || ctx.pointerType,
            target: ctx.target,
          })
        },
        disableClickAfterPress(ctx) {
          ctx.ignoreClickAfterPress = true
        },
        enableClickAfterPress(ctx) {
          ctx.ignoreClickAfterPress = false
        },
        setPressedDown(ctx) {
          ctx.wasPressedDown = true
        },
        clearPressedDown(ctx) {
          ctx.wasPressedDown = false
        },
        preventContextMenu(ctx) {
          // Prevent context menu, which may be opened on long press on touch devices
          if (ctx.pointerType !== "touch" || !ctx.onLongPress) return

          const onContextMenu = (event: MouseEvent) => event.preventDefault()
          const cleanup = addDomEvent(ctx.target, "contextmenu", onContextMenu, { once: true })

          // If no contextmenu event is fired quickly after pointerup, remove the handler
          // so future context menu events outside a long press are not prevented.
          const onPointerUp = () => void setTimeout(cleanup, 30)
          addDomEvent(dom.getWin(ctx), "pointerup", onPointerUp, { once: true })
        },
      },
    },
  )
}
