import * as floating from "@zag-js/floating-panel"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import { LuArrowDownLeft, LuMaximize2, LuMinus, LuX } from "react-icons/lu"
import { useId } from "react"
import styles from "../styles/machines/floating-panel.module.css"

interface FloatingPanelProps extends Omit<floating.Props, "id"> {}

export function FloatingPanel(props: FloatingPanelProps) {
  const service = useMachine(floating.machine, {
    id: useId(),
    ...props,
  })

  const api = floating.connect(service, normalizeProps)

  return (
    <>
      <button className={styles.Trigger} {...api.getTriggerProps()}>
        Open Panel
      </button>
      {api.open && (
        <Portal>
          <div className={styles.Positioner} {...api.getPositionerProps()}>
            <div className={styles.Content} {...api.getContentProps()}>
              <div {...api.getDragTriggerProps()}>
                <div className={styles.Header} {...api.getHeaderProps()}>
                  <p className={styles.Title} {...api.getTitleProps()}>
                    Variables
                  </p>
                  <div className={styles.Control} {...api.getControlProps()}>
                    <button
                      {...api.getStageTriggerProps({ stage: "minimized" })}
                    >
                      <LuMinus />
                    </button>
                    <button
                      {...api.getStageTriggerProps({ stage: "maximized" })}
                    >
                      <LuMaximize2 />
                    </button>
                    <button {...api.getStageTriggerProps({ stage: "default" })}>
                      <LuArrowDownLeft />
                    </button>
                    <button {...api.getCloseTriggerProps()}>
                      <LuX />
                    </button>
                  </div>
                </div>
              </div>
              <div className={styles.Body} {...api.getBodyProps()}>
                <label>
                  <span>Font Family</span>
                  <select defaultValue="sans-serif">
                    <option value="sans-serif">Sans Serif</option>
                    <option value="serif">Serif</option>
                    <option value="monospace">Monospace</option>
                  </select>
                </label>

                <label>
                  <span>Font Size</span>
                  <input type="number" defaultValue={16} />
                </label>
              </div>

              <div
                className={styles.ResizeTrigger}
                {...api.getResizeTriggerProps({ axis: "n" })}
              />
              <div
                className={styles.ResizeTrigger}
                {...api.getResizeTriggerProps({ axis: "e" })}
              />
              <div
                className={styles.ResizeTrigger}
                {...api.getResizeTriggerProps({ axis: "w" })}
              />
              <div
                className={styles.ResizeTrigger}
                {...api.getResizeTriggerProps({ axis: "s" })}
              />
              <div
                className={styles.ResizeTrigger}
                {...api.getResizeTriggerProps({ axis: "ne" })}
              />
              <div
                className={styles.ResizeTrigger}
                {...api.getResizeTriggerProps({ axis: "se" })}
              />
              <div
                className={styles.ResizeTrigger}
                {...api.getResizeTriggerProps({ axis: "sw" })}
              />
              <div
                className={styles.ResizeTrigger}
                {...api.getResizeTriggerProps({ axis: "nw" })}
              />
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}
