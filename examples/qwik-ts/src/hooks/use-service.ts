import { NoSerialize, noSerialize, useSignal, useVisibleTask$ } from "@builder.io/qwik"
import type { Machine, StateMachine as S } from "@zag-js/core"

interface UseServiceOptions<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject,
> {
  qrl: () => Promise<NoSerialize<Machine<TContext, TState, TEvent>>>
  initialState: NoSerialize<S.State<TContext, TState>>
}

export function useService<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject,
>(props: UseServiceOptions<TContext, TState, TEvent>, options?: S.HookOptions<TContext, TState, TEvent>) {
  const { qrl, initialState } = props
  const { state: hydratedState, context } = options ?? {}

  const serviceSignal = useSignal<NoSerialize<Machine<TContext, TState, TEvent>> | null>(null)

  useVisibleTask$(async ({ track, cleanup }) => {
    // Load the service
    const service = await qrl()

    if (context) {
      service!.setContext(context)
      track(context)
    }

    service!.start(hydratedState ?? initialState)

    serviceSignal.value = noSerialize(service)
    // store.service = noSerialize(service)

    cleanup(() => {
      service!.stop()
    })
  })

  return serviceSignal
}
