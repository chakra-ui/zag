export interface RafIntervalOptions {
  startMs: number
  deltaMs: number
}

export function setRafInterval(callback: (options: RafIntervalOptions) => void, interval: number) {
  let start = performance.now()
  let handle: number

  function loop(now: number) {
    const delta = now - start

    if (delta >= interval) {
      start = interval > 0 ? now - (delta % interval) : now
      callback({ startMs: start, deltaMs: delta })
    }

    handle = requestAnimationFrame(loop)
  }

  handle = requestAnimationFrame(loop)
  return () => cancelAnimationFrame(handle)
}

export function setRafTimeout(callback: () => void, delay: number) {
  const start = performance.now()
  let handle: number

  function loop(now: number) {
    const delta = now - start

    if (delta >= delay) {
      callback()
      return
    }

    handle = requestAnimationFrame(loop)
  }

  handle = requestAnimationFrame(loop)
  return () => cancelAnimationFrame(handle)
}
