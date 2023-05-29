import { Stack } from "@chakra-ui/layout"
import { chakra } from "@chakra-ui/system"
import * as radio from "@zag-js/radio-group"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

const items = [
  { id: "apple", label: "Apples" },
  { id: "orange", label: "Oranges" },
  { id: "mango", label: "Mangoes" },
]

type RadioProps = {
  controls: {
    readOnly: boolean
    disabled: boolean
  }
}

export function Radio(props: RadioProps) {
  const [state, send] = useMachine(
    radio.machine({ id: useId(), name: "fruits" }),
    {
      context: props.controls,
    },
  )

  const api = radio.connect(state, send, normalizeProps)

  return (
    <Stack gap="3" {...api.rootProps}>
      <h2 {...api.labelProps}>Fruits</h2>
      <Stack gap="2">
        {items.map((opt) => (
          <chakra.label
            display="flex"
            gap="2"
            userSelect="none"
            cursor="pointer"
            fontSize="16"
            _disabled={{
              cursor: "not-allowed",
              opacity: 0.4,
            }}
            _readOnly={{
              cursor: "default",
            }}
            key={opt.id}
            {...api.getRadioProps({ value: opt.id })}
          >
            <chakra.span
              order="2"
              {...api.getRadioLabelProps({ value: opt.id })}
            >
              {opt.label}
            </chakra.span>
            <input data-peer {...api.getRadioInputProps({ value: opt.id })} />
            <chakra.div
              order="1"
              data-testid={`control-${opt.id}`}
              boxSize="25px"
              rounded="full"
              border="solid 2px"
              borderColor="gray.400"
              color="white"
              p="px"
              _hover={{
                bg: "bg-subtle",
              }}
              _disabled={{
                bg: "gray.400",
                borderColor: "gray.400",
              }}
              _checked={{
                "&:not([data-disabled])": {
                  bg: "blue.500",
                  borderColor: "blue.500",
                },
              }}
              _peerFocusVisible={{
                outline: "2px solid royalblue",
              }}
              {...api.getRadioControlProps({ value: opt.id })}
            >
              {api.value === opt.id && (
                <chakra.svg
                  viewBox="0 0 24 24"
                  fill="currentcolor"
                  transform="scale(0.7)"
                >
                  <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                </chakra.svg>
              )}
            </chakra.div>
          </chakra.label>
        ))}
      </Stack>
    </Stack>
  )
}
