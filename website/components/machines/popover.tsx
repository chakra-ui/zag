import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import * as React from "react"
import { HiX } from "react-icons/hi"
import { useId } from "react"

export function Popover(props: any) {
  const [state, send] = useMachine(popover.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = popover.connect(state, send, normalizeProps)

  const Wrapper = api.portalled ? Portal : React.Fragment

  return (
    <div>
      <button {...api.triggerProps}>Click me</button>
      <Wrapper>
        <div {...api.positionerProps}>
          <div {...api.contentProps}>
            <div {...api.arrowProps}>
              <div {...api.arrowTipProps} />
            </div>

            <div>
              <div {...api.titleProps}>
                <b>About Tabs</b>
              </div>
              <div {...api.descriptionProps}>
                Tabs are used to organize and group content into sections that
                the user can navigate between.
              </div>
              <button>Action Button</button>
            </div>
            <button {...api.closeTriggerProps}>
              <HiX />
            </button>
          </div>
        </div>
      </Wrapper>
    </div>
  )
}
