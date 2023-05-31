import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import * as React from "react"
import { panda } from "styled-system/jsx"
import { Stack } from "styled-system/jsx"
import { HiX } from "react-icons/hi"
import { Button } from "components/button"
import { useId } from "react"

export function Popover(props: any) {
  const [state, send] = useMachine(popover.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = popover.connect(state, send, normalizeProps)

  const Wrapper = api.portalled ? Portal : React.Fragment

  return (
    <div>
      <Button size="sm" variant="green" {...api.triggerProps}>
        Click me
      </Button>
      <Wrapper>
        <div {...api.positionerProps}>
          <panda.div
            className="focus-outline"
            bg="bg-subtle"
            padding="4"
            borderWidth="1px"
            filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 15%))"
            zIndex="50"
            position="relative"
            maxW="min(calc(100vw - 16px), 320px)"
            width="full"
            {...api.contentProps}
          >
            <panda.div
              sx={{
                "--arrow-background": "bg-subtle",
                "--arrow-size": "8px",
              }}
              {...api.arrowProps}
            >
              <panda.div rounded="sm" {...api.arrowTipProps} />
            </panda.div>

            <Stack>
              <div {...api.titleProps}>
                <b>About Tabs</b>
              </div>
              <div {...api.descriptionProps}>
                Tabs are used to organize and group content into sections that
                the user can navigate between.
              </div>
              <panda.button
                className="focus-outline"
                bg="bg-subtle"
                px="4"
                py="2"
                borderWidth="1px"
              >
                Action Button
              </panda.button>
            </Stack>
            <panda.button
              position="absolute"
              top="3"
              right="3"
              padding="2"
              {...api.closeTriggerProps}
            >
              <HiX />
            </panda.button>
          </panda.div>
        </div>
      </Wrapper>
    </div>
  )
}
