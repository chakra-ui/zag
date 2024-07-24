/* -----------------------------------------------------------------------------
 * General type utilities
 * -----------------------------------------------------------------------------*/

export type Dict<T = any> = Record<string, T>

export type MaybeArray<T> = T | T[]

export type VoidFunction = () => void

type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B

type WritableKey<T> = {
  [P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P, never>
}[keyof T]

export type Writable<T> = Pick<T, WritableKey<T>>

type Computed<T> = Omit<T, WritableKey<T>>

/* -----------------------------------------------------------------------------
 * Here comes the state machine interface
 * -----------------------------------------------------------------------------*/

export declare namespace StateMachine {
  /* -----------------------------------------------------------------------------
   * Context types
   * -----------------------------------------------------------------------------*/

  export type Context<V, C> = V & Readonly<C>

  export type TComputedContext<T> = {
    [K in keyof Computed<T>]: (ctx: T) => T[K]
  }

  export type UserContext<TContext> = Partial<Writable<TContext>>

  export type ContextListener<TContext extends Dict> = (context: TContext) => void

  /* -----------------------------------------------------------------------------
   * Event types. Can be either a string or object
   * -----------------------------------------------------------------------------*/

  export type EventObject = { type: string }

  export type Event<TEvent extends EventObject = EventObject> = TEvent["type"] | TEvent

  export interface AnyEventObject extends EventObject {
    [key: string]: any
  }

  export type Send<TEvent extends EventObject = AnyEventObject> = (event: Event<TEvent>) => void

  export type EventListener<TEvent extends EventObject = AnyEventObject> = (event: TEvent) => void

  export type ExtractEvent<TEvent extends EventObject, K> = K extends TEvent["type"]
    ? Extract<TEvent, { type: K }>
    : EventObject

  /* -----------------------------------------------------------------------------
   * Expression types. `actions` and `activities` are expressions.
   * -----------------------------------------------------------------------------*/

  type Expression<TContext extends Dict, TEvent extends EventObject, TReturn> = (
    context: TContext,
    event: TEvent,
  ) => TReturn

  export type Meta<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> = {
    state: State<TContext, TState>
    guards: Dict
    send: Send<TEvent>
    self: Self<TContext, TState, TEvent>
    initialContext: TContext
    initialState: string
    getState: () => State<TContext, TState, TEvent>
    getAction: (key: string) => ExpressionWithMeta<TContext, TState, TEvent, void>
    getGuard: (key: string) => GuardExpression<TContext, TState, TEvent>
  }

  type ExpressionWithMeta<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject, TReturn> = (
    context: TContext,
    event: TEvent,
    meta: Meta<TContext, TState, TEvent>,
  ) => TReturn

  /* -----------------------------------------------------------------------------
   * Action types
   * -----------------------------------------------------------------------------*/

  export type Action<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> =
    | string
    | ExpressionWithMeta<TContext, TState, TEvent, void>

  export type Actions<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> =
    | ChooseHelper<TContext, TState, TEvent>
    | MaybeArray<Action<TContext, TState, TEvent>>

  export type PureActions<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> = MaybeArray<
    Action<TContext, TState, TEvent>
  >

  export type ActionMap<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> = {
    [action: string]: ExpressionWithMeta<TContext, TState, TEvent, void>
  }

  /* -----------------------------------------------------------------------------
   * Activity types
   * -----------------------------------------------------------------------------*/

  export type Activity<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> =
    | string
    | ExpressionWithMeta<TContext, TState, TEvent, VoidFunction | void | undefined>

  export type Activities<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> = MaybeArray<
    Activity<TContext, TState, TEvent>
  >

  export type ActivityMap<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> = {
    [activity: string]: ExpressionWithMeta<TContext, TState, TEvent, VoidFunction | void | undefined>
  }

  /* -----------------------------------------------------------------------------
   * Transition types
   * -----------------------------------------------------------------------------*/

  export type TransitionDefinition<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> = {
    target?: TState["value"]
    actions?: Actions<TContext, TState, TEvent>
    guard?: Guard<TContext, TState, TEvent>
    internal?: boolean
  }

  export type DelayExpression<TContext extends Dict, TEvent extends EventObject> = Expression<TContext, TEvent, number>

  export type Delay<TContext extends Dict, TEvent extends EventObject> =
    | string
    | number
    | DelayExpression<TContext, TEvent>

  export type DelayMap<TContext extends Dict, TEvent extends EventObject> = {
    [delay: string]: number | DelayExpression<TContext, TEvent>
  }

  // For transition definitions in `after` and `every`
  export type DelayedTransition<
    TContext extends Dict,
    TState extends StateSchema,
    TEvent extends EventObject,
  > = TransitionDefinition<TContext, TState, TEvent> & {
    /**
     * The time to delay the event, in milliseconds.
     */
    delay?: Delay<TContext, TEvent>
  }

  export type DelayedTransitions<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> =
    | Record<string | number, TState["value"] | MaybeArray<TransitionDefinition<TContext, TState, TEvent>>>
    | Array<DelayedTransition<TContext, TState, TEvent>>

  /**
   * a transition can be a string (e.g "off") or a full definition object
   * { target: "off", actions: [...], guard: "isEmpty" }
   */
  export type Transition<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> =
    | TState["value"]
    | TransitionDefinition<TContext, TState, TEvent>

  /**
   * Transition can be a string (representing the `target`), an object or an array of possible
   * transitions with `guard` to determine the selected transition
   */
  export type Transitions<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> =
    | Transition<TContext, TState, TEvent>
    | Array<TransitionDefinition<TContext, TState, TEvent>>

  export type TransitionDefinitionMap<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> = {
    [K in TEvent["type"]]?:
      | TState["value"]
      | MaybeArray<TransitionDefinition<TContext, TState, ExtractEvent<TEvent, K>>>
  }

  /* -----------------------------------------------------------------------------
   * State node definition
   * -----------------------------------------------------------------------------*/

  export interface StateNode<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> {
    /**
     * The type of this state node.
     */
    type?: "final"
    /**
     * The tags for the state node.
     */
    tags?: MaybeArray<TState["tags"] extends string ? TState["tags"] : string>
    /**
     * The activities to be started upon entering the state node,
     * and stopped upon exiting the state node.
     */
    activities?: Activities<TContext, TState, TEvent>
    /**
     * The mapping of event types to their potential transition(s).
     */
    on?: TransitionDefinitionMap<TContext, TState, TEvent>
    /**
     * The action(s) to be executed upon entering the state node.
     */
    entry?: Actions<TContext, TState, TEvent>
    /**
     * The action(s) to be executed upon exiting the state node.
     */
    exit?: Actions<TContext, TState, TEvent>
    /**
     * The meta data associated with this state node.
     */
    meta?: string | Dict
    /**
     * The mapping (or array) of delays (in `ms`) to their potential transition(s) to run after
     * the specified delay. Uses `setTimeout` under the hood.
     */
    after?: DelayedTransitions<TContext, TState, TEvent>
    /**
     * The mapping (or array) of intervals (in `ms`) to their potential actions(s) to run at interval.
     *  Uses `setInterval` under the hood.
     */
    every?:
      | Record<string | number, Actions<TContext, TState, TEvent>>
      | Array<{
          delay?: number | string | Expression<TContext, TEvent, number>
          actions: Actions<TContext, TState, TEvent>
          guard?: Guard<TContext, TState, TEvent>
        }>
  }

  /* -----------------------------------------------------------------------------
   * Guard types
   * -----------------------------------------------------------------------------*/

  export type GuardMeta<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> = {
    state: Pick<State<TContext, TState, TEvent>, "matches">
  }

  export type GuardExpression<
    TContext extends Dict,
    TState extends StateSchema,
    TEvent extends EventObject,
    TReturn = boolean,
  > = (context: TContext, event: TEvent, guardMeta: GuardMeta<TContext, TState, TEvent>) => TReturn

  export type GuardHelper<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> = {
    predicate: (guards: Dict) => GuardExpression<TContext, TState, TEvent>
  }

  export type ChooseHelper<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> = {
    predicate: (
      guards: Dict,
    ) => GuardExpression<TContext, TState, TEvent, PureActions<TContext, TState, TEvent> | undefined>
  }

  export type Guard<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> =
    | string
    | GuardExpression<TContext, TState, TEvent>
    | GuardHelper<TContext, TState, TEvent>

  export type GuardMap<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> = {
    [guard: string]: GuardExpression<TContext, TState, TEvent>
  }

  /* -----------------------------------------------------------------------------
   * State types
   * -----------------------------------------------------------------------------*/

  export type StateSchema = {
    value: string
    tags?: string
  }

  export type StateInitObject<TContext, TState extends StateSchema> = {
    context?: TContext
    value: TState["value"] | null
    tags?: TState["tags"][]
  }

  export type StateInit<TContext, TState extends StateSchema> = StateInitObject<TContext, TState>

  export type StateListener<
    TContext extends Dict,
    TState extends StateSchema,
    TEvent extends EventObject = EventObject,
  > = (state: State<TContext, TState, TEvent>) => void

  export interface StateInfo<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> {
    reenter: boolean
    changed: boolean
    transition: TransitionDefinition<TContext, TState, TEvent> | undefined
    stateNode: StateNode<TContext, TState, TEvent> | undefined
    target: TState["value"]
  }

  /* -----------------------------------------------------------------------------
   * Machine configuration types
   * -----------------------------------------------------------------------------*/

  export interface MachineConfig<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> {
    /**
     * Function called synchronously after the machine has been instantiated,
     * before it is started.
     */
    created?: Actions<TContext, TState, TEvent>
    /**
     * The actions to run when the machine has started. This is usually
     * called in the `beforeMount`, `onMount` or `useLayoutEffect` lifecycle methods.
     */
    entry?: Actions<TContext, TState, TEvent>
    /**
     * The actions to run when the machine has stopped. This is usually
     * called in the `onUnmount` or `useLayoutEffect` cleanup lifecycle methods.
     */
    exit?: Actions<TContext, TState, TEvent>
    /**
     * The root level activities to run when the machine is started
     */
    activities?: Activities<TContext, TState, TEvent>
    /**
     * The unique identifier for the invoked machine.
     */
    id?: string
    /**
     * The extended state used to store `data` for your machine
     */
    context?: Writable<TContext>
    /**
     * A generic way to react to context value changes
     */
    watch?: { [K in keyof TContext]?: Actions<TContext, TState, TEvent> }
    /**
     * The computed properties based on the state
     */
    computed?: Partial<TComputedContext<TContext>>
    /**
     * The initial state to start with
     */
    initial?: TState["value"]
    /**
     * The mapping of state node keys to their state node configurations (recursive).
     */
    states?: Partial<Record<TState["value"], StateNode<TContext, TState, TEvent>>>
    /**
     * Mapping events to transitions
     */
    on?: TransitionDefinitionMap<TContext, TState, TEvent>
  }

  export interface State<
    TContext extends Dict,
    TState extends StateSchema = StateSchema,
    TEvent extends EventObject = AnyEventObject,
  > {
    value: TState["value"] | null
    previousValue: TState["value"] | null
    event: TEvent
    previousEvent: TEvent
    context: TContext
    done: boolean
    can(event: string): boolean
    matches(...value: TState["value"][]): boolean
    hasTag(value: TState["tags"]): boolean
    nextEvents: string[]
    changed: boolean
    tags: TState["tags"][]
  }

  /* -----------------------------------------------------------------------------
   * Machine options types
   * -----------------------------------------------------------------------------*/

  export interface MachineOptions<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> {
    debug?: boolean
    guards?: GuardMap<TContext, TState, TEvent>
    actions?: ActionMap<TContext, TState, TEvent>
    delays?: DelayMap<TContext, TEvent>
    activities?: ActivityMap<TContext, TState, TEvent>
    sync?: boolean
    compareFns?: { [K in keyof TContext]?: CompareFn<TContext[K]> }
  }

  export type HookOptions<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> = {
    actions?: ActionMap<TContext, TState, TEvent>
    state?: StateInit<TContext, TState>
    context?: UserContext<TContext>
  }

  export type Self<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> = {
    id: string
    send: (event: Event<TEvent>) => void
    sendParent: (evt: AnyEventObject) => void
    sendChild: (evt: Event<TEvent>, to: string | ((ctx: TContext) => string)) => void
    stop: VoidFunction
    stopChild: (id: string) => void
    stopActivity: (id: string) => void
    spawn<T>(src: T | (() => T), id?: string): T
    state: State<TContext, TState, TEvent>
    initialContext: TContext
    initialState: string
  }
}

export enum MachineStatus {
  NotStarted = "Not Started",
  Running = "Running",
  Stopped = "Stopped",
}

export enum ActionTypes {
  Start = "machine.start",
  Stop = "machine.stop",
  Created = "machine.created",
  Init = "machine.init",
}

export enum MachineType {
  Machine = "machine",
  Actor = "machine.actor",
}

export type CompareFn<T = any> = (prev: T, next: T) => boolean
