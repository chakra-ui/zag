import * as hoverCard from "@zag-js/hover-card"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import { useId } from "react"
import styles from "../styles/machines/hover-card.module.css"

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
        <img
          className={styles.TriggerImage}
          alt="Twitter"
          src="/favicon/apple-touch-icon.png"
        />
      </a>

      {api.open && (
        <Portal>
          <div {...api.getPositionerProps()}>
            <div className={styles.Content} {...api.getContentProps()}>
              <div className={styles.Arrow} {...api.getArrowProps()}>
                <div className={styles.ArrowTip} {...api.getArrowTipProps()} />
              </div>
              <div className={styles.CardWrapper}>
                <img
                  alt="Twitter"
                  src="/favicon/apple-touch-icon.png"
                  className={styles.Avatar}
                />

                <div className={styles.CardContent}>
                  <div className={styles.Header}>
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
                  <div className={styles.Stats}>
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
