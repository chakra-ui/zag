import * as carousel from "@zag-js/carousel"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { HiChevronLeft, HiChevronRight } from "react-icons/hi"

const items = [
  "https://tinyurl.com/5b6ka8jd",
  "https://tinyurl.com/7rmccdn5",
  "https://tinyurl.com/59jxz9uu",
  "https://tinyurl.com/6jurv23t",
  "https://tinyurl.com/yp4rfum7",
]

export function Carousel(props: any) {
  const [state, send] = useMachine(carousel.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = carousel.connect(state, send, normalizeProps)

  return (
    <>
      <main className="carousel">
        <div {...api.getRootProps()}>
          <div {...api.getViewportProps()}>
            <div {...api.getItemGroupProps()}>
              {items.map((image, index) => (
                <div {...api.getItemProps({ index })} key={index}>
                  <img src={image} alt={`Slide Image ${index}`} />
                </div>
              ))}
            </div>

            <div data-scope="carousel" data-part="control">
              <button aria-label="Previous Slide" {...api.getPrevTriggerProps()}>
                <HiChevronLeft />
              </button>
              <div {...api.getIndicatorGroupProps()}>
                {items.map((_, index) => (
                  <button
                    key={index}
                    aria-label={`Goto slide ${index + 1}`}
                    {...api.getIndicatorProps({ index })}
                  />
                ))}
              </div>
              <button aria-label="Previous Slide" {...api.getNextTriggerProps()}>
                <HiChevronRight />
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
