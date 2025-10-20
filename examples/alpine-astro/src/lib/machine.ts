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
} from "@zag-js/core"
import { createScope, INIT_STATE, MachineStatus } from "@zag-js/core"
import { compact, identity, isFunction, isString, toArray, warn } from "@zag-js/utils"
import { bindable } from "./bindable"
import { createRefs } from "./refs"
import { track } from "./track"

export class AlpineMachine<T extends MachineSchema> implements Service<T> {
  scope: Scope = null as any
  ctx: BindableContext<T>
  prop: PropFn<T>
  private _state: Bindable<T["state"]>
  refs: BindableRefs<T>
  computed: ComputedFn<T>

  private _event: any = { type: "" }
  private previousEvent: any = null

  private effects = new Map<string, VoidFunction>()
  private transition: any = null

  private status = MachineStatus.NotStarted

  private getEvent() {
    return {
      ...this._event,
      current: () => this._event,
      previous: () => this.previousEvent,
    }
  }

  get event(): any {
    return this.getEvent()
  }

  getStatus(): MachineStatus {
    return this.status
  }

  get context(): BindableContext<T> {
    return this.ctx
  }

  get state(): Bindable<T["state"]> & {
    matches: (...values: T["state"][]) => boolean
    hasTag: (tag: T["tag"]) => boolean
  } {
    return this.getState()
  }

  private getState(): Bindable<T["state"]> & {
    matches: (...values: T["state"][]) => boolean
    hasTag: (tag: T["tag"]) => boolean
  } {
    return {
      ...this._state,
      matches: (...values: T["state"][]) => values.includes(this._state.get()),
      hasTag: (tag: T["tag"]) => !!this.machine.states[this._state.get()]?.tags?.includes(tag),
    }
  }

  private debug(...args: any[]) {
    if (this.machine.debug) console.log(...args)
  }

  constructor(
    private machine: Machine<T>,
    userPropsRef: { value: Partial<T["props"]> },
  ) {
    // create scope
    const { id, ids, getRootNode } = userPropsRef.value as any
    this.scope = createScope({ id, ids, getRootNode })

    // create prop
    this.prop = (key) => {
      const props =
        machine.props?.({
          props: compact(userPropsRef.value),
          scope: this.scope,
        }) ?? userPropsRef.value
      return props[key] as T["props"][typeof key]
    }

    // create context
    const _context = machine.context?.({
      prop: this.prop,
      bindable,
      scope: this.scope,
      flush() {},
      getContext: () => this.ctx,
      getComputed: () => this.computed,
      getRefs: () => this.refs,
      getEvent: this.getEvent.bind(this),
    })

    // context function
    this.ctx = {
      get(key) {
        return _context?.[key].get() as T["context"][typeof key]
      },
      set(key, value) {
        _context?.[key].set(value)
      },
      initial(key) {
        return _context?.[key].initial as T["context"][typeof key]
      },
      hash(key) {
        const current = _context?.[key].get() as T["context"][typeof key]
        return _context?.[key].hash(current) as string
      },
    }

    // create computed
    this.computed = (key) =>
      machine.computed?.[key]({
        context: this.ctx,
        event: this.getEvent(),
        prop: this.prop,
        refs: this.refs,
        scope: this.scope,
        computed: this.computed,
      }) ?? ({} as any)

    // create refs
    this.refs = createRefs(machine.refs?.({ prop: this.prop, context: this.ctx }) ?? {})

    // create state
    this._state = bindable(() => ({
      defaultValue: machine.initialState({ prop: this.prop }),
      onChange: (nextState, prevState) => {
        // compute effects: exit -> transition -> enter
        queueMicrotask(() => {
          // exit effects
          if (prevState) {
            const exitEffects = this.effects.get(prevState)
            exitEffects?.()
            this.effects.delete(prevState)
          }

          // exit actions
          if (prevState) {
            this.action(machine.states[prevState]?.exit)
          }

          // transition actions
          this.action(this.transition?.actions)

          // enter effect
          const cleanup = this.effect(machine.states[nextState]?.effects)
          if (cleanup) this.effects.set(nextState as string, cleanup)

          // root entry actions
          if (prevState === INIT_STATE) {
            this.action(machine.entry)
            const cleanup = this.effect(machine.effects)
            if (cleanup) this.effects.set(INIT_STATE, cleanup)
          }

          // enter actions
          this.action(machine.states[nextState]?.entry)
        })
      },
    }))
  }

  send = (event: any) => {
    if (this.status !== MachineStatus.Started) return

    this.previousEvent = this._event
    this._event = event

    this.debug("send", event)

    const currentState = this.state.get()

    const transitions =
      // @ts-ignore transition
      this.machine.states[currentState].on?.[event.type] ??
      // @ts-ignore transition
      this.machine.on?.[event.type]

    const transition = this.choose(transitions)
    if (!transition) return

    // save current transition
    this.transition = transition
    const target = transition.target ?? currentState

    this.debug("transition", transition)

    const changed = target !== currentState
    if (changed) {
      // state change is high priority
      this.state.set(target)
    } else if (transition.reenter && !changed) {
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
      if (!fn) {
        warn(`[zag-js] No implementation found for action "${JSON.stringify(s)}"`)
      }
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
      if (!fn) {
        warn(`[zag-js] No implementation found for effect "${JSON.stringify(s)}"`)
      }
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
    this.state.invoke(this.state.initial, INIT_STATE)
    this.machine.watch?.(this.getParams())
  }

  destroy() {
    this.effects.forEach((fn) => fn?.())
    this.effects.clear()
    this.transition = null
    this.action(this.machine.exit)

    this.status = MachineStatus.Stopped
    this.debug("unmounting...")
  }

  getParams(): Params<T> {
    return {
      state: this.getState(),
      context: this.ctx,
      event: this.getEvent(),
      prop: this.prop,
      send: this.send,
      action: this.action,
      guard: this.guard,
      track,
      refs: this.refs,
      computed: this.computed,
      flush: identity,
      scope: this.scope,
      choose: this.choose,
    }
  }
}
