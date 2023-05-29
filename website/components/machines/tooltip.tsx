import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import * as tooltip from "@zag-js/tooltip"
import { chakra } from "@chakra-ui/system"
import { Button } from "components/button"
import { useId } from "react"

export function Tooltip(props) {
  const [state, send] = useMachine(tooltip.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = tooltip.connect(state, send, normalizeProps)

  return (
    <>
      <Button variant="green" size="sm" {...api.triggerProps}>
        Hover me
      </Button>
      <Portal>
        {api.isOpen && (
          <div {...api.positionerProps}>
            <chakra.div
              px="2"
              py="1"
              fontSize="sm"
              bg="gray.700"
              color="white"
              {...api.contentProps}
            >
              Tooltip
            </chakra.div>
          </div>
        )}
      </Portal>
    </>
  )
}
