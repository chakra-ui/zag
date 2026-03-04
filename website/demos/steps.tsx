import * as steps from "@zag-js/steps"
import { useMachine, normalizeProps } from "@zag-js/react"
import { useId } from "react"
import styles from "../styles/machines/steps.module.css"

const stepsData = [
  { title: "Step 1" },
  { title: "Step 2" },
  { title: "Step 3" },
]

interface StepsProps extends Omit<steps.Props, "id" | "count"> {}

export function Steps(props: StepsProps) {
  const service = useMachine(steps.machine, {
    id: useId(),
    count: stepsData.length,
    ...props,
  })

  const api = steps.connect(service, normalizeProps)

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <div className={styles.List} {...api.getListProps()}>
        {stepsData.map((step, index) => (
          <div
            className={styles.Item}
            key={index}
            {...api.getItemProps({ index })}
          >
            <button
              className={styles.Trigger}
              {...api.getTriggerProps({ index })}
            >
              <div
                className={styles.Indicator}
                {...api.getIndicatorProps({ index })}
              >
                {index + 1}
              </div>
              <span>{step.title}</span>
            </button>
            <div
              className={styles.Separator}
              {...api.getSeparatorProps({ index })}
            />
          </div>
        ))}
      </div>

      {stepsData.map((step, index) => (
        <div
          className={styles.Content}
          key={index}
          {...api.getContentProps({ index })}
        >
          {step.title}
        </div>
      ))}

      <div
        className={styles.Content}
        {...api.getContentProps({ index: stepsData.length })}
      >
        Complete - Thank you 🎉
      </div>

      <div>
        <button className={styles.PrevTrigger} {...api.getPrevTriggerProps()}>
          Back
        </button>
        <button className={styles.NextTrigger} {...api.getNextTriggerProps()}>
          Next
        </button>
      </div>
    </div>
  )
}
