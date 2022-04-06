import { isObject, isString } from "@zag-js/utils"
import { Dict, StateMachine as S } from "./types"

export function choose<TContext, TState extends S.StateSchema, TEvent extends S.EventObject = S.AnyEventObject>(
  actions: Array<{ guard?: S.Guard<TContext, TEvent>; actions: S.PureActions<TContext, TState, TEvent> }>,
): S.ChooseHelper<TContext, TState, TEvent> {
  return {
    predicate: (guardMap: Dict) => (ctx: TContext, event: TEvent) =>
      actions.find((def) => {
        def.guard = def.guard || (() => true)
        if (isString(def.guard)) {
          return !!guardMap[def.guard]?.(ctx, event)
        }

        if (isGuardHelper(def.guard)) {
          return def.guard.predicate(guardMap ?? {})(ctx, event)
        }

        return def.guard(ctx, event)
      })?.actions,
  }
}

function isGuardHelper(value: any): value is { predicate: Function } {
  return isObject(value) && value.predicate != null
}

export function determineActionsFn<TContext, TState extends S.StateSchema, TEvent extends S.EventObject>(
  values: S.Actions<TContext, TState, TEvent> | undefined,
  guardMap: S.GuardMap<TContext, TEvent> | undefined,
) {
  return (context: TContext, event: TEvent) => {
    if (isGuardHelper(values)) return values.predicate(guardMap ?? {})(context, event)
    return values
  }
}
