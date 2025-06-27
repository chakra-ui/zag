import { createMachine } from "@zag-js/core"
import { clampValue, setRafInterval, setRafTimeout } from "@zag-js/utils"
import type { Time, TimerProps, TimerSchema } from "./timer.types"

export const machine = createMachine<TimerSchema>({
  props({ props }) {
    validateProps(props)
    return {
      interval: 1000,
      ...props,
    }
  },

  initialState({ prop }) {
    return prop("autoStart") ? "running" : "idle"
  },

  context({ prop, bindable }) {
    return {
      currentMs: bindable(() => ({
        defaultValue: prop("startMs") ?? 0,
      })),
    }
  },

  watch({ track, send, prop }) {
    track([() => prop("startMs")], () => {
      send({ type: "RESTART" })
    })
  },

  on: {
    RESTART: {
      target: "running:temp",
      actions: ["resetTime"],
    },
  },

  computed: {
    time: ({ context }) => msToTime(context.get("currentMs")),
    formattedTime: ({ computed }) => formatTime(computed("time")),
    progressPercent: ({ context, prop }) => {
      const targetMs = prop("targetMs")
      if (targetMs == null) return 0
      const startMs = prop("startMs") ?? 0
      const currentMs = context.get("currentMs")

      // Fix for countdown timers: swap min/max values
      if (prop("countdown")) {
        return clampValue(toPercent(currentMs, targetMs, startMs), 0, 1)
      }
      return clampValue(toPercent(currentMs, startMs, targetMs), 0, 1)
    },
  },

  states: {
    idle: {
      on: {
        START: {
          target: "running",
        },
        RESET: {
          actions: ["resetTime"],
        },
      },
    },

    "running:temp": {
      effects: ["waitForNextTick"],
      on: {
        CONTINUE: {
          target: "running",
        },
      },
    },

    running: {
      effects: ["keepTicking"],
      on: {
        PAUSE: {
          target: "paused",
        },
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
        RESET: {
          actions: ["resetTime"],
        },
      },
    },
    paused: {
      on: {
        RESUME: {
          target: "running",
        },
        RESET: {
          target: "idle",
          actions: ["resetTime"],
        },
      },
    },
  },

  implementations: {
    effects: {
      keepTicking({ prop, send }) {
        return setRafInterval(({ deltaMs }) => {
          send({ type: "TICK", deltaMs })
        }, prop("interval"))
      },
      waitForNextTick({ send }) {
        return setRafTimeout(() => {
          send({ type: "CONTINUE" })
        }, 0)
      },
    },

    actions: {
      updateTime({ context, prop, event }) {
        const sign = prop("countdown") ? -1 : 1
        const deltaMs = roundToInterval(event.deltaMs, prop("interval"))
        context.set("currentMs", (prev) => {
          const newValue = prev + sign * deltaMs
          let targetMs = prop("targetMs")
          if (targetMs == null && prop("countdown")) targetMs = 0

          if (prop("countdown") && targetMs != null) {
            return Math.max(newValue, targetMs)
          } else if (!prop("countdown") && targetMs != null) {
            return Math.min(newValue, targetMs)
          }
          return newValue
        })
      },
      resetTime({ context, prop }) {
        let targetMs = prop("targetMs")
        if (targetMs == null && prop("countdown")) targetMs = 0
        context.set("currentMs", prop("startMs") ?? 0)
      },
      invokeOnTick({ context, prop, computed }) {
        prop("onTick")?.({
          value: context.get("currentMs"),
          time: computed("time"),
          formattedTime: computed("formattedTime"),
        })
      },
      invokeOnComplete({ prop }) {
        prop("onComplete")?.()
      },
    },

    guards: {
      hasReachedTarget: ({ context, prop }) => {
        let targetMs = prop("targetMs")
        if (targetMs == null && prop("countdown")) targetMs = 0
        if (targetMs == null) return false
        const currentMs = context.get("currentMs")
        return prop("countdown") ? currentMs <= targetMs : currentMs >= targetMs
      },
    },
  },
})

function msToTime(ms: number): Time {
  const time = Math.max(0, ms)
  const milliseconds = time % 1000
  const seconds = Math.floor(time / 1000) % 60
  const minutes = Math.floor(time / (1000 * 60)) % 60
  const hours = Math.floor(time / (1000 * 60 * 60)) % 24
  const days = Math.floor(time / (1000 * 60 * 60 * 24))
  return {
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
  }
}

function toPercent(value: number, minValue: number, maxValue: number) {
  const range = maxValue - minValue
  if (range === 0) return 0
  return (value - minValue) / range
}

function padStart(num: number, size = 2) {
  return num.toString().padStart(size, "0")
}

function roundToInterval(value: number, interval: number) {
  return Math.floor(value / interval) * interval
}

function formatTime(time: Time): Time<string> {
  const { days, hours, minutes, seconds } = time
  return {
    days: padStart(days),
    hours: padStart(hours),
    minutes: padStart(minutes),
    seconds: padStart(seconds),
    milliseconds: padStart(time.milliseconds, 3),
  }
}

function validateProps(props: Partial<TimerProps>) {
  const { startMs, targetMs, countdown, interval } = props

  // Validate interval
  if (interval != null && (typeof interval !== "number" || interval <= 0)) {
    throw new Error(`[timer] Invalid interval: ${interval}. Must be a positive number.`)
  }

  // Validate startMs
  if (startMs != null && (typeof startMs !== "number" || startMs < 0)) {
    throw new Error(`[timer] Invalid startMs: ${startMs}. Must be a non-negative number.`)
  }

  // Validate targetMs
  if (targetMs != null && (typeof targetMs !== "number" || targetMs < 0)) {
    throw new Error(`[timer] Invalid targetMs: ${targetMs}. Must be a non-negative number.`)
  }

  // Validate countdown timer configuration
  if (countdown && startMs != null && targetMs != null) {
    if (startMs <= targetMs) {
      throw new Error(
        `[timer] Invalid countdown configuration: startMs (${startMs}) must be greater than targetMs (${targetMs}).`,
      )
    }
  }

  // Validate stopwatch timer configuration
  if (!countdown && startMs != null && targetMs != null) {
    if (startMs >= targetMs) {
      throw new Error(
        `[timer] Invalid stopwatch configuration: startMs (${startMs}) must be less than targetMs (${targetMs}).`,
      )
    }
  }

  // Validate that countdown timers have a targetMs or it defaults to 0
  if (countdown && targetMs == null && startMs != null && startMs <= 0) {
    throw new Error(
      `[timer] Invalid countdown configuration: startMs (${startMs}) must be greater than 0 when no targetMs is provided.`,
    )
  }
}
