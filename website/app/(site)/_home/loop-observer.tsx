"use client"

import { useEffect } from "react"

// Runs the illustration loops only while they're on screen
export function LoopObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) =>
          entry.target.toggleAttribute("data-playing", entry.isIntersecting),
        ),
      { threshold: 0.25 },
    )
    document
      .querySelectorAll("[data-loop]")
      .forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return null
}
