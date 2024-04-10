import { createMachine } from "@zag-js/core"
import { addDomEvent } from "@zag-js/dom-event"
import { compact } from "@zag-js/utils"
import { dom } from "./toast.dom"
import { createToastMachine } from "./toast.machine"
import type {
  GroupMachineContext,
  GroupMachineState,
  MachineContext,
  Service,
  UserDefinedGroupContext,
} from "./toast.types"
import { getToastsByPlacement } from "./toast.utils"

export function groupMachine<T = any>(userContext: UserDefinedGroupContext<T>) {
  const ctx = compact(userContext as any) as UserDefinedGroupContext<T>
  return createMachine<GroupMachineContext<T>, GroupMachineState>(
    {
      id: "toaster",
      initial: ctx.overlap ? "collapsed" : "expanded",
      context: {
        dir: "ltr",
        max: Number.MAX_SAFE_INTEGER,
        toasts: [],
        gap: 16,
        pauseOnPageIdle: false,
        pauseOnInteraction: true,
        hotkey: ["altKey", "KeyT"],
        offsets: "1rem",
        ...ctx,
        heights: [],
      },

      computed: {
        count: (ctx) => ctx.toasts.length,
      },

      activities: ["trackHotKeyPress"],

      watch: {
        toasts: ["collapsedIfEmpty"],
      },

      exit: ["removeToasts"],

      on: {
        PAUSE_TOAST: {
          actions: ["pauseToast"],
        },
        PAUSE_ALL: {
          actions: ["pauseToasts"],
        },
        RESUME_TOAST: {
          actions: ["resumeToast"],
        },
        RESUME_ALL: {
          actions: ["resumeToasts"],
        },
        ADD_TOAST: {
          guard: "isWithinRange",
          actions: ["createToast", "syncToastIndex"],
        },
        UPDATE_TOAST: {
          actions: ["updateToast"],
        },
        DISMISS_TOAST: {
          actions: ["dismissToast"],
        },
        DISMISS_ALL: {
          actions: ["dismissToasts"],
        },
        REMOVE_TOAST: {
          actions: ["removeToast", "syncToastIndex", "syncToastOffset"],
        },
        REMOVE_ALL: {
          actions: ["removeToasts"],
        },
        UPDATE_HEIGHT: {
          actions: ["syncHeights", "syncToastOffset"],
        },
      },

      states: {
        expanded: {
          on: {
            HOTKEY: {
              actions: ["focusGroupEl"],
            },
            POINTER_LEAVE: {
              target: "collapsed",
              actions: ["collapseToasts"],
            },
            COLLAPSE: "collapsed",
          },
        },
        collapsed: {
          on: {
            POINTER_ENTER: {
              target: "expanded",
              actions: ["expandToasts", "requestHeights"],
            },
            HOTKEY: {
              target: "expanded",
              actions: ["focusGroupEl", "expandToasts"],
            },
          },
        },
      },
    },
    {
      guards: {
        isWithinRange: (ctx) => ctx.toasts.length < ctx.max,
      },
      activities: {
        trackHotKeyPress(ctx, _evt, { send }) {
          const handleKeyDown = (event: KeyboardEvent) => {
            const isHotkeyPressed = ctx.hotkey.every((key) => (event as any)[key] || event.code === key)
            if (!isHotkeyPressed) return
            send({ type: "HOTKEY" })
          }
          return addDomEvent(document, "keydown", handleKeyDown, { capture: true })
        },
      },
      actions: {
        focusGroupEl(ctx) {
          queueMicrotask(() => {
            dom.getGroupEl(ctx, ctx.placement!)?.focus()
          })
        },
        expandToasts(ctx) {
          each(ctx, (toast) => {
            toast.state.context.expanded = true
          })
        },
        collapseToasts(ctx) {
          each(ctx, (toast) => {
            toast.state.context.expanded = false
          })
        },
        collapsedIfEmpty(ctx, _evt, { send }) {
          if (!ctx.overlap || ctx.toasts.length > 1) return
          send("COLLAPSE")
        },
        pauseToast(_ctx, evt, { self }) {
          self.sendChild("PAUSE", evt.id)
        },
        pauseToasts(ctx) {
          ctx.toasts.forEach((toast) => toast.send("PAUSE"))
        },
        resumeToast(_ctx, evt, { self }) {
          self.sendChild("RESUME", evt.id)
        },
        resumeToasts(ctx) {
          ctx.toasts.forEach((toast) => toast.send("RESUME"))
        },
        requestHeights(ctx) {
          ctx.toasts.forEach((toast) => toast.send("REQUEST_HEIGHT"))
        },
        createToast(ctx, evt, { self, getState }) {
          const options: MachineContext<T> = {
            placement: ctx.placement,
            duration: ctx.duration,
            removeDelay: ctx.removeDelay,
            ...evt.toast,
            pauseOnPageIdle: ctx.pauseOnPageIdle,
            pauseOnInteraction: ctx.pauseOnInteraction,
            dir: ctx.dir,
            getRootNode: ctx.getRootNode,
            expanded: getState().matches("expanded"),
          }

          const toast = createToastMachine(options)

          const actor = self.spawn(toast)
          ctx.toasts = [actor, ...ctx.toasts]
        },
        updateToast(_ctx, evt, { self }) {
          self.sendChild({ type: "UPDATE", toast: evt.toast }, evt.id)
        },
        dismissToast(_ctx, evt, { self }) {
          self.sendChild("DISMISS", evt.id)
        },
        dismissToasts(ctx) {
          ctx.toasts.forEach((toast) => toast.send("DISMISS"))
        },
        removeToast(ctx, evt, { self }) {
          self.stopChild(evt.id)
          ctx.toasts = ctx.toasts.filter((toast) => toast.id !== evt.id)
          ctx.heights = ctx.heights.filter((height) => height.id !== evt.id)
        },
        removeToasts(ctx, _evt, { self }) {
          ctx.toasts.forEach((toast) => self.stopChild(toast.id))
          ctx.toasts = []
          ctx.heights = []
        },
        syncHeights(ctx, evt) {
          const existing = ctx.heights.find((height) => height.id === evt.id)
          if (existing) {
            existing.height = evt.height
            existing.placement = evt.placement
          } else {
            const newHeight = { id: evt.id, height: evt.height, placement: evt.placement }
            ctx.heights = [newHeight, ...ctx.heights]
          }
        },
        syncToastIndex(ctx) {
          each(ctx, (toast, index, toasts) => {
            toast.state.context.index = index
            toast.state.context.frontmost = index === 0
            toast.state.context.zIndex = toasts.length - index
          })
        },
        syncToastOffset(ctx, evt) {
          const placement = evt.placement ?? ctx.placement

          // Notify each toast of it's index
          each({ ...ctx, placement }, (toast) => {
            const heightIndex = Math.max(
              ctx.heights.findIndex((height) => height.id === toast.id),
              0,
            )

            // calculate offset until toast
            const toastsHeightBefore = ctx.heights.reduce((prev, curr, reducerIndex) => {
              if (reducerIndex >= heightIndex) return prev
              return prev + curr.height
            }, 0)

            // Note: This is an intentional side effect
            // consider writing directly to the DOM (root element)
            toast.state.context.offset = heightIndex * ctx.gap + toastsHeightBefore
          })
        },
      },
    },
  )
}

function each(ctx: GroupMachineContext, fn: (toast: Service<any>, index: number, arr: Service<any>[]) => void) {
  const toastsByPlacement = getToastsByPlacement(ctx.toasts)
  const currentToasts = toastsByPlacement[ctx.placement!] ?? []
  currentToasts.forEach(fn)
}
