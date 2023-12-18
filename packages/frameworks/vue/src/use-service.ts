import type { MachineSrc, StateMachine as S } from "@zag-js/core"
import { onBeforeUnmount, onMounted, unref } from "vue"
import type { MachineOptions } from "./types"

export function useService<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(machine: MachineSrc<TContext, TState, TEvent>, options?: MachineOptions<TContext, TState, TEvent>) {
  const { state: hydratedState, context } = options ?? {}

  const _machine = typeof machine === "function" ? machine() : machine
  const service = context ? _machine.withContext(unref(context)) : _machine

  onMounted(() => {
    service.start(hydratedState)

    onBeforeUnmount(() => {
      service.stop()
    })
  })

  return service
}
