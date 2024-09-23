import { type NoSerialize, noSerialize, type Signal, useComputed$, useSignal, useVisibleTask$ } from "@builder.io/qwik"
import type { Machine, StateMachine as S } from "@zag-js/core"

export function useSnapshot<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject,
>(
  serviceSignal: Signal<NoSerialize<Machine<TContext, TState, TEvent>> | null>,
  options?: S.HookOptions<TContext, TState, TEvent>,
  initialState?: NoSerialize<S.State<TContext, TState, S.AnyEventObject>>,
) {
  const { actions } = options ?? {}

  const stateSignal = useSignal<NoSerialize<S.State<TContext, TState>> | null>(initialState)

  useVisibleTask$(({ track, cleanup }) => {
    track(() => serviceSignal.value)

    const service = serviceSignal.value
    if (!service) return

    stateSignal.value = noSerialize(service.getState())

    const unsubscribe = service.subscribe((state: any) => {
      stateSignal.value = noSerialize(state)
    })

    service.setOptions({ actions })

    cleanup(() => {
      unsubscribe()
    })
  })

  return useComputed$(() => stateSignal.value)
}
