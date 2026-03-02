import { Fragment, useId } from "react"
import * as popover from "@zag-js/popover"
import { useMachine, normalizeProps, Portal } from "@zag-js/react"

export default function Page() {
  return (
    <div className="App">
      <Popover />
    </div>
  )
}

const dataAttr = (el: HTMLElement, key: string, value: boolean) => {
  if (value) el.dataset[key] = ""
  else delete el.dataset[key]
}

const isMdDown = () => window.matchMedia("(max-width: 640px)").matches

export function Popover() {
  const service = useMachine(popover.machine, {
    id: useId(),
    positioning: {
      updatePosition({ updatePosition, floatingElement }) {
        const positionerEl = floatingElement as HTMLElement
        const contentEl = positionerEl.firstElementChild as HTMLElement

        dataAttr(positionerEl, "fullscreen", isMdDown())
        dataAttr(contentEl, "fullscreen", isMdDown())

        updatePosition()
      },
    },
  })

  const api = popover.connect(service, normalizeProps)

  const Wrapper = api.portalled ? Portal : Fragment

  return (
    <main>
      <button {...api.getTriggerProps()}>Click me</button>
      <Wrapper>
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div {...api.getTitleProps()}>Presenters</div>
            <div {...api.getDescriptionProps()}>Description</div>
            <button>Action Button</button>
            <button {...api.getCloseTriggerProps()}>X</button>
          </div>
        </div>
      </Wrapper>
    </main>
  )
}
