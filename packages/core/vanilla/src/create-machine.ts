import { Machine } from "./machine"
import { Dict, StateMachine } from "./types"

export const createMachine = <
  TContext extends Dict,
  TState extends StateMachine.StateSchema = StateMachine.StateSchema,
  TEvent extends StateMachine.EventObject = StateMachine.AnyEventObject,
>(
  config: StateMachine.MachineConfig<TContext, TState, TEvent>,
  options?: StateMachine.MachineOptions<TContext, TState, TEvent>,
) => new Machine(config, options)
