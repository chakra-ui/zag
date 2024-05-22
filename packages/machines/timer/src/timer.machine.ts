import { createMachine } from "@zag-js/core"
import { compact } from "@zag-js/utils"
import type { MachineContext, MachineState, UserDefinedContext } from "./timer.types"

function getValuePercent(value: number, minValue: number, maxValue: number) {
  return (value - minValue) / (maxValue - minValue)
}

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "timer",
      initial: ctx.autoStart ? "running" : "idle",
      context: {
        interval: 250,
        ...ctx,
        currentMs: ctx.startMs ?? 0,
      },

      on: {
        RESTART: {
          target: "running",
          actions: "resetTime",
        },
      },

      computed: {
        segments: (ctx) => getTimeSegments(ctx.currentMs),
        progressPercent: (ctx) => {
          const targetMs = ctx.targetMs
          if (targetMs == null) return 0
          return getValuePercent(ctx.currentMs, ctx.startMs ?? 0, targetMs)
        },
      },

      states: {
        idle: {
          on: {
            START: "running",
            RESET: { actions: "resetTime" },
          },
        },
        running: {
          every: {
            TICK_INTERVAL: ["sendTickEvent"],
          },
          on: {
            PAUSE: "paused",
            TICK: [
              {
                target: "idle",
                guard: "hasReachedTarget",
                actions: ["invokeOnComplete"],
              },
              {
                actions: ["updateTime", "invokeOnTick"],
              },
            ],
            RESET: { actions: "resetTime" },
          },
        },
        paused: {
          on: {
            RESUME: "running",
            RESET: {
              target: "idle",
              actions: "resetTime",
            },
          },
        },
      },
    },
    {
      delays: {
        TICK_INTERVAL: (ctx) => ctx.interval,
      },
      actions: {
        updateTime(ctx) {
          const sign = ctx.countdown ? -1 : 1
          ctx.currentMs = ctx.currentMs + sign * ctx.interval
        },
        sendTickEvent(_ctx, _evt, { send }) {
          send({ type: "TICK" })
        },
        resetTime(ctx) {
          let targetMs = ctx.targetMs
          if (targetMs == null && ctx.countdown) targetMs = 0
          ctx.currentMs = ctx.startMs ?? 0
        },
        invokeOnTick(ctx) {
          ctx.onTick?.({
            value: ctx.currentMs,
            segments: ctx.segments,
          })
        },
        invokeOnComplete(ctx) {
          ctx.onComplete?.()
        },
      },
      guards: {
        hasReachedTarget: (ctx) => {
          let targetMs = ctx.targetMs
          if (targetMs == null && ctx.countdown) targetMs = 0
          if (targetMs == null) return false
          return ctx.currentMs === targetMs
        },
      },
    },
  )
}

function getTimeSegments(ms: number) {
  const milliseconds = ms % 1000
  const seconds = Math.floor(ms / 1000) % 60
  const minutes = Math.floor(ms / (1000 * 60)) % 60
  const hours = Math.floor(ms / (1000 * 60 * 60)) % 24
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))

  return {
    day: days,
    hour: hours,
    minute: minutes,
    second: seconds,
    millisecond: milliseconds,
    toJSON() {
      return { d: days, h: hours, m: minutes, s: seconds, ms: milliseconds }
    },
  }
}
