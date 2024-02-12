import { HStack, Stack } from "@chakra-ui/layout"
import { chakra } from "@chakra-ui/system"
import * as clipboard from "@zag-js/clipboard"
import { normalizeProps, useMachine } from "@zag-js/react"
import { Button } from "components/button"
import { useId } from "react"
import { HiCheck, HiOutlineClipboard } from "react-icons/hi"

type Props = {
  controls: {
    value: string
    timeout: number
  }
}

export function Clipboard(props: Props) {
  const [state, send] = useMachine(clipboard.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = clipboard.connect(state, send, normalizeProps)

  return (
    <Stack spacing="1" {...api.rootProps}>
      <chakra.label fontSize="sm" fontWeight="medium" {...api.labelProps}>
        Copy this link
      </chakra.label>
      <HStack align="stretch" {...api.controlProps}>
        <chakra.input
          borderWidth="1px"
          height="10"
          pr="5"
          pl="3"
          bg="bg-subtle"
          borderColor="border-subtle"
          {...api.inputProps}
        />
        <Button
          borderWidth="1px"
          px="3"
          size="sm"
          variant="outline"
          {...api.triggerProps}
        >
          {api.isCopied ? <HiCheck /> : <HiOutlineClipboard />}
        </Button>
      </HStack>
    </Stack>
  )
}
