import { createGuards, createMachine, type Service } from "@zag-js/core"
import { raf } from "@zag-js/dom-query"
import { setRafTimeout } from "@zag-js/utils"
import * as dom from "./toast.dom"
import type { ToastGroupSchema, ToastHeight, ToastSchema } from "./toast.types"
import { getToastDuration } from "./toast.utils"

const { not } = createGuards<ToastSchema>()

export const machine = createMachine<ToastSchema>({
  props({ props }) {
    return {
      removeDelay: 200,
      placement: "bottom",
      closable: true,
      type: "info",
      offset: 0,
      ...props,
      id: props.id!,
      parent: props.parent!,
      gap: props.parent!.prop("gap"),
      duration: getToastDuration(props.duration, props.type!),
    }
  },

  initialState({ prop }) {
    const persist = prop("type") === "loading" || prop("duration") === Infinity
    return persist ? "visible:persist" : "visible"
  },

  context({ prop, bindable }) {
    return {
      remainingTime: bindable<number>(() => ({
        defaultValue: getToastDuration(prop("duration"), prop("type")),
      })),
      createdAt: bindable<number>(() => ({
        defaultValue: Date.now(),
      })),
      mounted: bindable<boolean>(() => ({
        defaultValue: false,
      })),
      initialHeight: bindable<number>(() => ({
        defaultValue: 0,
      })),
    }
  },

  refs() {
    return {
      closeTimerStartTime: Date.now(),
      lastCloseStartTimerStartTime: 0,
    }
  },

  computed: {
    zIndex: ({ prop }) => {
      const toasts = prop("parent").context.get("toasts")
      const index = toasts.findIndex((toast) => toast.id === prop("id"))
      return toasts.length - index
    },
    height: ({ prop }) => {
      const heights = prop("parent").context.get("heights")
      const height = heights.find((height) => height.id === prop("id"))
      return height?.height ?? 0
    },
    heightIndex: ({ prop }) => {
      const heights = prop("parent").context.get("heights")
      return heights.findIndex((height) => height.id === prop("id"))
    },
    frontmost: ({ prop }) => prop("index") === 0,
    heightBefore: ({ prop }) => {
      const heights = prop("parent").context.get("heights")
      const heightIndex = heights.findIndex((height) => height.id === prop("id"))
      return heights.reduce((prev, curr, reducerIndex) => {
        if (reducerIndex >= heightIndex) return prev
        return prev + curr.height
      }, 0)
    },
    shouldPersist: ({ prop }) => prop("type") === "loading" || prop("duration") === Infinity,
  },

  watch({ track, prop, send }) {
    track([() => prop("message")], () => {
      const message = prop("message")
      if (message) send({ type: message, src: "programmatic" })
    })

    track([() => prop("type"), () => prop("duration")], () => {
      send({ type: "UPDATE" })
    })
  },

  on: {
    UPDATE: [
      {
        guard: "shouldPersist",
        target: "visible:persist",
        actions: ["resetCloseTimer"],
      },
      {
        target: "visible:updating",
        actions: ["resetCloseTimer"],
      },
    ],
    MEASURE: {
      actions: ["measureHeight"],
    },
  },

  entry: ["setMounted", "measureHeight", "invokeOnVisible"],

  effects: ["trackHeight"],

  states: {
    "visible:updating": {
      tags: ["visible", "updating"],
      effects: ["waitForNextTick"],
      on: {
        SHOW: {
          target: "visible",
        },
      },
    },

    "visible:persist": {
      tags: ["visible", "paused"],
      on: {
        RESUME: {
          guard: not("isLoadingType"),
          target: "visible",
          actions: ["setCloseTimer"],
        },
        DISMISS: {
          target: "dismissing",
        },
      },
    },

    visible: {
      tags: ["visible"],
      effects: ["waitForDuration"],
      on: {
        DISMISS: {
          target: "dismissing",
        },
        PAUSE: {
          target: "visible:persist",
          actions: ["syncRemainingTime"],
        },
      },
    },

    dismissing: {
      entry: ["invokeOnDismiss"],
      effects: ["waitForRemoveDelay"],
      on: {
        REMOVE: {
          target: "unmounted",
          actions: ["notifyParentToRemove"],
        },
      },
    },

    unmounted: {
      entry: ["invokeOnUnmount"],
    },
  },

  implementations: {
    effects: {
      waitForRemoveDelay({ prop, send }) {
        return setRafTimeout(() => {
          send({ type: "REMOVE", src: "timer" })
        }, prop("removeDelay")!)
      },

      waitForDuration({ send, context, computed }) {
        if (computed("shouldPersist")) return
        return setRafTimeout(() => {
          send({ type: "DISMISS", src: "timer" })
        }, context.get("remainingTime")!)
      },

      waitForNextTick({ send }) {
        return setRafTimeout(() => {
          send({ type: "SHOW", src: "timer" })
        }, 0)
      },

      trackHeight({ scope, prop }) {
        let cleanup: VoidFunction | undefined
        raf(() => {
          const rootEl = dom.getRootEl(scope)
          if (!rootEl) return

          const syncHeight = () => {
            const originalHeight = rootEl.style.height
            rootEl.style.height = "auto"
            const height = rootEl.getBoundingClientRect().height
            rootEl.style.height = originalHeight

            const item = { id: prop("id"), height }
            setHeight(prop("parent"), item)
          }

          const win = scope.getWin()

          const observer = new win.MutationObserver(syncHeight)
          observer.observe(rootEl, {
            childList: true,
            subtree: true,
            characterData: true,
          })

          cleanup = () => observer.disconnect()
        })

        return () => cleanup?.()
      },
    },

    guards: {
      isLoadingType: ({ prop }) => prop("type") === "loading",
      shouldPersist: ({ computed }) => computed("shouldPersist"),
    },

    actions: {
      setMounted({ context }) {
        raf(() => {
          context.set("mounted", true)
        })
      },

      measureHeight({ scope, prop, context }) {
        queueMicrotask(() => {
          const rootEl = dom.getRootEl(scope)
          if (!rootEl) return

          const originalHeight = rootEl.style.height
          rootEl.style.height = "auto"
          const height = rootEl.getBoundingClientRect().height
          rootEl.style.height = originalHeight
          context.set("initialHeight", height)

          const item = { id: prop("id"), height }
          setHeight(prop("parent"), item)
        })
      },

      setCloseTimer({ refs }) {
        refs.set("closeTimerStartTime", Date.now())
      },

      resetCloseTimer({ context, refs, prop }) {
        refs.set("closeTimerStartTime", Date.now())
        context.set("remainingTime", getToastDuration(prop("duration"), prop("type")))
      },

      syncRemainingTime({ context, refs }) {
        context.set("remainingTime", (prev) => {
          const closeTimerStartTime = refs.get("closeTimerStartTime")
          const elapsedTime = Date.now() - closeTimerStartTime
          refs.set("lastCloseStartTimerStartTime", Date.now())
          return prev - elapsedTime
        })
      },

      notifyParentToRemove({ prop }) {
        const parent = prop("parent")
        parent.send({ type: "TOAST.REMOVE", id: prop("id") })
      },
      invokeOnDismiss({ prop, event }) {
        prop("onStatusChange")?.({ status: "dismissing", src: event.src })
      },
      invokeOnUnmount({ prop }) {
        prop("onStatusChange")?.({ status: "unmounted" })
      },
      invokeOnVisible({ prop }) {
        prop("onStatusChange")?.({ status: "visible" })
      },
    },
  },
})

function setHeight(parent: Service<ToastGroupSchema>, item: ToastHeight) {
  const { id, height } = item
  parent.context.set("heights", (prev) => {
    const alreadyExists = prev.find((i) => i.id === id)
    if (!alreadyExists) {
      return [{ id, height }, ...prev]
    } else {
      return prev.map((i) => (i.id === id ? { ...i, height } : i))
    }
  })
}
