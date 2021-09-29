import { Machine } from "./machine"
import { Dict, StateMachine as S } from "./types"

export const createMachine = <
  TContext extends Dict,
  TState extends S.StateSchema = S.StateSchema,
  TEvent extends S.EventObject = S.AnyEventObject,
>(
  config: S.MachineConfig<TContext, TState, TEvent>,
  options?: S.MachineOptions<TContext, TState, TEvent>,
) => new Machine(config, options)
