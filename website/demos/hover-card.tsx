import * as hoverCard from "@zag-js/hover-card"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import { useId } from "react"

interface HoverCardProps extends Omit<hoverCard.Props, "id"> {}

export function HoverCard(props: HoverCardProps) {
  const service = useMachine(hoverCard.machine, {
    id: useId(),
    ...props,
  })

  const api = hoverCard.connect(service, normalizeProps)

  return (
    <div>
      <a
        href="https://twitter.com/zag_js"
        target="_blank"
        rel="noreferrer noopener"
        {...api.getTriggerProps()}
      >
        <img alt="Twitter" src="/favicon/apple-touch-icon.png" />
      </a>

      {api.open && (
        <Portal>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <div {...api.getArrowProps()}>
                <div {...api.getArrowTipProps()} />
              </div>
              <div className="card-wrapper">
                <img
                  alt="Twitter"
                  src="/favicon/apple-touch-icon.png"
                  className="avatar"
                />

                <div className="card-content">
                  <div className="header">
                    <span>Zag JS</span>
                    <span> @zag_js</span>
                  </div>
                  <p>
                    UI components powered by Finite State Machines. Created by{" "}
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
                      <span>2</span> <span>Following</span>
                    </div>
                    <div>
                      <span>4,000</span> <span>Followers</span>
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
