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
  createReplaceTracker,
  createScope,
  findTransition,
  getExitEnterStates,
  hasTag,
  INIT_STATE,
  MachineStatus,
  matchesState,
  resolveStateValue,
} from "@zag-js/core"
import { compact, ensure, identity, isEqual, isFunction, isString, runIfFn, toArray, warn } from "@zag-js/utils"
import { createBindable } from "./bindable"
import { createRefs } from "./refs"
import { mergeMachineProps } from "./merge-machine-props"

const defer = (fn: VoidFunction) => queueMicrotask(fn)

// Internals live in closures rather than on the class, so a minifier can shorten their names
export class VanillaMachine<T extends MachineSchema> {
  declare scope: Scope
  declare context: BindableContext<T>
  declare prop: PropFn<T>
  declare state: Bindable<T["state"]>
  declare refs: BindableRefs<T>
  declare computed: ComputedFn<T>

  declare send: (event: T["event"]) => void
  declare subscribe: (fn: (service: Service<T>) => void) => () => void
  declare getParams: () => Params<T>

  // Lifecycle stays on the prototype, so subclasses can override it and call `super`
  declare private lifecycle: {
    start: () => void
    stop: () => void
    updateProps: (newProps: InputProps<T> | (() => InputProps<T>)) => void
  }

  start() {
    this.lifecycle.start()
  }

  stop() {
    this.lifecycle.stop()
  }

  updateProps(newProps: InputProps<T> | (() => InputProps<T>)) {
    this.lifecycle.updateProps(newProps)
  }

  declare readonly service: Service<T>

  constructor(machine: Machine<T>, userProps: InputProps<T> | (() => InputProps<T>) = {} as InputProps<T>) {
    let status = MachineStatus.NotStarted
    let event = { type: "" } as T["event"]
    let previousEvent = event
    let transition: Transition<T> | null = null
    let scheduled = false
    let effectId = 0

    const effects = new Map<number, EffectRecord>()
    const trackers: { deps: any[]; fn: any }[] = []
    let subscriptions: Array<(service: Service<T>) => void> = []
    const replaceTracker = createReplaceTracker()

    let baseProps: InputProps<T> | undefined
    const propSources: Array<InputProps<T> | (() => InputProps<T>)> = []
    if (isFunction(userProps)) propSources.push(userProps)
    else baseProps = userProps

    const debug = (...args: any[]) => {
      if (machine.debug) console.log(...args)
    }

    const getUserProps = (): InputProps<T> => {
      let props = baseProps
      for (const source of propSources) {
        const next = runIfFn(source) as InputProps<T>
        props = props ? (mergeMachineProps(props as any, next as any) as InputProps<T>) : next
      }
      return props!
    }

    const getEvent = () => ({
      ...event,
      current: () => event,
      previous: () => previousEvent,
    })

    const getState = () => ({
      ...state,
      matches: (...values: T["state"][]) =>
        values.some((value) => matchesState(state.get() as string, value as string)),
      hasTag: (tag: T["tag"]) => hasTag(machine, state.get(), tag),
    })

    // Every value change in a tick ends in one publish
    const schedule = () => {
      if (scheduled) return
      scheduled = true
      defer(() => {
        scheduled = false
        if (status !== MachineStatus.Stopped) publish()
      })
    }

    const bindable = createBindable(schedule)

    const { id, ids, getRootNode } = runIfFn(userProps) as any
    const scope = createScope({ id, ids, getRootNode })

    const prop: PropFn<T> = (key) => {
      const props = getUserProps()
      const resolved: any = machine.props?.({ props: compact(props as any), scope }) ?? props
      return resolved[key] as any
    }

    const context: any = machine.context?.({
      prop,
      bindable,
      scope,
      flush(fn: VoidFunction) {
        defer(fn)
      },
      getContext: () => ctx as any,
      getComputed: () => computed as any,
      getRefs: () => refs as any,
      getEvent,
    })

    const ctx: BindableContext<T> = {
      get: (key) => context?.[key].get(),
      set: (key, value) => context?.[key].set(value),
      initial: (key) => context?.[key].initial,
      hash: (key) => context?.[key].hash(context?.[key].get()),
    }

    const computed: ComputedFn<T> = (key) => {
      ensure(machine.computed, () =>
        process.env.NODE_ENV !== "production" ? "[zag-js] No computed object found on machine" : "",
      )
      return machine.computed[key]({
        context: ctx as any,
        event: getEvent(),
        prop,
        refs,
        scope,
        computed: computed as any,
      })
    }

    const refs: BindableRefs<T> = createRefs(machine.refs?.({ prop, context: ctx }) ?? {})

    const getImpl = (kind: "actions" | "guards" | "effects", name: any) => {
      const fn = (machine.implementations as any)?.[kind]?.[name]
      if (process.env.NODE_ENV !== "production" && !fn)
        warn(`[zag-js] No implementation found for ${kind.slice(0, -1)} "${JSON.stringify(name)}"`)
      return fn
    }

    const action = (keys: ActionsOrFn<T> | undefined) => {
      const names = isFunction(keys) ? keys(getParams()) : keys
      if (!names) return
      const fns = names.map((name) => getImpl("actions", name))
      for (const fn of fns) fn?.(getParams())
    }

    const guard = (str: T["guard"] | GuardFn<T>) => {
      if (isFunction(str)) return str(getParams())
      return getImpl("guards", str)?.(getParams())
    }

    const choose: ChooseFn<T> = (transitions) =>
      toArray(transitions).find((t: any) => {
        if (isString(t.guard)) return !!guard(t.guard)
        if (isFunction(t.guard)) return t.guard(getParams())
        return !t.guard
      })

    const startEffects = (path: string, keys: EffectsOrFn<T> | undefined) => {
      const names = isFunction(keys) ? keys(getParams()) : keys
      if (!names) return

      for (const name of names) {
        const fn = getImpl("effects", name)
        if (!fn) continue

        const result = fn({ ...getParams(), watchEffect } as EffectParams<T>)

        // one record per invocation, so a re-entered path keeps every setup's own cleanup
        const record: EffectRecord = { id: ++effectId, path, cleanup: undefined }

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

        effects.set(record.id, record)
      }
    }

    const stopEffects = (path: string) => {
      for (const [id, record] of effects) {
        if (record.path !== path) continue
        record.cleanup?.("exit")
        effects.delete(id)
      }
    }

    const reconcileEffects = () => {
      for (const record of effects.values()) {
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

    const callTrackers = () => {
      for (const { deps, fn } of trackers) {
        const next = deps.map((dep) => dep())
        if (!isEqual(fn.prev, next)) {
          fn()
          fn.prev = next
        }
      }
    }

    const publish = () => {
      callTrackers()
      reconcileEffects()
      for (const fn of subscriptions) fn(this.service)
    }

    const send = (nextEvent: T["event"]) => {
      if (status !== MachineStatus.Started) return

      const key = nextEvent?.replaces
      const token = key ? replaceTracker.claim(key) : undefined

      defer(() => {
        if (!nextEvent) return
        if (key && token && replaceTracker.isReplaced(key, token)) return

        previousEvent = event
        event = nextEvent

        if (process.env.NODE_ENV !== "production") debug("send", nextEvent)

        const currentState = state.get()
        const { transitions, source } = findTransition(machine, currentState, nextEvent.type as string)
        const next = choose(transitions)
        if (!next) return

        transition = next
        const target = resolveStateValue(machine, next.target ?? currentState, source)

        if (process.env.NODE_ENV !== "production") debug("transition", next)

        if (target !== currentState) {
          // state change is high priority
          state.set(target)
        } else if (next.reenter) {
          // reenter will re-invoke the current state
          state.invoke(currentState, currentState)
        } else {
          action(next.actions)
        }
      })
    }

    const getParams = (): Params<T> =>
      ({
        state: getState(),
        context: ctx,
        event: getEvent(),
        prop,
        send,
        action,
        guard,
        track: (deps: any[], fn: any) => {
          fn.prev = deps.map((dep) => dep())
          trackers.push({ deps, fn })
        },
        refs,
        computed,
        flush: identity,
        scope,
        choose,
      }) as Params<T>

    const state = bindable(() => ({
      defaultValue: resolveStateValue(machine, machine.initialState({ prop })),
      onChange: (nextState, prevState) => {
        const { exiting, entering } = getExitEnterStates(machine, prevState, nextState, transition?.reenter)

        exiting.forEach((item) => stopEffects(item.path))
        exiting.forEach((item) => action(item.state?.exit))

        action(transition?.actions)

        entering.forEach((item) => startEffects(item.path, item.state?.effects))

        if (prevState === INIT_STATE) {
          action(machine.entry)
          startEffects(INIT_STATE, machine.effects)
        }

        entering.forEach((item) => action(item.state?.entry))
      },
    }))

    this.scope = scope
    this.prop = prop
    this.context = ctx
    this.computed = computed
    this.refs = refs
    this.state = state
    this.send = send
    this.getParams = getParams

    const start = () => {
      status = MachineStatus.Started
      if (process.env.NODE_ENV !== "production") debug("initializing...")
      state.invoke(state.initial!, INIT_STATE)
      machine.watch?.(getParams())
    }

    const stop = () => {
      effects.forEach((record) => record.cleanup?.("exit"))
      effects.clear()
      transition = null
      action(machine.exit)
      subscriptions = []
      status = MachineStatus.Stopped
      if (process.env.NODE_ENV !== "production") debug("unmounting...")
    }

    this.subscribe = (fn) => {
      subscriptions.push(fn)
      return () => {
        const index = subscriptions.indexOf(fn)
        if (index > -1) subscriptions.splice(index, 1)
      }
    }

    const updateProps = (newProps: InputProps<T> | (() => InputProps<T>)) => {
      if (isFunction(newProps)) {
        propSources.push(newProps)
      } else if (propSources.length === 0) {
        baseProps = mergeMachineProps(baseProps as any, newProps as any) as InputProps<T>
      } else {
        const lastIndex = propSources.length - 1
        const previous = propSources[lastIndex]
        if (isFunction(previous)) {
          const patch = mergeMachineProps({} as any, newProps as any) as InputProps<T>
          if (patch && Object.keys(patch).length > 0) propSources.push(patch)
        } else {
          propSources[lastIndex] = mergeMachineProps(previous as any, newProps as any) as InputProps<T>
        }
      }
      publish()
    }

    this.lifecycle = { start, stop, updateProps }

    Object.defineProperty(this, "service", {
      get: (): Service<T> =>
        ({
          state: getState(),
          send,
          context: ctx,
          prop,
          scope,
          refs,
          computed,
          event: getEvent(),
          getStatus: () => status,
        }) as Service<T>,
    })
  }
}
