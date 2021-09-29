import { is } from "tiny-guard"
import { Dict, StateMachine as S } from "./types"

function or<TContext, TEvent extends S.EventObject>(
  ...conditions: Array<string | S.ConditionHelper<TContext, TEvent>>
): S.ConditionHelper<TContext, TEvent> {
  return {
    toString: () => conditions.map((c) => c.toString()).join(" || "),
    exec: (guards: Dict) => (ctx: TContext, event: TEvent) =>
      conditions
        .map((condition) => {
          if (is.str(condition)) {
            return !!guards[condition]?.(ctx, event)
          }
          return condition.exec(guards)(ctx, event)
        })
        .some(Boolean),
  }
}

function and<TContext, TEvent extends S.EventObject>(
  ...conditions: Array<string | S.ConditionHelper<TContext, TEvent>>
): S.ConditionHelper<TContext, TEvent> {
  return {
    toString: () => conditions.map((c) => c.toString()).join(" && "),
    exec: (guards: Dict) => (ctx: TContext, event: TEvent) =>
      conditions
        .map((condition) => {
          if (is.str(condition)) {
            return !!guards[condition]?.(ctx, event)
          }
          return condition.exec(guards)(ctx, event)
        })
        .every(Boolean),
  }
}

function not<TContext, TEvent extends S.EventObject>(
  condition: string | S.ConditionHelper<TContext, TEvent>,
): S.ConditionHelper<TContext, TEvent> {
  return {
    toString: () => `!(${condition.toString()})`,
    exec: (guardMap: Dict) => (ctx: TContext, event: TEvent) => {
      if (is.str(condition)) {
        return !guardMap[condition]?.(ctx, event)
      }
      return !condition.exec(guardMap)(ctx, event)
    },
  }
}

export const guards = { or, and, not }

export function isGuardHelper(value: unknown): value is { exec: Function } {
  return is.obj(value) && value.exec != null
}

export const TruthyGuard = () => true

/**
 * Guards or conditions can be specified as:
 * - a string (reference to `options.guards`)
 * - a function that returns a number (in ms)
 */
export function determineGuardFn<TContext, TEvent extends S.EventObject>(
  cond: S.Condition<TContext, TEvent> | undefined,
  guardMap: S.GuardMap<TContext, TEvent> | undefined,
) {
  cond = cond ?? TruthyGuard
  return (context: TContext, event: TEvent) => {
    if (is.str(cond)) {
      const value = guardMap?.[cond]
      return is.func(value) ? value(context, event) : value
    }

    if (isGuardHelper(cond)) {
      return cond.exec(guardMap ?? {})(context, event)
    }

    return cond?.(context, event)
  }
}
