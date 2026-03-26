import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import * as React from "react"
import { HiX } from "react-icons/hi"
import { useId } from "react"
import styles from "../styles/machines/popover.module.css"

interface PopoverProps extends Omit<popover.Props, "id"> {}

export function Popover(props: PopoverProps) {
  const service = useMachine(popover.machine, {
    id: useId(),
    ...props,
  })

  const api = popover.connect(service, normalizeProps)

  const Wrapper = api.portalled ? Portal : React.Fragment

  return (
    <>
      <button className={styles.Trigger} {...api.getTriggerProps()}>
        Click me
      </button>
      <Wrapper>
        <div {...api.getPositionerProps()}>
          <div className={styles.Content} {...api.getContentProps()}>
            <div className={styles.Arrow} {...api.getArrowProps()}>
              <div className={styles.ArrowTip} {...api.getArrowTipProps()} />
            </div>

            <div className={styles.Body}>
              <div {...api.getTitleProps()}>
                <b>About Tabs</b>
              </div>
              <div {...api.getDescriptionProps()}>
                Tabs are used to organize and group content into sections that
                the user can navigate between.
              </div>
              <button className={styles.ActionButton}>Action Button</button>
            </div>
            <button
              className={styles.CloseTrigger}
              {...api.getCloseTriggerProps()}
            >
              <HiX />
            </button>
          </div>
        </div>
      </Wrapper>
    </>
  )
}
