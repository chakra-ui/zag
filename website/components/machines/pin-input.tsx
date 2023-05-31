import { HStack } from "styled-system/jsx"
import { panda } from "styled-system/jsx"
import * as pinInput from "@zag-js/pin-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { Button } from "components/button"
import { useId } from "react"

export function PinInput(props: any) {
  const [state, send] = useMachine(pinInput.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = pinInput.connect(state, send, normalizeProps)

  return (
    <div>
      <HStack mb="4" {...api.rootProps}>
        {[1, 2, 3].map((_, index) => (
          <panda.input
            bg="bg-subtle"
            borderWidth="1px"
            width="50px"
            height="50px"
            fontSize="lg"
            textAlign="center"
            key={index}
            {...api.getInputProps({ index })}
          />
        ))}
      </HStack>
      <Button
        borderWidth="1px"
        px="2"
        size="sm"
        variant="outline"
        onClick={api.clearValue}
      >
        Clear
      </Button>
    </div>
  )
}
