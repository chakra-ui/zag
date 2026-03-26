import styles from "../../../../shared/src/css/popover.module.css"
import * as popover from "@zag-js/popover"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as React from "react"

function Popover({ children, nested, id }: any) {
  const service = useMachine(popover.machine, {
    id,
    portalled: true,
    modal: false,
  })
  const api = popover.connect(service, normalizeProps)
  const Wrapper = api.portalled ? Portal : React.Fragment

  return (
    <>
      <div data-part="root">
        {!nested && <button data-testid="button-before">Button :before</button>}

        <button data-testid="popover-trigger" {...api.getTriggerProps()}>
          {nested ? "Open Nested" : "Click me"}
        </button>

        {!nested && <div {...api.getAnchorProps()}>anchor</div>}

        <Wrapper>
          <div {...api.getPositionerProps()} className={styles.Positioner}>
            <div data-testid="popover-content" className="popover-content" {...api.getContentProps()} className={styles.Content}>
              <div {...api.getArrowProps()} className={styles.Arrow}>
                <div {...api.getArrowTipProps()} />
              </div>
              <div data-testid="popover-title" {...api.getTitleProps()} className={styles.Title}>
                Popover Title
              </div>
              <div data-part="body" data-testid="popover-body">
                <a>Non-focusable Link</a>
                <a href="#" data-testid="focusable-link">
                  Focusable Link
                </a>
                <input data-testid="input" placeholder="input" />
                <button data-testid="popover-close-button" {...api.getCloseTriggerProps()} className={styles.CloseTrigger}>
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
