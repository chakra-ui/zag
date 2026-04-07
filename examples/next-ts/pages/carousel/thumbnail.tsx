import * as carousel from "@zag-js/carousel"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

const items = Array.from({ length: 10 }, (_, index) => index)

function useCarousel(props: Partial<carousel.Props> = {}) {
  const service = useMachine(carousel.machine, {
    id: useId(),
    count: items.length,
    ...props,
  })
  return carousel.connect(service, normalizeProps)
}

const THUMBNAIL_SLIDES_PER_PAGE = 6.75

export default function Page() {
  const mainApi = useCarousel({
    slidesPerPage: 1,
    onPageChange(details) {
      const index = Math.floor((details.page + 1) / THUMBNAIL_SLIDES_PER_PAGE)
      thumbnailApi.scrollTo(index)
    },
  })

  const thumbnailApi = useCarousel({
    slidesPerPage: THUMBNAIL_SLIDES_PER_PAGE,
    spacing: "12px",
  })

  return (
    <main>
      <div {...mainApi.getRootProps()}>
        <div {...mainApi.getControlProps()}>
          <button {...mainApi.getPrevTriggerProps()}>Prev</button>
          <button {...mainApi.getNextTriggerProps()}>Next</button>
        </div>
        <div {...mainApi.getItemGroupProps()}>
          {items.map((index) => (
            <div {...mainApi.getItemProps({ index })} key={index}>
              {index + 1}
            </div>
          ))}
        </div>
        <div {...thumbnailApi.getRootProps()}>
          <div {...thumbnailApi.getItemGroupProps()}>
            {items.map((index) => (
              <div {...thumbnailApi.getItemProps({ index })} key={index} onClick={() => mainApi.scrollToIndex(index)}>
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
