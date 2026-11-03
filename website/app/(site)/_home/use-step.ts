"use client"

import { useEffect, useRef, useState } from "react"

// Advances a looping step counter on an interval while the element is on screen
export function useStep<T extends Element>(count: number, delay: number) {
  const ref = useRef<T>(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let timer: ReturnType<typeof setInterval> | undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        clearInterval(timer)
        if (!entry.isIntersecting) return
        timer = setInterval(() => setStep((s) => (s + 1) % count), delay)
      },
      { threshold: 0.25 },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      clearInterval(timer)
    }
  }, [count, delay])

  return [ref, step] as const
}
