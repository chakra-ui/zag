import { Machine, StateMachine as S } from "@ui-machines/core"
import { onCleanup } from "solid-js"
import { createStore } from "solid-js/store"
import { unwrap } from "./unwrap"

export function useActor<
  TContext extends Record<string, any>,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(service: Machine<TContext, TState, TEvent>) {
  const [current, setCurrent] = createStore<any>(unwrap(service.state))

  const unsubscribe = service.subscribe((state) => {
    setCurrent(state)
  })

  onCleanup(() => {
    unsubscribe()
  })

  return [current as S.State<TContext, TState, TEvent>, service.send] as const
}
