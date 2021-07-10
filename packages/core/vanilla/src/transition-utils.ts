import { toArray } from "@ui-machines/utils/array"
import { isArray, isObject, isString } from "@ui-machines/utils/assertion"
import { determineGuardFn } from "./guard-utils"
import { StateMachine as S } from "./types"

/**
 * A transition is an object that describes the next state, or/and actions
 * that should run when an event is sent.
 *
 * Transitions can be specified as:
 * - A single string: "spinning"
 * - An object with `target`, `actions`, or `cond`: { target: "spinning", actions: [...], cond: isValid }
 * - An array of possible transitions. In this case, we'll pick the first matching transition
 * depending on the `cond` specified
 */

export function toTarget<
  TContext,
  TState extends string,
  TEvent extends S.EventObject,
>(
  target: S.Transition<TContext, TState, TEvent>,
): S.TransitionDefinition<TContext, TState, TEvent> {
  return isString(target) ? { target } : target
}

export function determineTransitionFn<
  TContext,
  TState extends string,
  TEvent extends S.EventObject,
>(
  transitions?: S.Transitions<TContext, TState, TEvent>,
  guardMap?: S.GuardMap<TContext, TEvent>,
) {
  return (context: TContext, event: TEvent) => {
    return toArray(transitions)
      .map(toTarget)
      .find((transition) => {
        // get condition function
        const determineGuard = determineGuardFn(transition.cond, guardMap)
        const cond = determineGuard(context, event)
        return cond ?? transition.target ?? transition.actions
      })
  }
}

export function toTransition<
  TContext,
  TState extends string,
  TEvent extends S.EventObject,
>(
  transition: S.Transitions<TContext, TState, TEvent> | undefined,
  current?: TState | null,
) {
  const resolvedTransition = isString(transition)
    ? toTarget(transition)
    : transition

  const callbackfn = (t: S.TransitionDefinition<TContext, TState, TEvent>) => {
    const isTargetless = t.actions && !t.target

    if (isTargetless && current) {
      t.target = current
    }

    return t
  }

  if (isArray(resolvedTransition)) {
    return resolvedTransition.map(callbackfn)
  }

  if (isObject(resolvedTransition)) {
    return callbackfn(resolvedTransition)
  }
}
