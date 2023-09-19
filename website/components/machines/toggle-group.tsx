import { HStack } from "@chakra-ui/layout"
import { chakra } from "@chakra-ui/system"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as toggle from "@zag-js/toggle-group"
import { useId } from "react"
import { RxFontBold, RxFontItalic, RxUnderline } from "react-icons/rx"

type Props = {
  controls: {
    disabled: boolean
    multiple: boolean
  }
}

const Button = chakra("button", {
  baseStyle: {
    width: "10",
    height: "10",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bg: "bg-subtle",
    borderWidth: "1px",
    fontSize: "xl",
    "&[data-state=on]": {
      bg: "bg-primary-bold",
      color: "text-inverse",
    },
    "&[data-disabled]": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },
})

export function ToggleGroup(props: Props) {
  const [state, send] = useMachine(toggle.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = toggle.connect(state, send, normalizeProps)

  return (
    <div>
      <HStack spacing="0" mt="10" {...api.rootProps}>
        <Button {...api.getItemProps({ value: "bold" })}>
          <RxFontBold />
        </Button>
        <Button {...api.getItemProps({ value: "italic" })}>
          <RxFontItalic />
        </Button>
        <Button {...api.getItemProps({ value: "underline" })}>
          <RxUnderline />
        </Button>
      </HStack>
    </div>
  )
}
