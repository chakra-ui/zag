import { proxy, proxyWithComputed } from "@zag-js/store"
import { cast } from "@zag-js/utils"
import { ActionTypes, type Dict, type StateMachine as S } from "./types"

export function createProxy<TContext extends Dict, TState extends S.StateSchema, TEvent extends S.EventObject>(
  config: S.MachineConfig<TContext, TState, TEvent>,
) {
  const computedContext: Dict = config.computed ?? cast<S.TComputedContext<TContext>>({})
  const initialContext = config.context ?? cast<TContext>({})
  const initialTags = config.initial ? config.states?.[config.initial]?.tags : []

  const state = proxy({
    value: config.initial ?? "",
    previousValue: "",
    event: cast<Dict>({}),
    previousEvent: cast<Dict>({}),
    context: proxyWithComputed(initialContext, computedContext),
    done: false,
    tags: (initialTags ?? []) as Array<TState["tags"]>,
    hasTag(tag: TState["tags"]): boolean {
      return this.tags.includes(tag)
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

  return cast<S.State<TContext, TState, TEvent>>(state)
}
