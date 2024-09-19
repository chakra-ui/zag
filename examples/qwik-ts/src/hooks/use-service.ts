import { NoSerialize, noSerialize, useComputed$, useStore, useVisibleTask$ } from "@builder.io/qwik"
import type { Machine, StateMachine as S } from "@zag-js/core"
import { UseMachineOptions } from "~/hooks/types"

export function useService<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject,
>(props: UseMachineOptions<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
  const { qrl, initialState } = props
  const { state: hydratedState, context } = options ?? {}

  const store = useStore<{
    service: NoSerialize<Machine<TContext, TState, TEvent>> | null
  }>({
    service: null,
  })

  useVisibleTask$(async ({ track, cleanup }) => {
    // Load the service
    const service = await qrl()

    if (context) {
      service!.setContext(context)
      track(context)
    }

    service!.start(hydratedState ?? initialState)

    store.service = noSerialize(service)

    cleanup(() => {
      service!.stop()
    })
  })

  return useComputed$(() => store.service)
}
