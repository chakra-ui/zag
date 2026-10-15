"use client"

import * as carousel from "@zag-js/carousel"
import { normalizeProps, useMachine } from "@zag-js/react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useId, useState } from "react"
import "@styles/carousel.css"

export default function Page() {
  const [slides, setSlides] = useState([1, 2, 3, 4])

  const service = useMachine(carousel.machine, {
    id: useId(),
    count: slides.length,
    slidesPerPage: 2,
    spacing: "16px",
  })

  const api = carousel.connect(service, normalizeProps)

  return (
    <main>
      <div className="carousel">
        <div {...api.getRootProps()}>
          <div className="carousel-toolbar">
            <button onClick={() => setSlides((prev) => [...prev, Math.max(0, ...prev) + 1])}>Add slide</button>
            <button disabled={slides.length <= 1} onClick={() => setSlides((prev) => prev.slice(0, -1))}>
              Remove slide
            </button>
          </div>

          <div {...api.getControlProps()}>
            <button {...api.getPrevTriggerProps()}>
              <ChevronLeftIcon />
            </button>
            <div {...api.getItemGroupProps()}>
              {slides.map((slide, index) => (
                <div {...api.getItemProps({ index })} key={slide}>
                  <div className="carousel-card">{slide}</div>
                </div>
              ))}
            </div>
            <button {...api.getNextTriggerProps()}>
              <ChevronRightIcon />
            </button>
          </div>

          <div className="carousel-footer">
            <div {...api.getIndicatorGroupProps()}>
              {api.pageSnapPoints.map((_, index) => (
                <button {...api.getIndicatorProps({ index })} key={index} />
              ))}
            </div>
            <span {...api.getProgressTextProps()}>{api.getProgressText()}</span>
          </div>
        </div>
      </div>
    </main>
  )
}
