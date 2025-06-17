import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import * as React from "react"
import { HiX } from "react-icons/hi"
import { useId } from "react"

interface PopoverProps extends Omit<popover.Props, "id"> {}

export function Popover(props: PopoverProps) {
  const service = useMachine(popover.machine, {
    id: useId(),
    ...props,
  })

  const api = popover.connect(service, normalizeProps)

  const Wrapper = api.portalled ? Portal : React.Fragment

  return (
    <div>
      <button {...api.getTriggerProps()}>Click me</button>
      <Wrapper>
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div {...api.getArrowProps()}>
              <div {...api.getArrowTipProps()} />
            </div>

            <div>
              <div {...api.getTitleProps()}>
                <b>About Tabs</b>
              </div>
              <div {...api.getDescriptionProps()}>
                Tabs are used to organize and group content into sections that
                the user can navigate between.
              </div>
              <button>Action Button</button>
            </div>
            <button {...api.getCloseTriggerProps()}>
              <HiX />
            </button>
          </div>
        </div>
      </Wrapper>
    </div>
  )
}
