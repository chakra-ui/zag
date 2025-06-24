import type { MachineSchema, GuardFn, Machine, Params, Transition } from "./types"

export function createGuards<T extends MachineSchema>() {
  return {
    and: (...guards: Array<GuardFn<T> | T["guard"]>) => {
      return function andGuard(params: any) {
        return guards.every((str) => params.guard(str))
      }
    },
    or: (...guards: Array<GuardFn<T> | T["guard"]>) => {
      return function orGuard(params: any) {
        return guards.some((str) => params.guard(str))
      }
    },
    not: (guard: GuardFn<T> | T["guard"]) => {
      return function notGuard(params: any) {
        return !params.guard(guard)
      }
    },
  }
}

export function createMachine<T extends MachineSchema>(config: Machine<T>) {
  return config
}

export function setup<T extends MachineSchema>() {
  return {
    guards: createGuards<T>(),
    createMachine: (config: Machine<T>) => {
      return createMachine(config)
    },
    choose: (transitions: Transition<T> | Transition<T>[]) => {
      return function chooseFn({ choose }: Params<T>) {
        return choose(transitions)?.actions
      }
    },
  }
}
