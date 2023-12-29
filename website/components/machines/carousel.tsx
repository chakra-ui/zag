/* eslint-disable @next/next/no-img-element */
import { chakra } from "@chakra-ui/system"
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
        <chakra.div
          width="400px"
          borderWidth="2px"
          borderColor="border-subtle"
          {...api.rootProps}
        >
          <chakra.div overflowX="hidden" {...api.viewportProps}>
            <chakra.div {...api.itemGroupProps}>
              {items.map((image, index) => (
                <chakra.div {...api.getItemProps({ index })} key={index}>
                  <chakra.img
                    src={image}
                    alt={`Slide Image ${index}`}
                    height="250px"
                    width="100%"
                    objectFit="cover"
                  />
                </chakra.div>
              ))}
            </chakra.div>
            <chakra.div
              borderWidth="1px"
              borderColor="border-subtle"
              bg="bg-subtle"
              p="2"
              gap="2"
              display="flex"
              alignItems="center"
              position="absolute"
              left="40%"
            >
              <chakra.button
                aria-label="Previous Slide"
                _disabled={{ opacity: 0.5 }}
                {...api.prevTriggerProps}
              >
                <HiChevronLeft />
              </chakra.button>
              <chakra.div display="flex" gap="3" {...api.indicatorGroupProps}>
                {items.map((_, index) => (
                  <chakra.button
                    key={index}
                    width="2.5"
                    height="2.5"
                    borderRadius="full"
                    background="gray"
                    cursor="pointer"
                    aria-label={`Goto slide ${index + 1}`}
                    {...api.getIndicatorProps({ index })}
                  />
                ))}
              </chakra.div>
              <chakra.button
                aria-label="Previous Slide"
                _disabled={{ opacity: 0.5 }}
                {...api.nextTriggerProps}
              >
                <HiChevronRight />
              </chakra.button>
            </chakra.div>
          </chakra.div>
        </chakra.div>
      </main>

      <style suppressHydrationWarning>
        {`
        [data-scope="carousel"][data-part="indicator"][data-current] {
          background: var(--colors-bg-primary-bold);
        }
      `}
      </style>
    </>
  )
}
