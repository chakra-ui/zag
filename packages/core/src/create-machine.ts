import type { BaseSchema, GuardFn, MachineConfig } from "./types"

export function createGuards<T extends BaseSchema>() {
  return {
    and: (...guards: Array<GuardFn | T["guard"]>) => {
      return function andGuard(params: any) {
        return guards.every((str) => params.guard(str))
      }
    },
    or: (...guards: Array<GuardFn | T["guard"]>) => {
      return function orGuard(params: any) {
        return guards.some((str) => params.guard(str))
      }
    },
    not: (guard: GuardFn | T["guard"]) => {
      return function notGuard(params: any) {
        return !params.guard(guard)
      }
    },
  }
}

export function createMachine<T extends BaseSchema>(config: MachineConfig<T>) {
  return config
}
