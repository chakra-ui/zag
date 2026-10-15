"use client"

import * as carousel from "@zag-js/carousel"
import { normalizeProps, useMachine } from "@zag-js/react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useId } from "react"
import "@styles/carousel.css"

const images = Array.from({ length: 8 }, (_, index) => `https://picsum.photos/seed/zag-gallery-${index}/800/500`)

export default function Page() {
  const mainService = useMachine(carousel.machine, {
    id: useId(),
    count: images.length,
    slidesPerPage: 1,
    onPageChange: (details) => thumbnails.scrollToIndex(details.page),
  })
  const main = carousel.connect(mainService, normalizeProps)

  const thumbnailService = useMachine(carousel.machine, {
    id: useId(),
    count: images.length,
    // The cut-off sixth thumbnail shows the strip scrolls
    slidesPerPage: 5.5,
    spacing: "8px",
  })
  const thumbnails = carousel.connect(thumbnailService, normalizeProps)

  return (
    <main>
      <div className="carousel">
        <div {...main.getRootProps()}>
          <div {...main.getControlProps()}>
            <button {...main.getPrevTriggerProps()}>
              <ChevronLeftIcon />
            </button>
            <div {...main.getItemGroupProps()}>
              {images.map((src, index) => (
                <div {...main.getItemProps({ index })} key={index} className="carousel-photo">
                  <img src={src} alt={`Photo ${index + 1}`} />
                </div>
              ))}
            </div>
            <button {...main.getNextTriggerProps()}>
              <ChevronRightIcon />
            </button>
          </div>

          <div {...thumbnails.getRootProps()} className="carousel-thumbnails">
            <div {...thumbnails.getItemGroupProps()}>
              {images.map((src, index) => (
                <div
                  {...thumbnails.getItemProps({ index })}
                  key={index}
                  data-selected={main.page === index || undefined}
                  onClick={() => main.scrollToIndex(index)}
                >
                  <img src={src} alt="" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
