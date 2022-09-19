import { isFunction, isString } from "@zag-js/utils"
import type { Dict, StateMachine as S } from "./types"
import { isGuardHelper } from "./utils"

const Truthy = () => true

/* -----------------------------------------------------------------------------
 * The following functions are used to determine a guard's truthiness
 * -----------------------------------------------------------------------------*/

function exec<TContext extends Dict, TState extends S.StateSchema, TEvent extends S.EventObject>(
  guardMap: Dict,
  ctx: TContext,
  event: TEvent,
  meta: S.GuardMeta<TContext, TState, TEvent>,
) {
  return (guard: S.Guard<TContext, TState, TEvent>) => {
    if (isString(guard)) {
      return !!guardMap[guard]?.(ctx, event, meta)
    }
    if (isFunction(guard)) {
      return guard(ctx, event, meta)
    }
    return guard.predicate(guardMap)(ctx, event, meta)
  }
}

/* -----------------------------------------------------------------------------
 * Guard helpers (for combining guards)
 * -----------------------------------------------------------------------------*/

function or<TContext extends Dict, TState extends S.StateSchema, TEvent extends S.EventObject>(
  ...conditions: Array<S.Guard<TContext, TState, TEvent>>
): S.GuardHelper<TContext, TState, TEvent> {
  return {
    predicate: (guardMap: Dict) => (ctx: TContext, event: TEvent, meta: S.GuardMeta<TContext, TState, TEvent>) =>
      conditions.map(exec(guardMap, ctx, event, meta)).some(Boolean),
  }
}

function and<TContext extends Dict, TState extends S.StateSchema, TEvent extends S.EventObject>(
  ...conditions: Array<S.Guard<TContext, TState, TEvent>>
): S.GuardHelper<TContext, TState, TEvent> {
  return {
    predicate: (guardMap: Dict) => (ctx: TContext, event: TEvent, meta: S.GuardMeta<TContext, TState, TEvent>) =>
      conditions.map(exec(guardMap, ctx, event, meta)).every(Boolean),
  }
}

function not<TContext extends Dict, TState extends S.StateSchema, TEvent extends S.EventObject>(
  condition: S.Guard<TContext, TState, TEvent>,
): S.GuardHelper<TContext, TState, TEvent> {
  return {
    predicate: (guardMap: Dict) => (ctx: TContext, event: TEvent, meta: S.GuardMeta<TContext, TState, TEvent>) => {
      return !exec(guardMap, ctx, event, meta)(condition)
    },
  }
}

function stateIn<TContext extends Dict, TState extends S.StateSchema, TEvent extends S.EventObject>(
  ...values: TState["value"][]
): S.GuardExpression<TContext, TState, TEvent> {
  return (_ctx, _evt, meta) => meta.state.matches(...values)
}

export const guards = { or, and, not, stateIn }

/* -----------------------------------------------------------------------------
 * Action guard helper. Used to determie the action to be taken
 * -----------------------------------------------------------------------------*/

export function choose<
  TContext extends Dict,
  TState extends S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(
  actions: Array<{ guard?: S.Guard<TContext, TState, TEvent>; actions: S.PureActions<TContext, TState, TEvent> }>,
): S.ChooseHelper<TContext, TState, TEvent> {
  return {
    predicate: (guardMap: Dict) => (ctx: TContext, event: TEvent, meta: S.GuardMeta<TContext, TState, TEvent>) =>
      actions.find((def) => {
        const guard = def.guard ?? Truthy
        return exec(guardMap, ctx, event, meta)(guard)
      })?.actions,
  }
}

/* -----------------------------------------------------------------------------
 * Function to determine the guard to be used
 * -----------------------------------------------------------------------------*/

export function determineGuardFn<TContext extends Dict, TState extends S.StateSchema, TEvent extends S.EventObject>(
  guard: S.Guard<TContext, TState, TEvent> | undefined,
  guardMap: S.GuardMap<TContext, TState, TEvent>,
) {
  guard = guard ?? Truthy
  return (context: TContext, event: TEvent, meta: S.GuardMeta<TContext, TState, TEvent>) => {
    if (isString(guard)) {
      const value = guardMap[guard]
      return isFunction(value) ? value(context, event, meta) : value
    }

    if (isGuardHelper(guard)) {
      return guard.predicate(guardMap)(context, event, meta)
    }

    return guard?.(context, event, meta)
  }
}

/* -----------------------------------------------------------------------------
 * Function to determine the actions to be taken
 * -----------------------------------------------------------------------------*/

export function determineActionsFn<TContext extends Dict, TState extends S.StateSchema, TEvent extends S.EventObject>(
  values: S.Actions<TContext, TState, TEvent> | undefined,
  guardMap: S.GuardMap<TContext, TState, TEvent>,
) {
  return (context: TContext, event: TEvent, meta: S.GuardMeta<TContext, TState, TEvent>) => {
    if (isGuardHelper(values)) {
      return values.predicate(guardMap)(context, event, meta)
    }
    return values
  }
}
