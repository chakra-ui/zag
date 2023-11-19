interface TweenState {
  done: boolean
  value: number
}

type TweenCallback = (state: TweenState) => void

type Nullish = undefined | null

interface TweenOptions {
  from: number
  to: number
  duration: number
  delay?: number
  onUpdate: TweenCallback
  onComplete?: TweenCallback
}

export class Tween {
  onComplete: TweenCallback | Nullish
  onUpdate: TweenCallback | Nullish
  delay: number | Nullish
  duration: number
  from: number
  requestID: number | Nullish
  startTime: number
  timeoutID: any
  to: number

  constructor({ duration, from, to, delay, onUpdate, onComplete }: TweenOptions) {
    this.startTime = Date.now() + (delay || 0)
    this.duration = duration
    this.from = from
    this.to = to

    if (!onUpdate && !onComplete) {
      this.onComplete = undefined
      this.onUpdate = undefined
      this.timeoutID = undefined
      this.requestID = undefined
    } else {
      this.onComplete = onComplete
      this.onUpdate = onUpdate
    }
  }

  _frameCallback = () => {
    this.timeoutID = undefined
    this.requestID = undefined
    const current = Object.freeze(this.getCurrent())
    if (this.onUpdate) {
      this.onUpdate(current)
    }
    if (this.onComplete && current.done) {
      this.onComplete(current)
    }
    if (current.done) {
      this.onComplete = undefined
      this.onUpdate = undefined
    } else {
      this.requestID = requestAnimationFrame(this._frameCallback)
    }
  }

  start() {
    if (this.delay) {
      this.timeoutID = setTimeout(this._frameCallback, this.delay)
      this.requestID = undefined
    } else {
      this.requestID = requestAnimationFrame(this._frameCallback)
      this.timeoutID = undefined
    }

    return this.cancel
  }

  cancel() {
    if (this.timeoutID != null) {
      clearTimeout(this.timeoutID)
      this.timeoutID = undefined
    }
    if (this.requestID != null) {
      cancelAnimationFrame(this.requestID)
      this.requestID = undefined
    }
    this.onComplete = undefined
    this.onUpdate = undefined
  }

  getCurrent(): TweenState {
    const t = Date.now() - this.startTime
    if (t <= 0) {
      // still in the delay period
      return { done: false, value: this.from }
    }
    if (t >= this.duration) {
      // after the expiration
      return { done: true, value: this.to }
    }
    // mid-tween
    return {
      done: false,
      value: ease.easeOutQuint(t, this.from, this.to, this.duration),
    }
  }
}

const ease = {
  easeOutQuint: function (t: number, b: number, _c: number, d: number) {
    var c = _c - b
    return c * ((t = t / d - 1) * t * t * t * t + 1) + b
  },
}
