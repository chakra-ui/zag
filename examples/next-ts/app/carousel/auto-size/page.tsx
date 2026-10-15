"use client"

import * as carousel from "@zag-js/carousel"
import { normalizeProps, useMachine } from "@zag-js/react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useId } from "react"
import "@styles/carousel.css"

const photos = [
  { width: 300, height: 400 },
  { width: 600, height: 400 },
  { width: 400, height: 400 },
  { width: 320, height: 400 },
  { width: 640, height: 400 },
  { width: 400, height: 400 },
  { width: 300, height: 400 },
].map((size, index) => ({ ...size, src: `https://picsum.photos/seed/zag-strip-${index}/${size.width}/${size.height}` }))

export default function Page() {
  const photoService = useMachine(carousel.machine, {
    id: useId(),
    count: photos.length,
    autoSize: true,
    spacing: "8px",
    allowMouseDrag: true,
  })
  const photoApi = carousel.connect(photoService, normalizeProps)

  return (
    <main>
      <div className="carousel">
        <div {...photoApi.getRootProps()} className="carousel-strip">
          <div {...photoApi.getControlProps()}>
            <button {...photoApi.getPrevTriggerProps()}>
              <ChevronLeftIcon />
            </button>
            <div {...photoApi.getItemGroupProps()}>
              {photos.map((photo, index) => (
                <div {...photoApi.getItemProps({ index })} key={photo.src}>
                  <img src={photo.src} width={photo.width} height={photo.height} alt="" />
                </div>
              ))}
            </div>
            <button {...photoApi.getNextTriggerProps()}>
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
