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
  flush: (fn: VoidFunction) => void
}

interface PropFn<T extends Dict> {
  <K extends keyof T["props"]>(key: K): T["props"][K]
}

interface ComputedFn<T extends Dict> {
  <K extends keyof T["computed"]>(key: K): T["computed"][K]
}

type AnyFunction = () => string | number | boolean | null | undefined
type TrackFn = (deps: AnyFunction[], fn: VoidFunction) => void

export interface BindableParams<T> {
  defaultValue?: T | undefined
  value?: T | undefined
  isEqual?: (a: T, b: T | undefined) => boolean
  onChange?: (value: T, prev: T | undefined) => void
  debug?: string
  sync?: boolean
}

export type ValueOrFn<T> = T | ((prev: T) => T)

export interface Bindable<T> {
  initial: T | undefined
  ref: any
  get: () => T
  set(value: ValueOrFn<T>): void
  invoke(nextValue: T, prevValue: T): void
}

interface BindableRefs<T extends Dict> {
  set<K extends keyof T["refs"]>(key: K, value: ValueOrFn<T["refs"][K]>): void
  get<K extends keyof T["refs"]>(key: K): T["refs"][K]
}

export interface BindableContext<T extends Dict> {
  set<K extends keyof T["context"]>(key: K, value: ValueOrFn<T["context"][K]>): void
  get<K extends keyof T["context"]>(key: K): T["context"][K]
  initial<K extends keyof T["context"]>(key: K): T["context"][K]
}

interface BindableFn {
  <K>(params: () => BindableParams<K>): Bindable<K>
}

export interface Scope {
  id?: string | undefined
  ids?: Record<string, any> | undefined
  getRootNode: (() => ShadowRoot | Document | Node) | undefined
  getById: <T extends Element = HTMLElement>(id: string) => T | null
  getActiveElement: () => HTMLElement | null
  isActiveElement: (elem: HTMLElement | null) => boolean
  getDoc: () => typeof document
  getWin: () => typeof window
}

type EventType<T = any> = T & {
  previousEvent?: T
  src?: string
  [key: string]: any
}

export type EventObject = EventType<{ type: string }>

export interface Params<T extends Dict> {
  prop: PropFn<T>
  bindable: BindableFn
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
  state: Bindable<T["state"]>
}

export type GuardFn = (params: any) => boolean

interface Transition<T extends Dict> {
  target?: T["state"]
  actions?: T["action"][]
  guard?: T["guard"] | GuardFn
}

interface PropsParams<T extends Dict> {
  props: Partial<T["props"]>
  scope: Scope
}

export interface MachineConfig<T extends Dict> {
  props?: (params: PropsParams<T>) => T["props"]
  context?: (params: ContextParams<T>) => {
    [K in keyof T["context"]]: Bindable<T["context"][K]>
  }
  computed?: {
    [K in keyof T["computed"]]: (params: ComputedParams<T>) => T["computed"][K]
  }
  initialState: (params: { prop: PropFn<T> }) => T["state"]
  entry?: T["action"][]
  exit?: T["action"][]
  effects?: T["effect"][]
  refs?: (params: { prop: PropFn<T> }) => T["refs"]
  dom?: (params: Params<T>) => T["dom"]
  watch?: (params: Params<T>) => void
  on?: {
    [E in T["event"]["type"]]?: Transition<T> | Array<Transition<T>>
  }
  states: {
    [K in T["state"]]: {
      tags?: T["tag"][]
      entry?: T["action"][]
      exit?: T["action"][]
      effects?: T["effect"][]
      on?: {
        [E in T["event"]["type"]]?: Transition<T> | Array<Transition<T>>
      }
    }
  }
  implementations: {
    guards?: {
      [K in T["guard"]]: (params: Params<T>) => boolean
    }
    actions?: {
      [K in T["action"]]: (params: Params<T>) => void
    }
    effects?: {
      [K in T["effect"]]: (params: Params<T>) => void | VoidFunction
    }
  }
}

interface BaseProps {
  id?: string | undefined
  ids?: Record<string, any> | undefined
  getRootNode?: (() => ShadowRoot | Document | Node) | undefined
  [key: string]: any
}

export interface BaseSchema {
  props?: BaseProps
  context?: Record<string, any>
  refs?: Record<string, any>
  computed?: Record<string, any>
  state?: string
  tag?: string
  guard?: string
  action?: string
  effect?: string
  event?: { type: string } & Dict
}

type State<T extends BaseSchema> = Bindable<T["state"]> & {
  hasTag: (tag: T["tag"]) => boolean
  matches: (...values: T["state"][]) => boolean
}

export type Service<T extends BaseSchema> = {
  state: State<T>
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
