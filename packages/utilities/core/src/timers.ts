export function setRafInterval(callback: () => void, interval: number) {
  let start = performance.now()
  let handle: number

  function loop(now: number) {
    handle = requestAnimationFrame(loop)
    const delta = now - start

    if (delta >= interval) {
      start = now - (delta % interval)
      callback()
    }
  }

  handle = requestAnimationFrame(loop)
  return () => cancelAnimationFrame(handle)
}

export function setRafTimeout(callback: () => void, delay: number) {
  const start = performance.now()
  let handle: number

  function loop(now: number) {
    handle = requestAnimationFrame(loop)
    const delta = now - start

    if (delta >= delay) {
      callback()
    }
  }

  handle = requestAnimationFrame(loop)
  return () => cancelAnimationFrame(handle)
}
