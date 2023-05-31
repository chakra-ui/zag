import * as numberInput from "@zag-js/number-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { panda } from "styled-system/jsx"
import { BiChevronDown, BiChevronUp } from "react-icons/bi"
import { useId } from "react"

export function NumberInput(props: any) {
  const [state, send] = useMachine(
    numberInput.machine({ id: useId(), ...props.defaultContext }),
    {
      context: props.controls,
    },
  )

  const api = numberInput.connect(state, send, normalizeProps)

  return (
    <div {...api.rootProps}>
      <label {...api.labelProps}>Enter number:</label>
      <br />
      <panda.div position="relative" display="inline-block">
        <panda.input
          borderWidth="1px"
          height="10"
          pr="5"
          pl="3"
          bg="bg-subtle"
          borderColor="border-subtle"
          {...api.inputProps}
        />
        <panda.div
          display="flex"
          flexDirection="column"
          alignItems="center"
          position="absolute"
          width="6"
          right="3px"
          top="3px"
        >
          <panda.button
            width="full"
            bg="bg-bold"
            display="flex"
            justifyContent="center"
            _disabled={{ opacity: 0.5 }}
            {...api.incrementTriggerProps}
          >
            <BiChevronUp />
          </panda.button>
          <panda.button
            mt="2px"
            width="full"
            bg="bg-bold"
            display="flex"
            justifyContent="center"
            _disabled={{ opacity: 0.5 }}
            {...api.decrementTriggerProps}
          >
            <BiChevronDown />
          </panda.button>
        </panda.div>
      </panda.div>
    </div>
  )
}
