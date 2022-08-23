import { createMachine, ref } from "@zag-js/core"
import { addDomEvent, disableTextSelection, isHTMLElement, restoreTextSelection } from "@zag-js/dom-utils"
import { dom } from "./pressable.dom"
import { MachineContext, MachineState, UserDefinedContext } from "./pressable.types"
import { utils } from "./pressable.utils"

export function machine(ctx: UserDefinedContext) {
  return createMachine<MachineContext, MachineState>(
    {
      id: "pressable",
      initial: "unknown",
      context: {
        ...ctx,
        ignoreClickAfterPress: false,
        activePointerId: null,
        target: null,
        pointerType: null,
        pointerdownEvent: null,
        cleanups: ref([]),
        wasPressedDown: false,
      },

      exit: ["restoreTextSelection", "removeDocumentListeners"],

      states: {
        unknown: {
          on: {
            SETUP: "idle",
          },
        },

        idle: {
          entry: ["removeDocumentListeners", "resetContext", "restoreTextSelection", "resetIgnoreClick"],
          on: {
            POINTER_DOWN: [
              {
                guard: "isVirtualPointerEvent",
                actions: ["setPointerType"],
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
              actions: ["setTarget", "invokeOnPressStart", "trackDocumentKeyup"],
            },
            CLICK: {
              actions: [
                "focusIfNeeded",
                "invokeOnPressStart",
                "invokeOnPressUp",
                "invokeOnPressEnd",
                "resetIgnoreClick",
              ],
            },
          },
        },

        "pressed:in": {
          tags: ["pressed"],
          exit: ["clearPressedDown"],
          entry: ["preventContextMenu"],
          after: {
            500: {
              guard: "wasPressedDown",
              actions: "invokeOnLongPress",
            },
          },
          on: {
            POINTER_LEAVE: [
              {
                guard: "cancelOnPointerExit",
                target: "idle",
                actions: ["invokeOnPressEnd"],
              },
              {
                target: "pressed:out",
                actions: "invokeOnPressEnd",
              },
            ],
            DOC_POINTER_UP: {
              target: "idle",
              actions: ["invokeOnPressUp", "invokeOnPressEnd", "invokeOnPress"],
            },
            DOC_KEY_UP: {
              target: "idle",
              actions: ["invokeOnPressEnd", "triggerClick"],
            },
            KEY_UP: {
              target: "idle",
              actions: ["invokeOnPressUp"],
            },
            DOC_POINTER_CANCEL: "idle",
            DRAG_START: "idle",
          },
        },

        "pressed:out": {
          on: {
            POINTER_ENTER: {
              target: "pressed:in",
              actions: ["invokeOnPressStart"],
            },
            DOC_POINTER_UP: {
              target: "idle",
              actions: "invokeOnPressEnd",
            },
            DOC_POINTER_CANCEL: "idle",
            DRAG_START: "idle",
          },
        },
      },
    },

    {
      guards: {
        isVirtualPointerEvent: (_ctx, evt) => evt.pointerType === "virtual",
        cancelOnPointerExit: (ctx) => !!ctx.cancelOnPointerExit,
        wasPressedDown: (ctx) => ctx.wasPressedDown,
      },
      actions: {
        trackDocumentPointerEvents(ctx, _evt, { send }) {
          const doc = dom.getDoc(ctx)

          const onPointerMove = (event: PointerEvent) => {
            if (event.pointerId !== ctx.activePointerId) return
            const isOverTarget = utils.isOverTarget(event, ctx.target)
            send({ type: isOverTarget ? "POINTER_ENTER" : "POINTER_LEAVE", event })
          }

          const onPointerUp = (event: PointerEvent) => {
            if (event.pointerId !== ctx.activePointerId || event.button !== 0) return
            send({ type: "DOC_POINTER_UP", event })
          }

          const onPointerCancel = (event: PointerEvent) => {
            send({ type: "DOC_POINTER_CANCEL", event })
          }

          const cleanup = [
            addDomEvent(doc, "pointermove", onPointerMove, false),
            addDomEvent(doc, "pointerup", onPointerUp, false),
            addDomEvent(doc, "pointercancel", onPointerCancel, false),
          ]

          ctx.cleanups.push(...cleanup)
        },
        trackDocumentKeyup(ctx, _evt, { send }) {
          const doc = dom.getDoc(ctx)

          const onKeyup = (event: KeyboardEvent) => {
            if (!utils.isValidKeyboardEvent(event)) return

            if (utils.shouldPreventDefaultKeyboard(event.target as Element)) {
              event.preventDefault()
            }

            send({ type: "DOC_KEY_UP", event })
          }

          const cleanup = addDomEvent(doc, "keyup", onKeyup, false)
          ctx.cleanups.push(cleanup)
        },
        removeDocumentListeners(ctx) {
          ctx.cleanups.forEach((fn) => fn?.())
          ctx.cleanups = ref([])
        },
        resetContext(ctx) {
          ctx.activePointerId = null
          ctx.pointerType = null
          ctx.pointerdownEvent = null
        },
        restoreTextSelection(ctx) {
          if (ctx.allowTextSelectionOnPress || !ctx.target) return
          restoreTextSelection({ target: ctx.target, doc: dom.getDoc(ctx) })
        },
        setPointerToVirtual(ctx) {
          ctx.pointerType = "virtual"
        },
        setPointerType(ctx, { event }) {
          ctx.pointerType = event.pointerType
        },
        setPointerId(ctx, { event }) {
          ctx.activePointerId = event.pointerId
          ctx.pointerdownEvent = ref(event)
        },
        setTarget(ctx, { event }) {
          ctx.target = ref(event.currentTarget)
        },
        focusIfNeeded(ctx, { event }) {
          if (ctx.disabled || ctx.preventFocusOnPress) return
          event.currentTarget.focus({ preventScroll: true })
        },
        invokeOnPressStart(ctx, evt) {
          if (ctx.disabled) return

          let { event: originalEvent, pressEvent, pointerType } = evt
          const event = pressEvent || originalEvent

          ctx.onPressStart?.({
            type: "pressstart",
            pointerType: pointerType || ctx.pointerType,
            target: event.currentTarget,
            originalEvent: event,
          })
        },
        disableTextSelection(ctx) {
          if (!ctx.target || ctx.allowTextSelectionOnPress) return
          disableTextSelection({ target: ctx.target, doc: dom.getDoc(ctx) })
        },
        invokeOnPressUp(ctx, { event, pointerType }) {
          if (ctx.disabled) return
          ctx.onPressUp?.({
            type: "pressup",
            pointerType: pointerType || ctx.pointerType,
            target: event.currentTarget,
            originalEvent: event,
          })
        },
        invokeOnPressEnd(ctx, { event, pointerType }) {
          ctx.ignoreClickAfterPress = true
          ctx.onPressEnd?.({
            type: "pressend",
            pointerType: pointerType || ctx.pointerType,
            target: event.currentTarget,
            originalEvent: event,
          })
        },
        invokeOnPress(ctx, { event, pointerType }) {
          if (ctx.disabled) return
          ctx.onPress?.({
            type: "press",
            pointerType: pointerType || ctx.pointerType,
            target: event.currentTarget,
            originalEvent: event,
          })
        },
        triggerClick(ctx, { event }) {
          let target = event.target as Element

          if (!isHTMLElement(ctx.target)) {
            return
          }

          const isAnchor = utils.isHTMLAnchorLink(ctx.target) || ctx.target.getAttribute("role") === "link"

          if (ctx.target.contains(target) && isAnchor) {
            ctx.target.click()
          }
        },
        dispatchPointerCancel(ctx) {
          if (!ctx.target) return
          const win = dom.getWin(ctx)
          // Prevent other pressable handlers from also handling this event.
          const evt = new win.PointerEvent("pointercancel", { bubbles: true })
          ctx.target.dispatchEvent(evt)
        },
        invokeOnLongPress(ctx, { pointerType }) {
          if (!ctx.target) return
          ctx.onLongPress?.({
            type: "longpress",
            pointerType: pointerType || ctx.pointerType,
            target: ctx.target,
            originalEvent: ctx.pointerdownEvent!,
          })
        },
        resetIgnoreClick(ctx) {
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
