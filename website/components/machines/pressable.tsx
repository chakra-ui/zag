import { Stack } from "styled-system/jsx"
import { panda } from "styled-system/jsx"
import * as pressable from "@zag-js/pressable"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"

type PressableProps = {
  controls: {
    disabled: false
    preventFocusOnPress: false
    cancelOnPointerExit: false
    allowTextSelectionOnPress: false
  }
}

export function Pressable(props: PressableProps) {
  const [timesPressed, setTimesPressed] = useState(0)
  const [timesLongPressed, setTimesLongPressed] = useState(0)

  const [state, send] = useMachine(
    pressable.machine({
      id: useId(),
      onPress() {
        setTimesPressed((current) => current + 1)
      },
      onLongPress() {
        console.log("long press")
        setTimesLongPressed((current) => current + 1)
      },
    }),
    {
      context: props.controls,
    },
  )

  const api = pressable.connect(state, send, normalizeProps)

  return (
    <Stack gap="8" align="center">
      <panda.button
        {...api.pressableProps}
        px="4"
        py="3"
        w="28"
        borderWidth="1px"
        bg="bg-subtle"
        _pressed={{
          bg: "bg-bold",
        }}
        _hover={{
          opacity: 0.95,
        }}
        _disabled={{
          cursor: "not-allowed",
          opacity: 0.4,
        }}
        _focus={{
          outline: "solid 2px royalblue",
        }}
      >
        {api.isPressed ? "Pressed!" : "Press Me"}
      </panda.button>

      <Stack align="center">
        <p>
          Pressed {timesPressed} time{timesPressed !== 1 && "s"}
        </p>
        <p>
          Long Pressed {timesLongPressed} time{timesLongPressed !== 1 && "s"}
        </p>
      </Stack>
    </Stack>
  )
}
