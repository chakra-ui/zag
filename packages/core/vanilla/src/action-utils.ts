import { is } from "tiny-guard"
import { Dict, StateMachine as S } from "./types"

export function choose<TContext, TEvent extends S.EventObject = S.AnyEventObject>(
  actions: Array<{ cond?: S.Condition<TContext, TEvent>; actions: S.PureActions<TContext, TEvent> }>,
): S.ChooseHelper<TContext, TEvent> {
  return {
    exec: (guardMap: Dict) => (ctx: TContext, event: TEvent) =>
      actions.find((def) => {
        def.cond = def.cond || (() => true)
        if (is.str(def.cond)) {
          return !!guardMap[def.cond]?.(ctx, event)
        }

        if (isGuardHelper(def.cond)) {
          return def.cond.exec(guardMap ?? {})(ctx, event)
        }

        return def.cond(ctx, event)
      })?.actions,
  }
}

function isGuardHelper(value: any): value is { exec: Function } {
  return is.obj(value) && value.exec != null
}

export function determineActionsFn<TContext, TEvent extends S.EventObject>(
  values: S.Actions<TContext, TEvent> | undefined,
  guardMap: S.GuardMap<TContext, TEvent> | undefined,
) {
  return (context: TContext, event: TEvent) => {
    if (isGuardHelper(values)) return values.exec(guardMap ?? {})(context, event)
    return values
  }
}
