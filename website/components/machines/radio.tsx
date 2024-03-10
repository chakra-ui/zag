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
    name: string
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
    <div {...api.rootProps}>
      <h2 {...api.labelProps}>Fruits</h2>
      <div>
        {items.map((opt) => (
          <label key={opt.id} {...api.getItemProps({ value: opt.id })}>
            <span {...api.getItemTextProps({ value: opt.id })}>
              {opt.label}
            </span>
            <input
              data-peer=""
              {...api.getItemHiddenInputProps({ value: opt.id })}
            />
            <chakra.div
              order="1"
              boxSize="25px"
              rounded="full"
              border="solid 2px"
              borderColor="gray.400"
              color="white"
              p="px"
              {...api.getItemControlProps({ value: opt.id })}
            >
              {api.value === opt.id && (
                <svg
                  viewBox="0 0 24 24"
                  fill="currentcolor"
                  transform="scale(0.7)"
                >
                  <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                </svg>
              )}
            </chakra.div>
          </label>
        ))}
      </div>
    </div>
  )
}
