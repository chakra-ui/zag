import { Stack } from "@chakra-ui/layout"
import { chakra } from "@chakra-ui/system"
import * as rating from "@zag-js/rating-group"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

function HalfStar() {
  return (
    <svg viewBox="0 0 273 260" data-part="star">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M135.977 214.086L52.1294 259.594L69.6031 165.229L0 99.1561L95.1465 86.614L135.977 1.04785V214.086Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M135.977 213.039L219.826 258.546L202.352 164.181L271.957 98.1082L176.808 85.5661L135.977 0V213.039Z"
        fill="#bdbdbd"
      />
    </svg>
  )
}

function Star() {
  return (
    <svg viewBox="0 0 273 260" data-part="star">
      <path
        d="M136.5 0L177.83 86.614L272.977 99.1561L203.374 165.229L220.847 259.594L136.5 213.815L52.1528 259.594L69.6265 165.229L0.0233917 99.1561L95.1699 86.614L136.5 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

type RadioProps = {
  controls: {
    allowHalf: boolean
    disabled: boolean
    readOnly: boolean
    max: number
  }
}

export function Rating(props: RadioProps) {
  const [state, send] = useMachine(
    rating.machine({
      id: useId(),
      name: "service",
      value: 2.5,
    }),
    {
      context: props.controls,
    },
  )

  const api = rating.connect(state, send, normalizeProps)

  return (
    <div>
      <Stack
        {...api.rootProps}
        _rtl={{
          '& [data-half] [data-part="star"]': {
            transform: "scale(-1, 1)",
          },
        }}
      >
        <label {...api.labelProps}>Rate Us:</label>
        <chakra.div {...api.controlProps} display="inline-flex">
          {api.sizeArray.map((index) => {
            const state = api.getRatingState({ index })
            return (
              <chakra.span
                key={index}
                {...api.getRatingProps({ index })}
                boxSize="8"
                p="1"
                sx={{
                  '[data-part="star"]': {
                    color: "#bdbdbd",
                  },
                }}
                _highlighted={{
                  '[data-part="star"]': {
                    color: "#ffb400",
                  },
                  _disabled: {
                    '[data-part="star"]': {
                      color: "#a1a1a1",
                    },
                  },
                }}
              >
                {state.isHalf ? <HalfStar /> : <Star />}
              </chakra.span>
            )
          })}
        </chakra.div>
        <input {...api.hiddenInputProps} />
      </Stack>
    </div>
  )
}
