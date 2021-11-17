import { cast } from "tiny-fn"
import { isArray, isObject, isString } from "tiny-guard"
import { determineGuardFn } from "./guard-utils"
import type { StateMachine as S } from "./types"
import { toArray } from "./utils"

/**
 * A transition is an object that describes the next state, or/and actions
 * that should run when an event is sent.
 *
 * Transitions can be specified as:
 * - A single string: "spinning"
 * - An object with `target`, `actions`, or `guard`: { target: "spinning", actions: [...], guard: isValid }
 * - An array of possible transitions. In this case, we'll pick the first matching transition
 * depending on the `guard` specified
 */

export function toTarget<TContext, TState extends S.StateSchema, TEvent extends S.EventObject>(
  target: S.Transition<TContext, TState, TEvent>,
): S.TransitionDefinition<TContext, TState, TEvent> {
  return isString(target) ? { target } : target
}

export function determineTransitionFn<TContext, TState extends S.StateSchema, TEvent extends S.EventObject>(
  transitions?: S.Transitions<TContext, TState, TEvent>,
  guardMap?: S.GuardMap<TContext, TEvent>,
) {
  return (context: TContext, event: TEvent) => {
    return toArray(transitions)
      .map(toTarget)
      .find((transition) => {
        // get condition function
        const determineGuard = determineGuardFn(transition.guard, guardMap)
        const guard = determineGuard(context, event)
        return guard ?? transition.target ?? transition.actions
      })
  }
}

export function toTransition<TContext, TState extends S.StateSchema, TEvent extends S.EventObject>(
  transition: S.Transitions<TContext, TState, TEvent> | undefined,
  current?: TState["value"] | null,
) {
  const _transition = isString(transition) ? toTarget(transition) : transition

  const fn = (t: S.TransitionDefinition<TContext, TState, TEvent>) => {
    const isTargetless = t.actions && !t.target
    if (isTargetless && current) t.target = current
    return t
  }

  if (isArray(_transition)) {
    return _transition.map(fn)
  }

  if (isObject(_transition)) {
    return fn(cast(_transition))
  }
}
