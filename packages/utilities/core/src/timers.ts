export interface TimerBaseContext {
  startMs: number
  deltaMs: number
}

interface TimerContext extends TimerBaseContext {
  now: number
}

export type TimerContextFn = (ctx: TimerContext) => boolean | void

const currentTime = () => performance.now()

export class Timer {
  private frameId: number | null = null
  private pausedAtMs: number | null = null
  private context: TimerContext

  constructor(private readonly onTick: TimerContextFn) {
    this.context = { now: 0, startMs: currentTime(), deltaMs: 0 }
  }

  private cancelFrame = () => {
    if (this.frameId === null) return
    cancelAnimationFrame(this.frameId)
    this.frameId = null
  }

  setStartMs = (startMs: number) => {
    this.context.startMs = startMs
  }

  get elapsedMs(): number {
    if (this.pausedAtMs !== null) {
      return this.pausedAtMs - this.context.startMs
    }
    return currentTime() - this.context.startMs
  }

  start = () => {
    if (this.frameId !== null) return

    const now = currentTime()
    if (this.pausedAtMs !== null) {
      this.context.startMs += now - this.pausedAtMs
      this.pausedAtMs = null
    } else {
      this.context.startMs = now
    }

    this.frameId = requestAnimationFrame(this.#tick)
  }

  pause = () => {
    if (this.frameId === null) return
    this.cancelFrame()
    this.pausedAtMs = currentTime()
  }

  stop = () => {
    if (this.frameId === null) return
    this.cancelFrame()
    this.pausedAtMs = null
  }

  #tick = (now: number) => {
    this.context.now = now
    this.context.deltaMs = now - this.context.startMs

    const shouldContinue = this.onTick(this.context)

    if (shouldContinue === false) {
      this.stop()
      return
    }

    this.frameId = requestAnimationFrame(this.#tick)
  }
}

export function setRafInterval(fn: (ctx: TimerBaseContext) => void, intervalMs: number) {
  const timer = new Timer(({ now, deltaMs }) => {
    if (deltaMs >= intervalMs) {
      const startMs = intervalMs > 0 ? now - (deltaMs % intervalMs) : now
      timer.setStartMs(startMs)
      fn({ startMs, deltaMs })
    }
  })

  timer.start()
  return () => timer.stop()
}

export function setRafTimeout(fn: () => void, delayMs: number) {
  const timer = new Timer(({ deltaMs }) => {
    if (deltaMs >= delayMs) {
      fn()
      return false
    }
  })

  timer.start()
  return () => timer.stop()
}
