import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as React from "react"
import { Portal } from "../components/portal"

function Popover({ children, nested, id }: any) {
  const [state, send] = useMachine(
    popover.machine({
      id,
    }),
    {
      context: {
        portalled: true,
        modal: false,
      },
    },
  )
  const api = popover.connect(state, send, normalizeProps)
  const Wrapper = api.portalled ? Portal : React.Fragment

  return (
    <>
      <div data-part="root">
        {!nested && <button data-testid="button-before">Button :before</button>}

        <button data-testid="popover-trigger" {...api.triggerProps}>
          {nested ? "Open Nested" : "Click me"}
        </button>

        {!nested && <div {...api.anchorProps}>anchor</div>}

        <Wrapper>
          <div {...api.positionerProps}>
            <div data-testid="popover-content" className="popover-content" {...api.contentProps}>
              <div {...api.arrowProps}>
                <div {...api.innerArrowProps} />
              </div>
              <div data-testid="popover-title" {...api.titleProps}>
                Popover Title
              </div>
              <div data-part="body" data-testid="popover-body">
                <a>Non-focusable Link</a>
                <a href="#" data-testid="focusable-link">
                  Focusable Link
                </a>
                <input data-testid="input" placeholder="input" />
                <button data-testid="popover-close-button" {...api.closeButtonProps}>
                  X
                </button>
                {children}
              </div>
            </div>
          </div>
        </Wrapper>
        {!nested && <span data-testid="plain-text">I am just text</span>}
        {!nested && <button data-testid="button-after">Button :after</button>}
      </div>
    </>
  )
}

export default function Page() {
  return (
    <>
      <main className="popover">
        <Popover id="p1">
          <Popover nested id="p2">
            <Popover nested id="p3" />
          </Popover>
        </Popover>
      </main>
    </>
  )
}
