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
import { subscribe } from "@zag-js/store"
import { compact, identity, isEqual, isFunction, isString, runIfFn, toArray, warn } from "@zag-js/utils"
import { bindable } from "./bindable"
import { createRefs } from "./refs"

export class VanillaMachine<T extends MachineSchema> {
  scope: Scope
  ctx: BindableContext<T>
  prop: PropFn<T>
  state: Bindable<T["state"]>
  refs: BindableRefs<T>
  computed: ComputedFn<T>

  private event: any = { type: "" }
  private previousEvent: any

  private effects = new Map<string, VoidFunction>()
  private transition: any = null

  private cleanups: VoidFunction[] = []
  private subscriptions: Array<(service: Service<T>) => void> = []

  private getEvent = () => ({
    ...this.event,
    current: () => this.event,
    previous: () => this.previousEvent,
  })

  private getState = () => ({
    ...this.state,
    matches: (...values: T["state"][]) => values.includes(this.state.get()),
    hasTag: (tag: T["tag"]) => !!this.machine.states[this.state.get() as T["state"]]?.tags?.includes(tag),
  })

  debug = (...args: any[]) => {
    if (this.machine.debug) console.log(...args)
  }

  notify = () => {
    this.publish()
  }

  constructor(
    private machine: Machine<T>,
    userProps: Partial<T["props"]> | (() => Partial<T["props"]>) = {},
  ) {
    // create scope
    const { id, ids, getRootNode } = runIfFn(userProps) as any
    this.scope = createScope({ id, ids, getRootNode })

    // create prop
    const prop: PropFn<T> = (key) => {
      const __props = runIfFn(userProps)
      const props: any = machine.props?.({ props: compact(__props), scope: this.scope }) ?? __props
      return props[key] as any
    }
    this.prop = prop

    // create context
    const context: any = machine.context?.({
      prop,
      bindable,
      scope: this.scope,
      flush(fn: VoidFunction) {
        queueMicrotask(fn)
      },
      getContext() {
        return ctx as any
      },
      getComputed() {
        return computed as any
      },
      getRefs() {
        return refs as any
      },
      getEvent: this.getEvent.bind(this),
    })

    // subscribe to context changes
    if (context) {
      Object.values(context).forEach((item: any) => {
        const unsub = subscribe(item.ref, () => this.notify())
        this.cleanups.push(unsub)
      })
    }

    // context function
    const ctx: BindableContext<T> = {
      get(key) {
        return context?.[key].get()
      },
      set(key, value) {
        context?.[key].set(value)
      },
      initial(key) {
        return context?.[key].initial
      },
      hash(key) {
        const current = context?.[key].get()
        return context?.[key].hash(current)
      },
    }
    this.ctx = ctx

    const computed: ComputedFn<T> = (key) => {
      return (
        machine.computed?.[key]({
          context: ctx as any,
          event: this.getEvent(),
          prop,
          refs: this.refs,
          scope: this.scope,
          computed: computed as any,
        }) ?? ({} as any)
      )
    }
    this.computed = computed

    const refs: BindableRefs<T> = createRefs(machine.refs?.({ prop, context: ctx }) ?? {})
    this.refs = refs

    // state
    const state = bindable(() => ({
      defaultValue: machine.initialState({ prop }),
      onChange: (nextState, prevState) => {
        // compute effects: exit -> transition -> enter

        // exit effects
        if (prevState) {
          const exitEffects = this.effects.get(prevState)
          exitEffects?.()
          this.effects.delete(prevState)
        }

        // exit actions
        if (prevState) {
          // @ts-ignore
          this.action(machine.states[prevState]?.exit)
        }

        // transition actions
        this.action(this.transition?.actions)

        // enter effect
        // @ts-ignore
        const cleanup = this.effect(machine.states[nextState]?.effects)
        if (cleanup) this.effects.set(nextState as string, cleanup)

        // root entry actions
        if (prevState === INIT_STATE) {
          this.action(machine.entry)
          const cleanup = this.effect(machine.effects)
          if (cleanup) this.effects.set(INIT_STATE, cleanup)
        }

        // enter actions
        // @ts-ignore
        this.action(machine.states[nextState]?.entry)
      },
    }))
    this.state = state
    this.cleanups.push(subscribe(this.state.ref, () => this.notify()))
  }

  send = (event: any) => {
    if (this.status !== MachineStatus.Started) return

    queueMicrotask(() => {
      this.previousEvent = this.event
      this.event = event

      this.debug("send", event)

      let currentState = this.state.get()

      const transitions =
        // @ts-ignore
        this.machine.states[currentState].on?.[event.type] ??
        // @ts-ignore
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
      } else {
        // call transition actions
        this.action(transition.actions)
      }
    })
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
    return toArray(transitions).find((t: any) => {
      let result = !t.guard
      if (isString(t.guard)) result = !!this.guard(t.guard)
      else if (isFunction(t.guard)) result = t.guard(this.getParams())
      return result
    })
  }

  start() {
    this.status = MachineStatus.Started
    this.debug("initializing...")
    this.state.invoke(this.state.initial!, INIT_STATE)
    this.setupTrackers()
  }

  stop() {
    // run exit effects
    this.effects.forEach((fn) => fn?.())
    this.effects.clear()
    this.transition = null
    this.action(this.machine.exit)

    // unsubscribe from all subscriptions
    this.cleanups.forEach((unsub) => unsub())
    this.cleanups = []

    this.status = MachineStatus.Stopped
    this.debug("unmounting...")
  }

  subscribe = (fn: (service: Service<T>) => void) => {
    this.subscriptions.push(fn)
  }

  private status = MachineStatus.NotStarted

  get service(): Service<T> {
    return {
      state: this.getState(),
      send: this.send,
      context: this.ctx,
      prop: this.prop,
      scope: this.scope,
      refs: this.refs,
      computed: this.computed,
      event: this.getEvent(),
      getStatus: () => this.status,
    }
  }

  private publish = () => {
    this.callTrackers()
    this.subscriptions.forEach((fn) => fn(this.service))
  }

  private trackers: { deps: any[]; fn: any }[] = []

  private setupTrackers = () => {
    this.machine.watch?.(this.getParams())
  }

  private callTrackers = () => {
    this.trackers.forEach(({ deps, fn }) => {
      const next = deps.map((dep) => dep())
      if (!isEqual(fn.prev, next)) {
        fn()
        fn.prev = next
      }
    })
  }

  getParams = (): Params<T> => ({
    state: this.getState(),
    context: this.ctx,
    event: this.getEvent(),
    prop: this.prop,
    send: this.send,
    action: this.action,
    guard: this.guard,
    track: (deps: any[], fn: any) => {
      fn.prev = deps.map((dep) => dep())
      this.trackers.push({ deps, fn })
    },
    refs: this.refs,
    computed: this.computed,
    flush: identity,
    scope: this.scope,
    choose: this.choose,
  })
}
