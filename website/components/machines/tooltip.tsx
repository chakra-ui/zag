import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import * as tooltip from "@zag-js/tooltip"
import { Button } from "components/button"
import { useId } from "react"
import { panda } from "styled-system/jsx"

type TooltipProps = {
  controls: {}
}
export function Tooltip(props: TooltipProps) {
  const [state, send] = useMachine(tooltip.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = tooltip.connect(state, send, normalizeProps)

  return (
    <>
      {/* @ts-expect-error */}
      <Button variant="green" size="sm" {...api.triggerProps}>
        Hover me
      </Button>
      <Portal>
        {api.isOpen && (
          <div {...api.positionerProps}>
            <panda.div
              px="2"
              py="1"
              fontSize="sm"
              bg="gray.700"
              color="white"
              {...api.contentProps}
            >
              Tooltip
            </panda.div>
          </div>
        )}
      </Portal>
    </>
  )
}
