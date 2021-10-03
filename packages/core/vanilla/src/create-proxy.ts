import { cast } from "tiny-fn"
import { proxyWithComputed } from "valtio/utils"
import { ActionTypes, Dict, StateMachine as S } from "./types"

export function createProxy<TContext, TState extends S.StateSchema, TEvent extends S.EventObject>(
  config: S.MachineConfig<TContext, TState, TEvent>,
) {
  const defaultContext = cast<TContext>({})
  const context = proxyWithComputed(config.context ?? defaultContext, config.computed ?? {})

  const state = proxyWithComputed(
    {
      value: "",
      previousValue: "",
      event: cast<Dict>({}),
      context,
      done: false,
      tags: new Set<TState["tags"]>(),
      hasTag(tag: TState["tags"]): boolean {
        return this.tags.has(tag)
      },
      matches(...value: string[]): boolean {
        return value.includes(this.value)
      },
      can(event: string): boolean {
        return cast<any>(this).nextEvents.includes(event)
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
        if (self.event.value === ActionTypes.Init || !self.previousValue) return false
        return self.value !== self.previousValue
      },
    },
  )
  return cast<S.State<TContext, TState>>(state)
}
