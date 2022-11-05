import type { MachineSrc, StateMachine as S } from "@zag-js/core"
import { compact } from "@zag-js/utils"
import { ComputedRef, onBeforeUnmount, onMounted, Ref, shallowRef, watch } from "vue"

type MachineOptions<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
> = Omit<S.HookOptions<TContext, TState, TEvent>, "context"> & {
  context?: Ref<S.UserContext<TContext>> | ComputedRef<S.UserContext<TContext>>
}

export function useService<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: MachineOptions<TContext, TState, TEvent>) {
  const { actions, state: hydratedState, context } = options ?? {}

  const _machine = typeof machine === "function" ? machine() : machine
  const service = context ? _machine.withContext(compact(context.value)) : _machine

  onMounted(() => {
    service.start(hydratedState)

    if (service.state.can("SETUP")) {
      service.send("SETUP")
    }

    onBeforeUnmount(() => {
      service.stop()
    })
  })

  watch(() => actions, service.setActions, { flush: "post", immediate: true })

  if (context) {
    watch(context, (ctx) => service.setContext(compact(ctx)), { deep: true })
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
  },
) {
  const service = useService(machine, options)
  const state = shallowRef(service.state)

  onMounted(() => {
    const unsubscribe = service.subscribe((nextState) => {
      state.value = nextState
    })

    onBeforeUnmount(() => {
      unsubscribe?.()
    })
  })

  return [state, service.send, service] as const
}
