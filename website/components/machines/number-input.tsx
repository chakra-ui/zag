import * as numberInput from "@zag-js/number-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { chakra } from "@chakra-ui/system"
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
      <chakra.div position="relative" display="inline-block">
        <chakra.input
          borderWidth="1px"
          height="10"
          pr="5"
          pl="3"
          bg="bg-subtle"
          borderColor="border-subtle"
          {...api.inputProps}
        />
        <chakra.div
          display="flex"
          flexDirection="column"
          alignItems="center"
          position="absolute"
          width="6"
          right="3px"
          top="3px"
        >
          <chakra.button
            width="full"
            bg="bg-bold"
            display="flex"
            justifyContent="center"
            _disabled={{ opacity: 0.5 }}
            {...api.incrementTriggerProps}
          >
            <BiChevronUp />
          </chakra.button>
          <chakra.button
            mt="2px"
            width="full"
            bg="bg-bold"
            display="flex"
            justifyContent="center"
            _disabled={{ opacity: 0.5 }}
            {...api.decrementTriggerProps}
          >
            <BiChevronDown />
          </chakra.button>
        </chakra.div>
      </chakra.div>
    </div>
  )
}
