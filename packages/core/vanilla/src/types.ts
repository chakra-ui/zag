export type Dict<T = any> = Record<string, T>

export type MaybeArray<T> = T | T[]

export type VoidFunction = () => void

type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B

type WritableKeysOf<T> = {
  [P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P, never>
}[keyof T]

type WritablePart<T> = Pick<T, WritableKeysOf<T>>

type ReadonlyPart<T> = Omit<T, WritableKeysOf<T>>

export declare namespace StateMachine {
  // event sent can be either a string or object
  export type EventObject = { type: string }

  export type Event<TEvent extends EventObject = EventObject> = TEvent["type"] | TEvent

  export interface AnyEventObject extends EventObject {
    [key: string]: any
  }

  export type EventWithSrc = AnyEventObject & { src?: any; __type?: string }

  // expression is a generic function that takes context + event
  type Expression<TContext extends Dict, TEvent extends EventObject, TReturn> = (
    context: TContext,
    event: TEvent,
  ) => TReturn

  type Meta<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> = {
    state: State<TContext, TState>
    guards?: Dict
    send: (event: Event<TEvent>) => void | Promise<void>
  }

  type ExpressionWithMeta<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject, TReturn> = (
    context: TContext,
    event: TEvent,
    meta: Meta<TContext, TState, TEvent>,
  ) => TReturn

  // transitions can define `actions` which can be a string or function
  export type Action<TContext extends Dict, TEvent extends EventObject> = string | Expression<TContext, TEvent, void>

  export type Actions<TContext extends Dict, TEvent extends EventObject> = MaybeArray<Action<TContext, TEvent>>

  export type TransitionDefinition<TContext extends Dict, TState extends string, TEvent extends EventObject> = {
    target?: TState
    actions?: Actions<TContext, TEvent>
    cond?: Condition<TContext, TEvent>
  }

  export type DelayExpression<TContext, TEvent extends EventObject> = Expression<TContext, TEvent, number>

  export type Delay<TContext extends Dict, TEvent extends EventObject> =
    | string
    | number
    | DelayExpression<TContext, TEvent>

  // For transition definitions in `after` and `every`
  export type DelayedTransition<
    TContext extends Dict,
    TState extends string,
    TEvent extends EventObject,
  > = TransitionDefinition<TContext, TState, TEvent> & {
    /**
     * The time to delay the event, in milliseconds.
     */
    delay?: Delay<TContext, TEvent>
  }

  export type DelayedTransitions<TContext, TState extends string, TEvent extends EventObject> =
    | Record<string | number, TState | MaybeArray<TransitionDefinition<TContext, TState, TEvent>>>
    | Array<DelayedTransition<TContext, TState, TEvent>>

  // a transition can be a string (e.g "off") or a full definition object
  // { target: "off", actions: [...], cond: "isEmpty" }
  export type Transition<TContext extends Dict, TState extends string, TEvent extends EventObject> =
    | TState
    | TransitionDefinition<TContext, TState, TEvent>

  // a transition can be a simple transition as described above
  // or an array of possible transitions with `cond` to determine
  // the selected transition
  export type Transitions<TContext extends Dict, TState extends string, TEvent extends EventObject> =
    | Transition<TContext, TState, TEvent>
    | Array<TransitionDefinition<TContext, TState, TEvent>>

  export type Activity<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> =
    | string
    | ExpressionWithMeta<TContext, TState, TEvent, VoidFunction>

  export type Activities<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> = MaybeArray<
    Activity<TContext, TState, TEvent>
  >

  export type ExtractEvent<TEvent extends EventObject, K> = K extends TEvent["type"]
    ? Extract<TEvent, { type: K }>
    : EventObject

  export type TransitionDefinitionMap<TContext, TState extends string, TEvent extends EventObject> = {
    [K in TEvent["type"]]?: TState | MaybeArray<TransitionDefinition<TContext, TState, ExtractEvent<TEvent, K>>>
  }

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
    on?: TransitionDefinitionMap<TContext, TState["value"], TEvent>
    /**
     * The action(s) to be executed upon entering the state node.
     */
    entry?: Actions<TContext, TEvent>
    /**
     * The action(s) to be executed upon exiting the state node.
     */
    exit?: Actions<TContext, TEvent>
    /**
     * The meta data associated with this state node.
     */
    meta?: string | Dict
    /**
     * The mapping (or array) of delays (in `ms`) to their potential transition(s) to run after
     * the specified delay. Uses `setTimeout` under the hood.
     */
    after?: DelayedTransitions<TContext, TState["value"], TEvent>
    /**
     * The mapping (or array) of intervals (in `ms`) to their potential actions(s) to run at interval.
     *  Uses `setInterval` under the hood.
     */
    every?:
      | Record<string | number, Actions<TContext, TEvent>>
      | Array<{
          delay?: number | string | Expression<TContext, TEvent, number>
          actions: Actions<TContext, TEvent>
          cond?: Condition<TContext, TEvent>
        }>
  }

  export type ConditionExpression<TContext, TEvent extends EventObject> = Expression<TContext, TEvent, boolean>

  export type ConditionHelper<TContext extends Dict, TEvent extends EventObject> = {
    toString: () => string
    exec: (guards: Dict) => ConditionExpression<TContext, TEvent>
  }

  export type Condition<TContext extends Dict, TEvent extends EventObject> =
    | string
    | ConditionExpression<TContext, TEvent>
    | ConditionHelper<TContext, TEvent>

  export type StateSchema = {
    value: string
    tags?: string
  }

  export type TComputedContext<T> = {
    [K in keyof ReadonlyPart<T>]: (ctx: WritablePart<T>) => T[K]
  }

  export interface MachineConfig<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> {
    /**
     * The actions to take when the machine has stopped
     */
    onStart?: Actions<TContext, TEvent>
    /**
     * The actions to take when the machine has stopped
     */
    onStop?: Actions<TContext, TEvent>
    /**
     * The unique identifier for the invoked machine.
     */
    id?: string
    /**
     * The extended state used to store `data` for your machine
     */
    context?: WritablePart<TContext>
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
    on?: TransitionDefinitionMap<TContext, TState["value"], TEvent>
  }

  export interface State<TContext extends Dict, TState extends StateSchema = StateSchema> {
    value: TState["value"] | null
    previousValue: TState["value"] | null
    event: string | string[]
    context: TContext
    done: boolean
    can(event: string): boolean
    matches(...value: TState["value"][]): boolean
    hasTag(value: TState["tags"]): boolean
    nextEvents: string[]
    changed: boolean
    tags: Set<TState["tags"]>
  }

  export type StateListener<TContext extends Dict, TState extends StateSchema> = (
    state: State<TContext, TState>,
  ) => void

  export type ContextListener<TContext extends Dict> = (context: TContext) => void

  export interface StateInfo<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> {
    transition: TransitionDefinition<TContext, TState["value"], TEvent> | undefined
    stateNode: StateNode<TContext, TState, TEvent> | undefined
    target: TState["value"]
  }

  // Machine Options

  export type ActionMap<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> = {
    [action: string]: (
      context: TContext,
      event: TEvent,
      actionMeta: { state: State<TContext, TState>; guards?: Dict },
    ) => void
  }

  export type GuardMap<TContext extends Dict, TEvent extends EventObject> = {
    [guard: string]: ConditionExpression<TContext, TEvent>
  }

  export type ActivityMap<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> = {
    [activity: string]: ExpressionWithMeta<TContext, TState, TEvent, VoidFunction>
  }

  export type DelayMap<TContext extends Dict, TEvent extends EventObject> = {
    [delay: string]: number | DelayExpression<TContext, TEvent>
  }

  export interface MachineOptions<TContext extends Dict, TState extends StateSchema, TEvent extends EventObject> {
    guards?: GuardMap<TContext, TEvent>
    actions?: ActionMap<TContext, TState, TEvent>
    delays?: DelayMap<TContext, TEvent>
    activities?: ActivityMap<TContext, TState, TEvent>
  }

  export type StateInitObject<TContext, TState extends StateSchema> = {
    context: TContext
    value: TState["value"]
  }

  export type StateInit<TContext, TState extends StateSchema> = TState["value"] | StateInitObject<TContext, TState>
}

export enum MachineStatus {
  NotStarted = "Not Started",
  Running = "Running",
  Stopped = "Stopped",
}

export enum ActionTypes {
  Sync = "machine.sync",
  Start = "machine.start",
  Stop = "machine.stop",
  Send = "machine.send",
  SendParent = "machine.send-parent",
  Cancel = "machine.cancel",
  NullEvent = "",
  After = "machine.after",
  Every = "machine.every",
  Log = "machine.log",
  Init = "machine.init",
}

export enum MachineType {
  Machine = "machine",
  Actor = "machine.actor",
}
