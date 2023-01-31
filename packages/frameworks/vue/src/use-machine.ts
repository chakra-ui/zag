import type { MachineSrc, StateMachine as S } from "@zag-js/core"
import { ComputedRef, onBeforeUnmount, onMounted, Ref, shallowRef, watch, watchEffect } from "vue"

export type MachineRuntimeScope = "global" | "component"

type MachineOptions<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
> = Omit<S.HookOptions<TContext, TState, TEvent>, "context"> & {
  context?: Ref<S.UserContext<TContext>> | ComputedRef<S.UserContext<TContext>>
  scope?: MachineRuntimeScope
}

export function useService<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: MachineOptions<TContext, TState, TEvent>) {
  const { actions, state: hydratedState, context } = options ?? { scope: "component" }

  const _machine = typeof machine === "function" ? machine() : machine
  const service = context ? _machine.withContext(context.value) : _machine

  if (!options?.scope || options?.scope === "component") {
    onMounted(() => {
      service.start(hydratedState)

      if (service.state.can("SETUP")) {
        service.send("SETUP")
      }

      onBeforeUnmount(() => {
        service.stop()
      })
    })
  }

  if (options?.scope === "global" && typeof window !== "undefined") {
    window.addEventListener("load", () => {
      service.start(hydratedState)

      if (service.state.can("SETUP")) {
        service.send("SETUP")
      }

      window.addEventListener("beforeunload", () => {
        service.stop()
      })
    })
  }

  watchEffect(() => {
    service.setOptions({ actions })
  })

  if (context) {
    watch(context, service.setContext, { deep: true })
  }

  return service
}

export function useMachine<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(
  machine: MachineSrc<TContext, TState, TEvent>,
  options?: Omit<S.HookOptions<TContext, TState, TEvent>, "context"> & {
    context?: Ref<S.UserContext<TContext>> | ComputedRef<S.UserContext<TContext>>
    scope?: MachineRuntimeScope
  },
) {
  const service = useService(machine, options)
  const state = shallowRef(service.state)

  if (!options?.scope || options?.scope === "component") {
    onMounted(() => {
      const unsubscribe = service.subscribe((nextState) => {
        state.value = nextState
      })

      onBeforeUnmount(() => {
        unsubscribe?.()
      })
    })
  }

  if (options?.scope === "global" && typeof window !== "undefined") {
    window.addEventListener("load", () => {
      const unsubscribe = service.subscribe((nextState) => {
        state.value = nextState
      })
      window.addEventListener("beforeunload", () => {
        unsubscribe?.()
      })
    })
  }

  return [state, service.send, service] as const
}
