import type {
  ActionsOrFn,
  Bindable,
  BindableContext,
  BindableRefs,
  ChooseFn,
  ComputedFn,
  EffectParams,
  EffectRecord,
  EffectsOrFn,
  GuardFn,
  Machine,
  MachineSchema,
  Params,
  PropFn,
  InputProps,
  Scope,
  Service,
  Transition,
} from "@zag-js/core"
import {
  isWatchEffect,
  watchEffect,
  createScope,
  findTransition,
  getExitEnterStates,
  hasTag,
  INIT_STATE,
  MachineStatus,
  matchesState,
  resolveStateValue,
} from "@zag-js/core"
import { subscribe } from "@zag-js/store"
import { compact, ensure, identity, isEqual, isFunction, isString, runIfFn, toArray, warn } from "@zag-js/utils"
import { bindable } from "./bindable"
import { createRefs } from "./refs"
import { mergeMachineProps } from "./merge-machine-props"

export class VanillaMachine<T extends MachineSchema> {
  scope: Scope
  context: BindableContext<T>
  prop: PropFn<T>
  state: Bindable<T["state"]>
  refs: BindableRefs<T>
  computed: ComputedFn<T>

  private event: T["event"] = { type: "" } as T["event"]
  private previousEvent: T["event"] = { type: "" } as T["event"]

  private effects = new Map<number, EffectRecord>()
  private effectId = 0
  private transition: Transition<T> | null = null

  private cleanups: VoidFunction[] = []
  private subscriptions: Array<(service: Service<T>) => void> = []

  private userPropsRef: { current: InputProps<T> | (() => InputProps<T>) }

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

  private notify = () => {
    this.publish()
  }

  constructor(
    private machine: Machine<T>,
    userProps: InputProps<T> | (() => InputProps<T>) = {} as InputProps<T>,
  ) {
    this.userPropsRef = { current: userProps }

    // create scope
    const { id, ids, getRootNode } = runIfFn(userProps) as any
    this.scope = createScope({ id, ids, getRootNode })

    // create prop
    const prop: PropFn<T> = (key) => {
      const __props = runIfFn(this.userPropsRef.current)
      const props: any = machine.props?.({ props: compact(__props as any), scope: this.scope }) ?? __props
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
    this.context = ctx

    const computed: ComputedFn<T> = (key) => {
      ensure(machine.computed, () => `[zag-js] No computed object found on machine`)
      return machine.computed[key]({
        context: ctx as any,
        event: this.getEvent(),
        prop,
        refs: this.refs,
        scope: this.scope,
        computed: computed as any,
      })
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
          this.stopEffects(item.path)
        })

        exiting.forEach((item) => {
          this.action(item.state?.exit)
        })

        this.action(this.transition?.actions)

        entering.forEach((item) => {
          this.startEffects(item.path, item.state?.effects)
        })

        if (prevState === INIT_STATE) {
          this.action(machine.entry)
          this.startEffects(INIT_STATE, machine.effects)
        }

        entering.forEach((item) => {
          this.action(item.state?.entry)
        })
      },
    }))
    this.state = state
    this.cleanups.push(subscribe(this.state.ref, () => this.notify()))
  }

  updateProps(newProps: InputProps<T> | (() => InputProps<T>)) {
    const prevSource = this.userPropsRef.current

    this.userPropsRef.current = () => {
      const prev = runIfFn(prevSource)
      const next = runIfFn(newProps)
      return mergeMachineProps(prev as any, next as any) as InputProps<T>
    }

    this.notify()
  }

  send = (event: T["event"]) => {
    if (this.status !== MachineStatus.Started) return

    queueMicrotask(() => {
      if (!event) return

      this.previousEvent = this.event
      this.event = event

      this.debug("send", event)

      let currentState = this.state.get()

      const eventType = event.type as string
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
    const fn = this.machine.implementations?.guards?.[str]
    if (!fn) warn(`[zag-js] No implementation found for guard "${JSON.stringify(str)}"`)
    return fn?.(this.getParams())
  }

  private startEffects = (path: string, keys: EffectsOrFn<T> | undefined) => {
    const strs = isFunction(keys) ? keys(this.getParams()) : keys
    if (!strs) return

    for (const name of strs) {
      const fn = this.machine.implementations?.effects?.[name]
      if (!fn) {
        warn(`[zag-js] No implementation found for effect "${JSON.stringify(name)}"`)
        continue
      }

      const result = fn({ ...this.getParams(), watchEffect } as EffectParams<T>)

      // one record per invocation, so a re-entered path keeps every setup's own cleanup
      const id = ++this.effectId
      const record: EffectRecord = { id, path, cleanup: undefined }

      if (isWatchEffect(result)) {
        record.deps = result.deps
        record.setup = result.setup
        const cleanup = result.setup()
        record.cleanup = isFunction(cleanup) ? cleanup : undefined
        // snapshot after setup, so a dep that setup itself touches cannot loop
        record.values = result.deps.map((d) => d())
      } else if (isFunction(result)) {
        record.cleanup = result
      }

      this.effects.set(id, record)
    }
  }

  private stopEffects = (path: string) => {
    for (const [id, record] of this.effects) {
      if (record.path !== path) continue
      record.cleanup?.("exit")
      this.effects.delete(id)
    }
  }

  private reconcileEffects = () => {
    for (const record of this.effects.values()) {
      const deps = record.deps
      if (!deps) continue
      const next = deps.map((d) => d())
      if (!next.some((value, index) => !isEqual(record.values![index], value))) continue
      record.values = next
      record.cleanup?.("restart")
      const cleanup = record.setup!()
      record.cleanup = isFunction(cleanup) ? cleanup : undefined
    }
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
    this.effects.forEach((record) => record.cleanup?.("exit"))
    this.effects.clear()
    this.transition = null
    this.action(this.machine.exit)

    // unsubscribe from all subscriptions
    this.cleanups.forEach((unsub) => unsub())
    this.cleanups = []
    this.subscriptions = []

    this.status = MachineStatus.Stopped
    this.debug("unmounting...")
  }

  subscribe = (fn: (service: Service<T>) => void) => {
    this.subscriptions.push(fn)
    return () => {
      const index = this.subscriptions.indexOf(fn)
      if (index > -1) this.subscriptions.splice(index, 1)
    }
  }

  private status = MachineStatus.NotStarted

  get service(): Service<T> {
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

  private publish = () => {
    this.callTrackers()
    this.reconcileEffects()
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

  getParams = (): Params<T> =>
    ({
      state: this.getState(),
      context: this.context,
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
    }) as Params<T>
}
