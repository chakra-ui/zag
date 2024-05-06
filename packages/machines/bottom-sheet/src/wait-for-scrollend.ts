function observeScrolling(els: HTMLElement | HTMLElement[], callback: (done: boolean) => void) {
  const elements = Array.isArray(els) ? els : [els]

  let lastChangedFrame = 0
  let lastLeft = new Map()
  let lastTop = new Map()

  elements.forEach((element) => {
    lastLeft.set(element, element.scrollLeft)
    lastTop.set(element, element.scrollTop)
  })

  function tick(frames: number) {
    // We requestAnimationFrame either for 500 frames or until 20 frames with
    // no change have been observed.
    if (frames >= 500 || frames - lastChangedFrame > 20) {
      callback(true)
    } else {
      let scrollHappened = elements.some((element) => {
        return element.scrollLeft != lastLeft.get(element) || element.scrollTop != lastTop.get(element)
      })

      if (scrollHappened) {
        lastChangedFrame = frames
        elements.forEach((element) => {
          lastLeft.set(element, element.scrollLeft)
          lastTop.set(element, element.scrollTop)
        })
        callback(false)
      }

      requestAnimationFrame(tick.bind(null, frames + 1))
    }
  }
  tick(0)
}

export function waitForScrollEnd(elements: HTMLElement | HTMLElement[]) {
  return new Promise<void>((resolve) => {
    observeScrolling(elements, (done) => {
      if (done) resolve()
    })
  })
}
