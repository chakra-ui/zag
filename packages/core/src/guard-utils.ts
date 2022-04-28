import { isFunction, isString } from "@zag-js/utils"
import { Dict, StateMachine as S } from "./types"
import { isGuardHelper } from "./utils"

const Truthy = () => true

/* -----------------------------------------------------------------------------
 * The following functions are used to determine a guard's truthiness
 * -----------------------------------------------------------------------------*/

function exec<TContext, TEvent extends S.EventObject>(guardMap: Dict, ctx: TContext, event: TEvent) {
  return (guard: S.Guard<TContext, TEvent>) => {
    if (isString(guard)) {
      return !!guardMap[guard]?.(ctx, event)
    }
    if (isFunction(guard)) {
      return guard(ctx, event)
    }
    return guard.predicate(guardMap)(ctx, event)
  }
}

/* -----------------------------------------------------------------------------
 * Guard helpers (for combining guards)
 * -----------------------------------------------------------------------------*/

function or<TContext, TEvent extends S.EventObject>(
  ...conditions: Array<S.Guard<TContext, TEvent>>
): S.GuardHelper<TContext, TEvent> {
  return {
    predicate: (guardMap: Dict) => (ctx: TContext, event: TEvent) =>
      conditions.map(exec(guardMap, ctx, event)).some(Boolean),
  }
}

function and<TContext, TEvent extends S.EventObject>(
  ...conditions: Array<S.Guard<TContext, TEvent>>
): S.GuardHelper<TContext, TEvent> {
  return {
    predicate: (guardMap: Dict) => (ctx: TContext, event: TEvent) =>
      conditions.map(exec(guardMap, ctx, event)).every(Boolean),
  }
}

function not<TContext, TEvent extends S.EventObject>(
  condition: S.Guard<TContext, TEvent>,
): S.GuardHelper<TContext, TEvent> {
  return {
    predicate: (guardMap: Dict) => (ctx: TContext, event: TEvent) => {
      return !exec(guardMap, ctx, event)(condition)
    },
  }
}

export const guards = { or, and, not }

/* -----------------------------------------------------------------------------
 * Action guard helper. Used to determie the action to be taken
 * -----------------------------------------------------------------------------*/

export function choose<TContext, TState extends S.StateSchema, TEvent extends S.EventObject = S.AnyEventObject>(
  actions: Array<{ guard?: S.Guard<TContext, TEvent>; actions: S.PureActions<TContext, TState, TEvent> }>,
): S.ChooseHelper<TContext, TState, TEvent> {
  return {
    predicate: (guardMap: Dict) => (ctx: TContext, event: TEvent) =>
      actions.find((def) => {
        const guard = def.guard ?? Truthy
        return exec(guardMap, ctx, event)(guard)
      })?.actions,
  }
}

/* -----------------------------------------------------------------------------
 * Function to determine the guard to be used
 * -----------------------------------------------------------------------------*/

export function determineGuardFn<TContext, TEvent extends S.EventObject>(
  guard: S.Guard<TContext, TEvent> | undefined,
  guardMap: S.GuardMap<TContext, TEvent>,
) {
  guard = guard ?? Truthy
  return (context: TContext, event: TEvent) => {
    if (isString(guard)) {
      const value = guardMap[guard]
      return isFunction(value) ? value(context, event) : value
    }

    if (isGuardHelper(guard)) {
      return guard.predicate(guardMap)(context, event)
    }

    return guard?.(context, event)
  }
}

/* -----------------------------------------------------------------------------
 * Function to determine the actions to be taken
 * -----------------------------------------------------------------------------*/

export function determineActionsFn<TContext, TState extends S.StateSchema, TEvent extends S.EventObject>(
  values: S.Actions<TContext, TState, TEvent> | undefined,
  guardMap: S.GuardMap<TContext, TEvent>,
) {
  return (context: TContext, event: TEvent) => {
    if (isGuardHelper(values)) {
      return values.predicate(guardMap)(context, event)
    }
    return values
  }
}
