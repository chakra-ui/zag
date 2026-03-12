import type {
  ActionsOrFn,
  Bindable,
  BindableContext,
  BindableRefs,
  ChooseFn,
  ComputedFn,
  Effect,
  EffectDeps,
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
import { subscribe } from "@zag-js/store"
import { compact, identity, isEqual, isFunction, isString, runIfFn, toArray, warn } from "@zag-js/utils"
import { bindable } from "./bindable"
import { createRefs } from "./refs"
import { mergeMachineProps } from "./merge-machine-props"

type EffectConfig<T extends MachineSchema> = Effect<T> extends infer U ? (U extends string ? { key: U } : U) : never

type TrackedEffect = {
  deps?: () => any[]
  values?: any[]
  cleanup?: VoidFunction
  run: () => void | VoidFunction
}

export class VanillaMachine<T extends MachineSchema> {
  scope: Scope
  context: BindableContext<T>
  prop: PropFn<T>
  state: Bindable<T["state"]>
  refs: BindableRefs<T>
  computed: ComputedFn<T>

  private event: T["event"] = { type: "" } as T["event"]
  private previousEvent: T["event"] = { type: "" } as T["event"]

  private effects = new Map<string, VoidFunction>()
  private effectTrackers = new Map<string, TrackedEffect[]>()
  private transition: Transition<T> | null = null

  private cleanups: VoidFunction[] = []
  private subscriptions: Array<(service: Service<T>) => void> = []

  private userPropsRef: { current: Partial<T["props"]> | (() => Partial<T["props"]>) }

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
    userProps: Partial<T["props"]> | (() => Partial<T["props"]>) = {},
  ) {
    this.userPropsRef = { current: userProps }

    // create scope
    const { id, ids, getRootNode } = runIfFn(userProps) as any
    this.scope = createScope({ id, ids, getRootNode })

    // create prop
    const prop: PropFn<T> = (key) => {
      const __props = runIfFn(this.userPropsRef.current)
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
    this.context = ctx

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
          const cleanup = this.effect(item.state?.effects, item.path)
          if (cleanup) this.effects.set(item.path, cleanup)
        })

        if (prevState === INIT_STATE) {
          this.action(machine.entry)
          const cleanup = this.effect(machine.effects, INIT_STATE)
          if (cleanup) this.effects.set(INIT_STATE, cleanup)
        }

        entering.forEach((item) => {
          this.action(item.state?.entry)
        })
      },
    }))
    this.state = state
    this.cleanups.push(subscribe(this.state.ref, () => this.notify()))
  }

  updateProps(newProps: Partial<T["props"]> | (() => Partial<T["props"]>)) {
    const prevSource = this.userPropsRef.current

    this.userPropsRef.current = () => {
      const prev = runIfFn(prevSource)
      const next = runIfFn(newProps)
      return mergeMachineProps(prev, next)
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
    return this.machine.implementations?.guards?.[str](this.getParams())
  }

  private normalizeEffects = (keys: EffectsOrFn<T> | undefined) => {
    const items = isFunction(keys) ? keys(this.getParams()) : keys
    if (!items) return
    return items.map((item) => {
      if (isString(item)) return { key: item } as EffectConfig<T>
      return item as EffectConfig<T>
    })
  }

  private resolveEffectDeps = (deps: EffectDeps<T> | undefined) => {
    if (!deps) return
    const getList = () => (isFunction(deps) ? deps(this.getParams()) : deps) ?? []
    return () => {
      const list = getList()
      return list.map((value) => {
        if (isFunction(value)) return (value as any)(this.getParams())
        return value
      })
    }
  }

  private effect = (keys: EffectsOrFn<T> | undefined, path?: string) => {
    const items = this.normalizeEffects(keys)
    if (!items) return

    const tracked: TrackedEffect[] = []
    const cleanups: VoidFunction[] = []

    for (const item of items) {
      const fn = this.machine.implementations?.effects?.[item.key]
      if (!fn) {
        warn(`[zag-js] No implementation found for effect "${JSON.stringify(item.key)}"`)
        continue
      }

      const deps = this.resolveEffectDeps(item.deps)
      const run = () => fn?.(this.getParams())

      if (deps) {
        const values = deps()
        const cleanup = run()
        tracked.push({
          deps,
          values,
          cleanup: cleanup ?? undefined,
          run,
        })
      } else {
        const cleanup = run()
        if (cleanup) cleanups.push(cleanup)
      }
    }

    if (tracked.length && path) {
      this.effectTrackers.set(path, tracked)
    }

    if (!tracked.length && !cleanups.length && !path) return

    return () => {
      tracked.forEach((record) => record.cleanup?.())
      cleanups.forEach((fn) => fn?.())
      if (path) this.effectTrackers.delete(path)
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
    this.effects.forEach((fn) => fn?.())
    this.effects.clear()
    this.effectTrackers.clear()
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
    this.effectTrackers.forEach((records) => {
      records.forEach((record) => {
        if (!record.deps) return
        const next = record.deps()
        // isEqual performs a deep comparison to avoid rerunning effects for unchanged dependency snapshots
        if (!isEqual(record.values ?? [], next)) {
          record.cleanup?.()
          record.cleanup = record.run() ?? undefined
          record.values = next
        }
      })
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
