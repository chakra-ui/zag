import { createMachine } from "@zag-js/core"
import { trackDismissableBranch } from "@zag-js/dismissable"
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
      initial: ctx.overlap ? "overlap" : "stack",
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
        toasts: ["collapsedIfEmpty", "setDismissableBranch"],
      },

      exit: ["removeToasts", "disposeCleanup"],

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
        "DOC.HOTKEY": {
          actions: ["focusRegionEl"],
        },
      },

      states: {
        stack: {
          on: {
            "REGION.POINTER_LEAVE": {
              target: "overlap",
              actions: ["collapseToasts"],
            },
            "REGION.OVERLAP": "overlap",
          },
        },
        overlap: {
          on: {
            "REGION.POINTER_ENTER": {
              target: "stack",
              actions: ["expandToasts", "requestHeights"],
            },
            "REGION.FOCUS": {
              target: "stack",
              actions: ["expandToasts", "requestHeights"],
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
            send({ type: "DOC.HOTKEY" })
          }
          return addDomEvent(document, "keydown", handleKeyDown, { capture: true })
        },
      },
      actions: {
        setDismissableBranch(ctx) {
          const toastsByPlacement = getToastsByPlacement(ctx.toasts)
          const currentToasts = toastsByPlacement[ctx.placement!] ?? []

          const hasToasts = currentToasts.length > 0

          if (!hasToasts) {
            ctx._cleanup?.()
            return
          }

          if (hasToasts && ctx._cleanup) {
            return
          }

          //  mark toast as a dismissable branch
          //  so that interacting with them will not close dismissable layers
          const groupEl = () => dom.getRegionEl(ctx, ctx.placement!)
          ctx._cleanup = trackDismissableBranch(groupEl, { defer: true })
        },
        disposeCleanup(ctx) {
          ctx._cleanup?.()
        },
        focusRegionEl(ctx) {
          queueMicrotask(() => {
            dom.getRegionEl(ctx, ctx.placement!)?.focus()
          })
        },
        expandToasts(ctx) {
          each(ctx, (toast) => {
            toast.state.context.stacked = true
          })
        },
        collapseToasts(ctx) {
          each(ctx, (toast) => {
            toast.state.context.stacked = false
          })
        },
        collapsedIfEmpty(ctx, _evt, { send }) {
          if (!ctx.overlap || ctx.toasts.length > 1) return
          send("REGION.OVERLAP")
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
            stacked: getState().matches("stack"),
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
            // Note: This is an intentional side effect
            // consider writing directly to the DOM (root element)
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
