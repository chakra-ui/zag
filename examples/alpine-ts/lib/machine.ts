import type {
  ActionsOrFn,
  Bindable,
  BindableContext,
  BindableRefs,
  ChooseFn,
  ComputedFn,
  EffectsOrFn,
  GuardFn,
  Machine,
  MachineSchema,
  Params,
  PropFn,
  Scope,
  Service,
  Transition,
} from "@zag-js/core"
import {
  createScope,
  findTransition,
  getExitEnterStates,
  hasTag,
  INIT_STATE,
  MachineStatus,
  matchesState,
  resolveStateValue,
} from "@zag-js/core"
import { compact, isFunction, isString, runIfFn, toArray, warn } from "@zag-js/utils"
import { bindable } from "./bindable"
import { createRefs } from "./refs"
import { track } from "./track"

export class AlpineMachine<T extends MachineSchema> {
  scope: Scope
  context: BindableContext<T>
  prop: PropFn<T>
  state: Bindable<T["state"]>
  refs: BindableRefs<T>
  computed: ComputedFn<T>

  private event: T["event"] = { type: "" }
  private previousEvent: T["event"] = { type: "" }

  private effects = new Map<string, VoidFunction>()
  private transition: Transition<T> | null = null

  private getEvent = () => ({
    ...this.event,
    current: () => this.event,
    previous: () => this.previousEvent,
  })

  private getState = () => ({
    ...this.state,
    matches: (...values: T["state"][]) =>
      values.some((value) => matchesState(this.state.get() as string, value as string)),
    hasTag: (tag: T["tag"]) => hasTag(this.machine, this.state.get(), tag),
  })

  private debug = (...args: any[]) => {
    if (this.machine.debug) console.log(...args)
  }

  constructor(
    private machine: Machine<T>,
    userPropsRef: { value: Partial<T["props"]> | (() => Partial<T["props"]>) },
  ) {
    // create scope
    const { id, ids, getRootNode } = runIfFn(userPropsRef.value) as any
    this.scope = createScope({ id, ids, getRootNode })

    // create prop
    const prop: PropFn<T> = (key) => {
      const __props = runIfFn(userPropsRef.value)
      const props = machine.props?.({ props: compact(__props), scope: this.scope }) ?? __props
      return props[key]
    }
    this.prop = prop

    // create context
    const context = machine.context?.({
      prop,
      bindable,
      scope: this.scope,
      flush,
      getContext() {
        return ctx
      },
      getComputed() {
        return computed
      },
      getRefs() {
        return refs
      },
      getEvent: this.getEvent.bind(this),
    })

    // context function
    const ctx: BindableContext<T> = {
      get(key) {
        return context?.[key].get() as T["context"][typeof key]
      },
      set(key, value) {
        context?.[key].set(value)
      },
      initial(key) {
        return context?.[key].initial as T["context"][typeof key]
      },
      hash(key) {
        const current = context?.[key].get() as T["context"][typeof key]
        return context?.[key].hash(current) as string
      },
    }
    this.context = ctx

    const computed: ComputedFn<T> = (key) => {
      return machine.computed?.[key]({
        context: ctx,
        event: this.getEvent(),
        prop,
        refs: this.refs,
        scope: this.scope,
        computed,
      }) as T["computed"][typeof key]
    }
    this.computed = computed

    const refs: BindableRefs<T> = createRefs(machine.refs?.({ prop, context: ctx }) ?? {})
    this.refs = refs

    // state
    const state = bindable(() => ({
      defaultValue: resolveStateValue(machine, machine.initialState({ prop })),
      onChange: (nextState, prevState) => {
        const { exiting, entering } = getExitEnterStates(this.machine, prevState, nextState, this.transition?.reenter)

        exiting.forEach((item) => {
          const exitEffects = this.effects.get(item.path)
          exitEffects?.()
          this.effects.delete(item.path)
        })

        exiting.forEach((item) => {
          this.action(item.state?.exit)
        })

        this.action(this.transition?.actions)

        entering.forEach((item) => {
          const cleanup = this.effect(item.state?.effects)
          if (cleanup) this.effects.set(item.path, cleanup)
        })

        if (prevState === INIT_STATE) {
          this.action(machine.entry)
          const cleanup = this.effect(machine.effects)
          if (cleanup) this.effects.set(INIT_STATE, cleanup)
        }

        queueMicrotask(() => {
          entering.forEach((item) => {
            this.action(item.state.entry)
          })
        })
      },
    }))
    this.state = state
  }

  send = (event: T["event"]) => {
    if (this.status !== MachineStatus.Started) return

    if (!event) return

    this.previousEvent = this.event
    this.event = event

    this.debug("send", event)

    let currentState = this.state.get()

    const eventType = event.type
    const { transitions, source } = findTransition(this.machine, currentState, eventType)
    const transition = this.choose(transitions)
    if (!transition) return

    // save current transition
    this.transition = transition
    const target = resolveStateValue(this.machine, transition.target ?? currentState, source)

    this.debug("transition", transition)

    const changed = target !== currentState
    if (changed) {
      // state change is high priority
      this.state.set(target)
    } else if (transition.reenter) {
      // reenter will re-invoke the current state
      this.state.invoke(currentState, currentState)
    } else {
      // call transition actions
      this.action(transition.actions)
    }
  }

  private action = (keys: ActionsOrFn<T> | undefined) => {
    const strs = isFunction(keys) ? keys(this.getParams()) : keys
    if (!strs) return
    const fns = strs.map((s) => {
      const fn = this.machine.implementations?.actions?.[s]
      if (!fn) warn(`[zag-js] No implementation found for action "${JSON.stringify(s)}"`)
      return fn
    })
    for (const fn of fns) {
      fn?.(this.getParams())
    }
  }

  private guard = (str: T["guard"] | GuardFn<T>) => {
    if (isFunction(str)) return str(this.getParams())
    return this.machine.implementations?.guards?.[str](this.getParams())
  }

  private effect = (keys: EffectsOrFn<T> | undefined) => {
    const strs = isFunction(keys) ? keys(this.getParams()) : keys
    if (!strs) return
    const fns = strs.map((s) => {
      const fn = this.machine.implementations?.effects?.[s]
      if (!fn) warn(`[zag-js] No implementation found for effect "${JSON.stringify(s)}"`)
      return fn
    })
    const cleanups: VoidFunction[] = []
    for (const fn of fns) {
      const cleanup = fn?.(this.getParams())
      if (cleanup) cleanups.push(cleanup)
    }
    return () => cleanups.forEach((fn) => fn?.())
  }

  private choose: ChooseFn<T> = (transitions) => {
    return toArray(transitions).find((t) => {
      let result = !t.guard
      if (isString(t.guard)) result = !!this.guard(t.guard)
      else if (isFunction(t.guard)) result = t.guard(this.getParams())
      return result
    })
  }

  init() {
    this.status = MachineStatus.Started
    this.debug("initializing...")
    queueMicrotask(() => {
      this.state.invoke(this.state.initial!, INIT_STATE)
    })
    this.machine.watch?.(this.getParams())
  }

  destroy() {
    // run exit effects
    this.effects.forEach((fn) => fn?.())
    this.effects.clear()
    this.transition = null
    this.action(this.machine.exit)

    this.status = MachineStatus.Stopped
    this.debug("unmounting...")
  }

  private status = MachineStatus.NotStarted

  get service() {
    return {
      state: this.getState(),
      send: this.send,
      context: this.context,
      prop: this.prop,
      scope: this.scope,
      refs: this.refs,
      computed: this.computed,
      event: this.getEvent(),
      getStatus: () => this.status,
    } as Service<T>
  }

  getParams = () =>
    ({
      state: this.getState(),
      context: this.context,
      event: this.getEvent(),
      prop: this.prop,
      send: this.send,
      action: this.action,
      guard: this.guard,
      track,
      refs: this.refs,
      computed: this.computed,
      flush,
      scope: this.scope,
      choose: this.choose,
    }) as Params<T>
}

function flush(fn: VoidFunction) {
  console.log("flush")
  fn()
}
