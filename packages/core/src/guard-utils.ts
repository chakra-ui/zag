import { isFunction, isObject, isString } from "@ui-machines/utils"
import { Dict, StateMachine as S } from "./types"

function or<TContext, TEvent extends S.EventObject>(
  ...conditions: Array<string | S.GuardHelper<TContext, TEvent> | S.GuardExpression<TContext, TEvent>>
): S.GuardHelper<TContext, TEvent> {
  return {
    exec: (guards: Dict) => (ctx: TContext, event: TEvent) =>
      conditions
        .map((condition) => {
          if (isString(condition)) {
            return !!guards[condition]?.(ctx, event)
          }
          if (isFunction(condition)) {
            return condition(ctx, event)
          }
          return condition.exec(guards)(ctx, event)
        })
        .some(Boolean),
  }
}

function and<TContext, TEvent extends S.EventObject>(
  ...conditions: Array<string | S.GuardHelper<TContext, TEvent> | S.GuardExpression<TContext, TEvent>>
): S.GuardHelper<TContext, TEvent> {
  return {
    exec: (guards: Dict) => (ctx: TContext, event: TEvent) =>
      conditions
        .map((condition) => {
          if (isString(condition)) {
            return !!guards[condition]?.(ctx, event)
          }
          if (isFunction(condition)) {
            return condition(ctx, event)
          }
          return condition.exec(guards)(ctx, event)
        })
        .every(Boolean),
  }
}

function not<TContext, TEvent extends S.EventObject>(
  condition: string | S.GuardHelper<TContext, TEvent> | S.GuardExpression<TContext, TEvent>,
): S.GuardHelper<TContext, TEvent> {
  return {
    exec: (guardMap: Dict) => (ctx: TContext, event: TEvent) => {
      if (isString(condition)) {
        return !guardMap[condition]?.(ctx, event)
      }
      if (isFunction(condition)) {
        return !condition(ctx, event)
      }
      return !condition.exec(guardMap)(ctx, event)
    },
  }
}

export const guards = { or, and, not }

export function isGuardHelper(value: unknown): value is { exec: Function } {
  return isObject(value) && value.exec != null
}

export const TruthyGuard = () => true

/**
 * Guards or conditions can be specified as:
 * - a string (reference to `options.guards`)
 * - a function that returns a number (in ms)
 */
export function determineGuardFn<TContext, TEvent extends S.EventObject>(
  guard: S.Guard<TContext, TEvent> | undefined,
  guardMap: S.GuardMap<TContext, TEvent> | undefined,
) {
  guard = guard ?? TruthyGuard
  return (context: TContext, event: TEvent) => {
    if (isString(guard)) {
      const value = guardMap?.[guard]
      return isFunction(value) ? value(context, event) : value
    }

    if (isGuardHelper(guard)) {
      return guard.exec(guardMap ?? {})(context, event)
    }

    return guard?.(context, event)
  }
}
