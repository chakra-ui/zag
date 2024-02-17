import { Stack } from "@chakra-ui/layout"
import { keyframes } from "@emotion/react"
import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/react"
import { Button } from "components/button"
import { useId } from "react"

type CollapsibleProps = {
  controls: {
    disabled: boolean
    dir: "ltr" | "rtl"
  }
}

const slideDown = keyframes({
  from: {
    height: 0,
    opacity: 0.01,
  },
  to: {
    height: "var(--height)",
    opacity: 1,
  },
})

const slideUp = keyframes({
  from: {
    height: "var(--height)",
    opacity: 1,
  },
  to: {
    height: 0,
    opacity: 0.01,
  },
})

export function Collapsible(props: CollapsibleProps) {
  const [state, send] = useMachine(collapsible.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = collapsible.connect(state, send, normalizeProps)

  return (
    <Stack width="400px" align="start" {...api.rootProps}>
      <Button size="sm" variant="green" {...api.triggerProps}>
        Click to Toggle
      </Button>
      <Stack
        overflow="hidden"
        {...api.contentProps}
        css={{
          "&[data-state=open]": {
            animation: `${slideDown} 110ms cubic-bezier(0, 0, 0.38, 0.9)`,
          },
          "&[data-state=closed]": {
            animation: `${slideUp} 110ms cubic-bezier(0, 0, 0.38, 0.9)`,
          },
        }}
      >
        <p>
          Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna sfsd. Ut enim ad minimdfd
          v eniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
          ea commodo consequat. Excepteur sint occaecat cupidatat non proident,
          sunt in culpa qui officia deserunt mollit anim id est laborum.{" "}
          <a href="#">Some Link</a>
        </p>
      </Stack>
    </Stack>
  )
}
