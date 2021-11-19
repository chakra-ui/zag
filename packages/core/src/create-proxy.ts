import { proxy } from "valtio"
import { cast } from "../../utils/functions"
import { ActionTypes, Dict, StateMachine as S } from "./types"

export function createProxy<TContext, TState extends S.StateSchema, TEvent extends S.EventObject>(
  config: S.MachineConfig<TContext, TState, TEvent>,
) {
  const state = proxy({
    value: "",
    previousValue: "",
    event: cast<Dict>({}),
    context: config.context ?? cast<TContext>({}),
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
    get nextEvents() {
      const stateEvents = (config.states as Dict)?.[this.value]?.["on"] ?? {}
      const globalEvents = config?.on ?? {}
      return Object.keys({ ...stateEvents, ...globalEvents })
    },
    get changed() {
      if (this.event.value === ActionTypes.Init || !this.previousValue) return false
      return this.value !== this.previousValue
    },
  })
  return cast<S.State<TContext, TState>>(state)
}
