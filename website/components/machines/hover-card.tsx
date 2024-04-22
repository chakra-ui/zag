import * as hoverCard from "@zag-js/hover-card"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import { useId } from "react"

type HoverCardProps = {
  controls: {
    openDelay: number
    closeDelay: number
  }
}

export function HoverCard(props: HoverCardProps) {
  const [state, send] = useMachine(hoverCard.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = hoverCard.connect(state, send, normalizeProps)

  return (
    <div>
      <a
        href="https://twitter.com/zag_js"
        target="_blank"
        rel="noreferrer noopener"
        {...api.triggerProps}
      >
        <img alt="Twitter" src="/favicon/apple-touch-icon.png" />
      </a>

      {api.open && (
        <Portal>
          <div {...api.positionerProps}>
            <div {...api.contentProps}>
              <div {...api.arrowProps}>
                <div {...api.arrowTipProps} />
              </div>
              <div className="card-wrapper">
                <img
                  alt="Twitter"
                  src="/favicon/apple-touch-icon.png"
                  className="avatar"
                />

                <div className="card-content">
                  <p className="header">
                    <p>Zag JS</p>
                    <p> @zag_js</p>
                  </p>
                  <p>
                    <p>UI components powered by Finite State Machines.</p>
                    Created by{" "}
                    <a
                      href="https://twitter.com/thesegunadebayo"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      @thesegunadebayo
                    </a>
                  </p>
                  <div className="stats">
                    <div>
                      <p>2</p> <p>Following</p>
                    </div>
                    <div>
                      <p>4,000</p> <p>Followers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
