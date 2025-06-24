type Dict = Record<string, any>

interface ComputedParams<T extends Dict> {
  context: BindableContext<T>
  event: EventType<T["event"]>
  prop: PropFn<T>
  refs: BindableRefs<T>
  scope: Scope
  computed: ComputedFn<T>
}

interface ContextParams<T extends Dict> {
  prop: PropFn<T>
  bindable: BindableFn
  scope: Scope
  getContext: () => BindableContext<T>
  getComputed: () => ComputedFn<T>
  getRefs: () => BindableRefs<T>
  flush: (fn: VoidFunction) => void
}

export interface PropFn<T extends Dict> {
  <K extends keyof T["props"]>(key: K): T["props"][K]
}

export interface ComputedFn<T extends Dict> {
  <K extends keyof T["computed"]>(key: K): T["computed"][K]
}

type AnyFunction = () => string | number | boolean | null | undefined
type TrackFn = (deps: AnyFunction[], fn: VoidFunction) => void

export interface BindableParams<T> {
  defaultValue?: T | undefined
  value?: T | undefined
  hash?: ((a: T) => string) | undefined
  isEqual?: ((a: T, b: T | undefined) => boolean) | undefined
  onChange?: ((value: T, prev: T | undefined) => void) | undefined
  debug?: string | undefined
  sync?: boolean | undefined
}

export type ValueOrFn<T> = T | ((prev: T) => T)

export interface Bindable<T> {
  initial: T | undefined
  ref: any
  get: () => T
  set(value: ValueOrFn<T>): void
  invoke(nextValue: T, prevValue: T): void
  hash(value: T): string
}

export interface BindableRefs<T extends Dict> {
  set<K extends keyof T["refs"]>(key: K, value: T["refs"][K]): void
  get<K extends keyof T["refs"]>(key: K): T["refs"][K]
}

export interface BindableContext<T extends Dict> {
  set<K extends keyof T["context"]>(key: K, value: ValueOrFn<T["context"][K]>): void
  get<K extends keyof T["context"]>(key: K): T["context"][K]
  initial<K extends keyof T["context"]>(key: K): T["context"][K]
  hash<K extends keyof T["context"]>(key: K): string
}

interface BindableRef<T> {
  get: () => T
  set: (next: T) => void
}

export interface BindableFn {
  <K>(params: () => BindableParams<K>): Bindable<K>
  cleanup: (fn: VoidFunction) => void
  ref: <T>(defaultValue: T) => BindableRef<T>
}

export interface Scope {
  id?: string | undefined
  ids?: Record<string, any> | undefined
  getRootNode: () => ShadowRoot | Document | Node
  getById: <T extends Element = HTMLElement>(id: string) => T | null
  getActiveElement: () => HTMLElement | null
  isActiveElement: (elem: HTMLElement | null) => boolean
  getDoc: () => typeof document
  getWin: () => typeof window
}

type EventType<T = any> = T & {
  previousEvent?: (T & { [key: string]: any }) | undefined
  src?: string | undefined
  [key: string]: any
}

export type EventObject = EventType<{ type: string }>

export interface Params<T extends Dict> {
  prop: PropFn<T>
  action: (action: T["action"][]) => void
  context: BindableContext<T>
  refs: BindableRefs<T>
  track: TrackFn
  flush: (fn: VoidFunction) => void
  event: EventType<T["event"]> & {
    current: () => EventType<T["event"]>
    previous: () => EventType<T["event"]>
  }
  send: (event: EventType<T["event"]>) => void
  computed: ComputedFn<T>
  scope: Scope
  state: Bindable<T["state"]> & {
    matches: (...values: T["state"][]) => boolean
    hasTag: (tag: T["tag"]) => boolean
  }
  choose: ChooseFn<T>
  guard: (key: T["guard"] | GuardFn<T>) => boolean | undefined
}

export type GuardFn<T extends Dict> = (params: Params<T>) => boolean

export interface Transition<T extends Dict> {
  target?: T["state"] | undefined
  actions?: T["action"][] | undefined
  guard?: T["guard"] | GuardFn<T> | undefined
  reenter?: boolean | undefined
}

type MaybeArray<T> = T | T[]

export type ChooseFn<T extends Dict> = (
  transitions: MaybeArray<Omit<Transition<T>, "target">>,
) => Transition<T> | undefined

interface PropsParams<T extends Dict> {
  props: Partial<T["props"]>
  scope: Scope
}

interface RefsParams<T extends Dict> {
  prop: PropFn<T>
  context: BindableContext<T>
}

export type ActionsOrFn<T extends Dict> = T["action"][] | ((params: Params<T>) => T["action"][] | undefined)

export type EffectsOrFn<T extends Dict> = T["effect"][] | ((params: Params<T>) => T["effect"][] | undefined)

export interface Machine<T extends Dict> {
  debug?: boolean | undefined
  props?: ((params: PropsParams<T>) => T["props"]) | undefined
  context?:
    | ((params: ContextParams<T>) => {
        [K in keyof T["context"]]: Bindable<T["context"][K]>
      })
    | undefined
  computed?:
    | {
        [K in keyof T["computed"]]: (params: ComputedParams<T>) => T["computed"][K]
      }
    | undefined
  initialState: (params: { prop: PropFn<T> }) => T["state"]
  entry?: ActionsOrFn<T> | undefined
  exit?: ActionsOrFn<T> | undefined
  effects?: EffectsOrFn<T> | undefined
  refs?: ((params: RefsParams<T>) => T["refs"]) | undefined
  watch?: ((params: Params<T>) => void) | undefined
  on?:
    | {
        [E in T["event"]["type"]]?: Transition<T> | Array<Transition<T>>
      }
    | undefined
  states: {
    [K in T["state"]]: {
      tags?: T["tag"][] | undefined
      entry?: ActionsOrFn<T> | undefined
      exit?: ActionsOrFn<T> | undefined
      effects?: EffectsOrFn<T> | undefined
      on?:
        | {
            [E in T["event"]["type"]]?: Transition<T> | Array<Transition<T>>
          }
        | undefined
    }
  }
  implementations?:
    | {
        guards?:
          | {
              [K in T["guard"]]: (params: Params<T>) => boolean
            }
          | undefined
        actions?:
          | {
              [K in T["action"]]: (params: Params<T>) => void
            }
          | undefined
        effects?:
          | {
              [K in T["effect"]]: (params: Params<T>) => void | VoidFunction
            }
          | undefined
      }
    | undefined
}

interface MachineBaseProps {
  id?: string | undefined
  ids?: Record<string, any> | undefined
  getRootNode?: (() => ShadowRoot | Document | Node) | undefined
  [key: string]: any
}

export interface MachineSchema {
  props?: MachineBaseProps | undefined
  context?: Record<string, any> | undefined
  refs?: Record<string, any> | undefined
  computed?: Record<string, any> | undefined
  state?: string | undefined
  tag?: string | undefined
  guard?: string | undefined
  action?: string | undefined
  effect?: string | undefined
  event?: ({ type: string } & Dict) | undefined
}

type State<T extends MachineSchema> = Bindable<T["state"]> & {
  hasTag: (tag: T["tag"]) => boolean
  matches: (...values: T["state"][]) => boolean
}

export type Service<T extends MachineSchema> = {
  getStatus: () => MachineStatus
  state: State<T> & {
    matches: (...values: T["state"][]) => boolean
    hasTag: (tag: T["tag"]) => boolean
  }
  context: BindableContext<T>
  send: (event: EventType<T["event"]>) => void
  prop: PropFn<T>
  scope: Scope
  computed: ComputedFn<T>
  refs: BindableRefs<T>
  event: EventType<T["event"]> & {
    current: () => EventType<T["event"]>
    previous: () => EventType<T["event"]>
  }
}

export enum MachineStatus {
  NotStarted = "Not Started",
  Started = "Started",
  Stopped = "Stopped",
}

export const INIT_STATE = "__init__"
