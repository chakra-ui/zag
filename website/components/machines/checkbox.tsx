import { chakra } from "@chakra-ui/system"
import * as checkbox from "@zag-js/checkbox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

type CheckboxProps = {
  controls: {
    indeterminate: boolean
    disabled: boolean
    readOnly: boolean
  }
}

export function Checkbox(props: CheckboxProps) {
  const [state, send] = useMachine(checkbox.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = checkbox.connect(state, send, normalizeProps)

  return (
    <div>
      <chakra.label
        display="flex"
        flexDirection="row-reverse"
        gap="2"
        userSelect="none"
        cursor="pointer"
        fontSize="18"
        _disabled={{
          cursor: "not-allowed",
          opacity: 0.4,
        }}
        _readOnly={{
          cursor: "default",
        }}
        {...api.rootProps}
      >
        <span {...api.labelProps}>Checkbox Input</span>
        <input data-peer {...api.inputProps} />
        <chakra.div
          boxSize="25px"
          rounded="md"
          border="solid 2px"
          borderColor="gray.400"
          color="white"
          _hover={{
            bg: "bg-bold",
          }}
          _disabled={{
            bg: "gray.400",
            borderColor: "gray.400",
          }}
          _indeterminate={{
            backgroundColor: "white",
            borderColor: "grey",
            color: "grey",
          }}
          _checked={{
            "&:not([data-indeterminate]):not([data-disabled])": {
              bg: "blue.500",
              borderColor: "blue.500",
            },
          }}
          _peerFocusVisible={{
            outline: "2px solid royalblue",
          }}
          {...api.controlProps}
        >
          {api.checkedState === true && (
            <chakra.svg
              viewBox="0 0 24 24"
              fill="currentcolor"
              transform="scale(0.7)"
            >
              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
            </chakra.svg>
          )}
          {api.checkedState === "indeterminate" && (
            <chakra.svg
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="4"
            >
              <line x1="21" x2="3" y1="12" y2="12" />
            </chakra.svg>
          )}
        </chakra.div>
      </chakra.label>
    </div>
  )
}
