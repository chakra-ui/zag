import { createMachine, guards, ref } from "@zag-js/core"
import { MachineContext, MachineState, UserDefinedContext } from "./pressable.types"

import { dom } from "./pressable.dom"
import { utils } from "./pressable.utils"

const { and, not } = guards

export function machine(ctx: UserDefinedContext) {
  return createMachine<MachineContext, MachineState>(
    {
      id: "pressable",
      initial: "unknown",
      context: {
        id: null,
        ignoreClickAfterPress: false,
        activePointerId: null,
        target: null,
        pointerType: null,
        abortController: null,
        pointerdownEvent: null,
        ...ctx,
      },
      //TODO - restoreTextSelection
      exit: ["restoreTextSelection", "removeDocumentListeners"],
      activities: ["attachElementListeners"],
      states: {
        unknown: {
          on: { SETUP: "idle" },
        },

        idle: {
          tags: ["unpressed"],
          entry: ["removeDocumentListeners", "resetContext", "restoreTextSelection"],
          on: {
            POINTER_DOWN: [
              {
                guard: and("isValidTarget", "isLeftButton", "isVirtualPointerEvent"),
                actions: "setPointerToVirtual",
              },
              {
                guard: and("isValidTarget", "isLeftButton"),
                target: "pressed",
                actions: [
                  "setPointerType",
                  "setPointerId",
                  "setPressTarget",
                  "focusIfNeeded",
                  "invokeOnPressStart",
                  "preventDefaultIfNeeded",
                  "disableTextSelectionIfNeeded",
                  "attachDocumentListeners",
                ],
              },
            ],
            KEYDOWN: {
              guard: and("isValidTarget", "isValidKeyboardEvent"),
              target: "pressed",
              actions: ["setPressTarget", "invokeOnPressStart"],
            },
            CLICK: [
              {
                guard: "shouldTriggerKeyboardClick",
                actions: [
                  "preventDefaultIfNeeded",
                  "invokeOnPressStart",
                  "invokeOnPressUp",
                  "invokeOnPressEnd",
                  "invokeOnPress",
                  "focusIfNeeded",
                  "resetIgnoreClick",
                ],
              },
              {
                actions: "preventDefaultIfNeeded",
              },
            ],
            MOUSE_DOWN: {
              guard: "isLeftButton",
              actions: "preventDefaultIfNeeded",
            },
          },
        },
        pressed: {
          tags: ["pressed"],
          on: {
            POINTER_MOVE: [
              {
                guard: and(not("isOverTarget"), "cancelOnPointerExit"),
                target: "idle",
                actions: "invokeOnPressEnd",
              },
              {
                guard: not("isOverTarget"),
                target: "pressedout",
                actions: "invokeOnPressEnd",
              },
            ],
            POINTER_UP: [
              {
                guard: "isOverTarget",
                target: "idle",
                actions: ["invokeOnPressUp", "invokeOnPressEnd", "invokeOnPress"],
              },
              {
                target: "idle",
                actions: ["invokeOnPressEnd"],
              },
            ],
            POINTER_CANCEL: "idle",
            KEYUP: {
              target: "idle",
              actions: ["invokeOnPressUp", "invokeOnPressEnd", "invokeOnPress", "clickIfNeeded"],
            },
            DRAG_START: "idle",
          },
          after: {
            500: {
              actions: "invokeOnLongPress",
            },
          },
        },
        pressedout: {
          tags: ["pressed"],
          on: {
            POINTER_MOVE: {
              guard: "isOverTarget",
              target: "pressed",
              actions: ["invokeOnPressStart"],
            },
            POINTER_UP: {
              target: "idle",
              actions: "invokeOnPressEnd",
            },
            POINTER_CANCEL: "idle",
            DRAG_START: "idle",
          },
        },
      },
    },

    {
      guards: {
        isValidTarget(_ctx, { event }) {
          return event?.currentTarget?.contains?.(event?.target)
        },
        isLeftButton: (_, { event }) => event && event.button === 0,
        isVirtualPointerEvent: (_, { event }) => utils.isVirtualPointerEvent(event.nativeEvent),
        shouldTriggerKeyboardClick(ctx, { event }) {
          return (
            !ctx.ignoreClickAfterPress && (ctx.pointerType === "virtual" || utils.isVirtualClick(event.nativeEvent))
          )
        },
        cancelOnPointerExit: (ctx) => !!ctx.shouldCancelOnPointerExit,
        isOverTarget: (ctx, { event }) => {
          return !!utils.isOverTarget(event, ctx.target)
        },
        isValidKeyboardEvent: (_, { event }) => {
          return utils.isValidKeyboardEvent(event, event.currentTarget)
        },
      },

      actions: {
        attachDocumentListeners(ctx, _, { send }) {
          const doc = dom.getDoc(ctx)
          const controller = new AbortController()
          ctx.abortController = ref(controller)
          const opts = { signal: controller.signal }

          doc.addEventListener("pointermove", (event) => send({ type: "POINTER_MOVE", event }), opts)

          doc.addEventListener("pointerup", (event) => send({ type: "POINTER_UP", event }), opts)

          doc.addEventListener("pointercancel", (event) => send({ type: "POINTER_CANCEL", event }), opts)
        },
        removeDocumentListeners(ctx) {
          ctx.abortController?.abort()
        },
        resetContext(ctx) {
          ctx.activePointerId = null
          ctx.pointerType = null
          ctx.pointerdownEvent = null
        },
        restoreTextSelection(ctx) {
          if (ctx.allowTextSelectionOnPress) return
          //TODO
          // restoreTextSelection(ctx.target);
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
        setPressTarget(ctx, { event }) {
          ctx.target = ref(event.currentTarget)
        },
        focusIfNeeded(ctx, { event }) {
          if (ctx.disabled || ctx.preventFocusOnPress) return
          event.currentTarget.focus({ preventScroll: true })
        },
        invokeOnPressStart(ctx, evt) {
          let { event: originalEvent, pressEvent, pointerType } = evt
          let { onPressStart, disabled } = ctx

          if (disabled) return
          const event = pressEvent || originalEvent
          if (onPressStart) {
            onPressStart({
              type: "pressstart",
              pointerType: pointerType || ctx.pointerType,
              target: event.currentTarget,
              originalEvent: event,
            })
          }
        },
        preventDefaultIfNeeded(_, { event }) {
          if (utils.shouldPreventDefault(event.currentTarget as Element)) {
            event.preventDefault()
          }
        },
        disableTextSelectionIfNeeded(ctx) {
          if (!ctx.allowTextSelectionOnPress) {
            //TODO
            // disableTextSelection(ctx.target);
          }
        },
        invokeOnPressUp(ctx, { event, pointerType }) {
          let { onPressUp, disabled } = ctx
          if (disabled) {
            return
          }

          if (onPressUp) {
            onPressUp({
              type: "pressup",
              pointerType: pointerType || ctx.pointerType,
              target: event.currentTarget,
              originalEvent: event,
            })
          }
        },
        invokeOnPressEnd(ctx, { event, pointerType }) {
          let { onPressEnd } = ctx

          ctx.ignoreClickAfterPress = true

          if (onPressEnd) {
            onPressEnd({
              type: "pressend",
              pointerType: pointerType || ctx.pointerType,
              target: event.currentTarget,
              originalEvent: event,
            })
          }
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
        clickIfNeeded(ctx, { event }) {
          let target = event.target as Element

          if (
            ctx.target instanceof HTMLElement &&
            ctx.target.contains(target) &&
            (utils.isHTMLAnchorLink(ctx.target) || ctx.target.getAttribute("role") === "link")
          ) {
            ctx.target.click()
          }
        },
        invokeOnLongPress(ctx, { pointerType }) {
          ctx.onLongPress?.({
            type: "longpress",
            pointerType: pointerType || ctx.pointerType,
            target: ctx.target as HTMLElement,
            originalEvent: ctx.pointerdownEvent!,
          })
        },

        resetIgnoreClick(ctx) {
          ctx.ignoreClickAfterPress = false
        },
      },

      activities: {
        attachElementListeners(ctx, _, meta) {
          const el = dom.getPressableEl(ctx)
          if (!el) return

          const abortController = new AbortController()
          const opts = {
            signal: abortController.signal,
          }

          el.addEventListener(
            "keydown",
            (event) => meta.send({ type: "KEYDOWN", event, pointerType: "keyboard" }),
            opts,
          )
          el.addEventListener("keyup", (event) => meta.send({ type: "KEYUP", event, pointerType: "keyboard" }), opts)
          el.addEventListener("click", (event) => meta.send({ type: "CLICK", event, pointerType: "virtual" }), opts)
          el.addEventListener("pointerdown", (event) => meta.send({ type: "POINTER_DOWN", event }), opts)
          // el.addEventListener(
          //   "mousedown",
          //   (event) => meta.send({ type: "MOUSE_DOWN", event }),
          //   opts
          // );
          el.addEventListener("pointerup", (event) => meta.send({ type: "POINTER_UP", event }), opts)
          el.addEventListener("dragstart", (event) => meta.send({ type: "DRAG_START", event }), opts)

          return () => {
            abortController.abort()
          }
        },
      },
    },
  )
}
