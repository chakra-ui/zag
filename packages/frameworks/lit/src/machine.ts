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

export class LitMachine<T extends MachineSchema> {
  private readonly scope: Scope
  private readonly ctx: BindableContext<T>
  private readonly prop: PropFn<T>
  private readonly state: Bindable<T["state"]>
  private readonly refs: BindableRefs<T>
  private readonly computed: ComputedFn<T>

  private event: any = { type: "" }
  private previousEvent: any

  private readonly effects = new Map<string, VoidFunction>()
  private transition: any = null

  private cleanups: VoidFunction[] = []
  private readonly subscriptions: Array<(service: Service<T>) => void> = []
  private trackers: { deps: any[]; fn: any }[] = []
  private status = MachineStatus.NotStarted

  private readonly getEvent = () => ({
    ...this.event,
    current: () => this.event,
    previous: () => this.previousEvent,
  })

  private readonly getState = () => ({
    ...this.state,
    matches: (...values: T["state"][]) => values.includes(this.state.get()),
    hasTag: (tag: T["tag"]) => !!this.machine.states[this.state.get() as T["state"]]?.tags?.includes(tag),
  })

  private readonly debug = (...args: any[]) => {
    if (this.machine.debug) console.log(...args)
  }

  constructor(
    private readonly machine: Machine<T>,
    userProps: Partial<T["props"]> | (() => Partial<T["props"]>) = {},
  ) {
    const self = this

    // create scope
    const { id, ids, getRootNode } = runIfFn(userProps) as any
    this.scope = createScope({ id, ids, getRootNode })

    // create prop
    this.prop = (key) => {
      const __props = runIfFn(userProps)
      const props: any = machine.props?.({ props: compact(__props), scope: self.scope }) ?? __props
      return props[key] as any
    }

    // create context
    const context: any = machine.context?.({
      prop: self.prop,
      bindable,
      scope: self.scope,
      flush(fn: VoidFunction) {
        queueMicrotask(fn) // requestUpdate?
      },
      getContext: () => self.ctx as any,
      getComputed: () => self.computed as any,
      getRefs: () => self.refs as any,
      getEvent: self.getEvent,
    })

    // subscribe to context changes
    if (context) {
      Object.values(context).forEach((item: any) => {
        const unsub = subscribe(item.ref, () => this.publish())
        this.cleanups.push(unsub)
      })
    }

    // context function
    this.ctx = {
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

    this.computed = (key) =>
      machine.computed?.[key]({
        context: self.ctx as any,
        event: self.getEvent(),
        prop: self.prop,
        refs: self.refs,
        scope: self.scope,
        computed: self.computed as any,
      }) ?? ({} as any)

    this.refs = createRefs(self.machine.refs?.({ prop: self.prop, context: self.ctx }) ?? {})

    // state
    this.state = bindable(() => ({
      defaultValue: self.machine.initialState({ prop: self.prop }),
      onChange: (nextState, prevState) => {
        // compute effects: exit -> transition -> enter

        // exit effects
        if (prevState) {
          const exitEffects = self.effects.get(prevState)
          exitEffects?.()
          self.effects.delete(prevState)
        }

        // exit actions
        if (prevState) {
          // @ts-ignore
          self.action(self.machine.states[prevState]?.exit)
        }

        // transition actions
        self.action(self.transition?.actions)

        // enter effect
        // @ts-ignore
        const cleanup = self.effect(self.machine.states[nextState]?.effects)
        if (cleanup) self.effects.set(nextState as string, cleanup)

        // root entry actions
        if (prevState === INIT_STATE) {
          self.action(self.machine.entry)
          const cleanup = self.effect(self.machine.effects)
          if (cleanup) self.effects.set(INIT_STATE, cleanup)
        }

        // enter actions
        // @ts-ignore
        self.action(self.machine.states[nextState]?.entry)
      },
    }))

    this.cleanups.push(subscribe(this.state.ref, () => self.publish()))
  }

  private readonly send = (event: any) => {
    queueMicrotask(() => {
      // check status inside microtask to prevent race condition
      if (this.status !== MachineStatus.Started) return

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

  private readonly action = (keys: ActionsOrFn<T> | undefined) => {
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

  private readonly guard = (str: T["guard"] | GuardFn<T>) => {
    if (isFunction(str)) return str(this.getParams())
    return this.machine.implementations?.guards?.[str](this.getParams())
  }

  private readonly effect = (keys: EffectsOrFn<T> | undefined) => {
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

  private readonly choose: ChooseFn<T> = (transitions) => {
    return toArray(transitions).find((t: any) => {
      let result = !t.guard
      if (isString(t.guard)) result = !!this.guard(t.guard)
      else if (isFunction(t.guard)) result = t.guard(this.getParams())
      return result
    })
  }

  start() {
    if (this.status === MachineStatus.Started) return

    this.status = MachineStatus.Started
    this.debug("initializing...")
    this.state.invoke(this.state.initial!, INIT_STATE)
    this.setupTrackers()
  }

  stop() {
    if (this.status === MachineStatus.Stopped) return

    // run exit effects
    this.effects.forEach((fn) => fn?.())
    this.effects.clear()
    this.transition = null
    this.action(this.machine.exit)

    // unsubscribe from all subscriptions
    this.cleanups.forEach((unsub) => unsub())
    this.cleanups = []

    // clear trackers to prevent memory leak
    this.trackers = []

    // Should we clear this.subscriptions too?

    this.status = MachineStatus.Stopped
    this.debug("unmounting...")
  }

  readonly subscribe = (fn: (service: Service<T>) => void) => {
    this.subscriptions.push(fn)
    // return unsubscribe function
    return () => {
      const index = this.subscriptions.indexOf(fn)
      if (index > -1) {
        this.subscriptions.splice(index, 1)
      }
    }
  }

  get started() {
    return this.status === MachineStatus.Started
  }

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

  private readonly publish = () => {
    this.callTrackers()
    this.subscriptions.forEach((fn) => fn(this.service))
  }

  private readonly setupTrackers = () => {
    this.machine.watch?.(this.getParams())
  }

  private readonly callTrackers = () => {
    this.trackers.forEach(({ deps, fn }) => {
      const next = deps.map((dep) => dep())
      if (!isEqual(fn.prev, next)) {
        fn()
        fn.prev = next
      }
    })
  }

  private readonly getParams = (): Params<T> => ({
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
    flush: identity, // requestUpdate?
    scope: this.scope,
    choose: this.choose,
  })
}
