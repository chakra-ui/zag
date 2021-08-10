import { cast } from "@core-foundation/utils/fn"
import { proxyWithComputed as proxy } from "valtio/utils"
import { ActionTypes, Dict, StateMachine as S } from "./types"

export function createProxyState<TContext, TState extends S.StateSchema, TEvent extends S.EventObject>(
  config: S.MachineConfig<TContext, TState, TEvent>,
) {
  const defaultContext = cast<TContext>({})
  const state = proxy(
    {
      value: "",
      previousValue: "",
      event: "",
      context: config.context ?? defaultContext,
      done: false,
      tags: new Set<TState["tags"]>(),
      hasTag(tag: TState["tags"]): boolean {
        return this.tags.has(tag)
      },
      matches(...value: string[]): boolean {
        return value.includes(this.value)
      },
    },
    {
      nextEvents(self) {
        const stateEvents = (config.states as Dict)?.[self.value]?.["on"] ?? {}
        const globalEvents = config?.on ?? {}
        Object.assign(stateEvents, globalEvents)
        return Object.keys(stateEvents).filter((event) => event !== ActionTypes.Sync)
      },
      changed(self) {
        if (self.event === ActionTypes.Init || !self.previousValue) return false
        return self.value !== self.previousValue
      },
    },
  )
  return cast<S.State<TContext, TState>>(state)
}
