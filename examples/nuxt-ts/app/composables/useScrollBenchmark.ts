export interface ScrollBenchmarkMetrics {
  totalTime: number
  scrollCount: number
  avgFrameTime: number
  minFrameTime: number
  maxFrameTime: number
  droppedFrames: number
}

const round = (value: number) => Math.round(value * 100) / 100

function runFrames(
  scrollCount: number,
  scrollTo: (offset: number) => void,
  scrollStep: number,
  onComplete: (metrics: ScrollBenchmarkMetrics) => void,
) {
  const frameTimes: number[] = []
  let lastTime = performance.now()
  let scrollsDone = 0

  function tick() {
    const now = performance.now()
    frameTimes.push(now - lastTime)
    lastTime = now

    if (scrollsDone < scrollCount) {
      scrollTo(scrollStep * scrollsDone)
      scrollsDone++
      requestAnimationFrame(tick)
      return
    }

    scrollTo(0)
    const totalTime = frameTimes.reduce((a, b) => a + b, 0)
    onComplete({
      totalTime: Math.round(totalTime),
      scrollCount,
      avgFrameTime: round(totalTime / frameTimes.length),
      minFrameTime: round(Math.min(...frameTimes)),
      maxFrameTime: round(Math.max(...frameTimes)),
      droppedFrames: frameTimes.filter((t) => t > 16.67).length,
    })
  }

  requestAnimationFrame(tick)
}

export function runScrollBenchmark(
  scrollEl: HTMLElement,
  scrollCount: number,
  onComplete: (metrics: ScrollBenchmarkMetrics) => void,
) {
  const scrollStep = (scrollEl.scrollHeight - scrollEl.clientHeight) / scrollCount
  runFrames(scrollCount, (offset) => (scrollEl.scrollTop = offset), scrollStep, onComplete)
}

export function runWindowScrollBenchmark(scrollCount: number, onComplete: (metrics: ScrollBenchmarkMetrics) => void) {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight
  if (maxScroll <= 0) return
  runFrames(scrollCount, (offset) => window.scrollTo(0, offset), maxScroll / scrollCount, onComplete)
}
