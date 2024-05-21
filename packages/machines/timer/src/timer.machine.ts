import { createMachine } from "@zag-js/core"
import { compact } from "@zag-js/utils"
import type { MachineContext, MachineState, UserDefinedContext } from "./timer.types"

const TIMER_INTERVAL = 250

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "timer",
      initial: ctx.autostart ? "running" : "idle",
      context: {
        mode: "stopwatch",
        duration: 0,
        min: 0,
        count: ctx.duration ?? 0,
        ...ctx,
      },

      on: {
        RESTART: { target: "running", actions: "resetTime" },
      },

      computed: { countTimeUnits: (ctx) => getTimeUnits(ctx.count) },

      states: {
        idle: {
          on: {
            START: "running",
            RESET: { actions: "resetTime" },
          },
        },
        running: {
          every: { [TIMER_INTERVAL]: ["sendTickEvent"] },
          on: {
            PAUSE: "paused",
            TICK: [
              {
                target: "completed",
                guard: "isCountdownComplete",
                actions: ["invokeOnComplete"],
              },
              { actions: ["updateTime", "invokeOnTick"] },
            ],
            RESET: { actions: "resetTime" },
          },
        },
        paused: {
          on: {
            RESUME: "running",
            RESET: { target: "idle", actions: "resetTime" },
          },
        },
        completed: {
          on: {
            RESET: { target: "idle", actions: "resetTime" },
          },
        },
      },
    },
    {
      actions: {
        updateTime: (ctx) => {
          if (ctx.mode === "stopwatch") {
            ctx.count += TIMER_INTERVAL
          } else if (ctx.mode === "countdown") {
            ctx.count -= TIMER_INTERVAL
          }
        },
        sendTickEvent: (ctx, __, { send }) => {
          send({ type: "TICK" })
        },
        resetTime: (ctx) => {
          ctx.count = ctx.mode === "countdown" ? ctx.duration : 0
        },
        invokeOnTick(ctx) {
          ctx.onTick?.(ctx.countTimeUnits)
        },
        invokeOnComplete(ctx) {
          ctx.onComplete?.()
        },
      },
      guards: {
        isCountdownComplete: (ctx) => ctx.mode === "countdown" && ctx.count <= ctx.min,
      },
    },
  )
}

function getTimeUnits(ms: number) {
  const isNegative = ms < 0
  const absMs = Math.abs(ms)

  const milliseconds = absMs % 1000
  const seconds = Math.floor(absMs / 1000) % 60
  const minutes = Math.floor(absMs / (1000 * 60)) % 60
  const hours = Math.floor(absMs / (1000 * 60 * 60)) % 24
  const days = Math.floor(absMs / (1000 * 60 * 60 * 24))

  return {
    day: isNegative ? -days : days,
    hour: isNegative ? -hours : hours,
    minute: isNegative ? -minutes : minutes,
    second: isNegative ? -seconds : seconds,
    millisecond: isNegative ? -milliseconds : milliseconds,
  }
}
