function squareStepper(current: number, to: number) {
  const sign = Math.sign(to - current)
  const step = Math.sqrt(Math.abs(to - current))
  const next = current + step * sign
  if (sign > 0) return Math.min(to, next)
  return Math.max(to, next)
}

function step(from: number, to: number, stepper: Function, index: number) {
  let next = from
  for (let i = 0; i < index; i++) {
    next = stepper(next, to)
  }
  return next
}

interface Options {
  name: string
  value: number | string
  target: HTMLElement
  onEnd?: (done: boolean) => void
}

export function animator({ name, value, target, onEnd }: Options) {
  let rafId = -1

  const animate = (name: string, from: number, to: any, index: number, start = Date.now()) => {
    if (to === "100%" || typeof to === "number") {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        if (!target) return

        const toNumber = to === "100%" ? target.scrollHeight - target.offsetHeight : to
        let nextValue = step(from, toNumber, squareStepper, (Date.now() - start) / 5)

        if (Math.abs(toNumber - nextValue) < 1.5) {
          nextValue = toNumber
        }

        target[name] = nextValue

        if (toNumber === nextValue) {
          onEnd?.(true)
        } else {
          animate(name, from, to, index + 1, start)
        }
      })
    }
  }

  animate(name, target[name], value, 1)

  return () => {
    cancelAnimationFrame(rafId)
    onEnd?.(false)
  }
}
