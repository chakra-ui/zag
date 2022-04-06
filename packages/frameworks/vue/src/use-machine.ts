import type { MachineSrc, StateMachine as S } from "@zag-js/core"
import { computed, ComputedRef, onBeforeUnmount, onMounted, Ref, shallowRef, watch } from "vue"

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
  const { actions, state: hydratedState, context, preserve } = options ?? {}

  const resolvedMachine = typeof machine === "function" ? machine() : preserve ? machine : machine.clone()
  const service = options ? resolvedMachine.withOptions(options) : resolvedMachine

  const state = shallowRef<S.State<TContext, TState>>(service.state)
  const consumableState = computed({
    get() {
      return state.value
    },
    set(value: S.State<TContext, TState>) {
      if (state.value !== value) {
        state.value = value
      }
    },
  })

  service.start(hydratedState)

  let unsubscribe: VoidFunction

  onMounted(() => {
    unsubscribe = service.subscribe((nextState) => {
      consumableState.value = nextState
    })
  })

  onBeforeUnmount(() => {
    unsubscribe?.()
    service.stop()
  })

  watch(() => actions, service.setActions, { flush: "post", immediate: true })

  if (context) {
    watch(
      context,
      (ctx) => {
        service.setContext(ctx)
      },
      { immediate: true, deep: true },
    )
  }

  return [consumableState, service.send, service] as const
}
