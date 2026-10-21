import * as steps from "@zag-js/steps"
import { useMachine, normalizeProps } from "@zag-js/react"
import { useId } from "react"
import styles from "../styles/machines/steps.module.css"

const stepsData = [
  { value: "first", title: "Step 1" },
  { value: "second", title: "Step 2" },
  { value: "third", title: "Step 3" },
]

interface StepsProps extends Omit<steps.Props, "id" | "items"> {}

export function Steps(props: StepsProps) {
  const service = useMachine(steps.machine, {
    id: useId(),
    items: stepsData,
    ...props,
  })

  const api = steps.connect(service, normalizeProps)

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <div className={styles.List} {...api.getListProps()}>
        {stepsData.map((step, index) => (
          <div
            className={styles.Item}
            key={step.value}
            {...api.getItemProps({ value: step.value })}
          >
            <button
              className={styles.Trigger}
              {...api.getTriggerProps({ value: step.value })}
            >
              <div
                className={styles.Indicator}
                {...api.getIndicatorProps({ value: step.value })}
              >
                {index + 1}
              </div>
              <span>{step.title}</span>
            </button>
            <div
              className={styles.Separator}
              {...api.getSeparatorProps({ value: step.value })}
            />
          </div>
        ))}
      </div>

      {stepsData.map((step) => (
        <div
          className={styles.Content}
          key={step.value}
          {...api.getContentProps({ value: step.value })}
        >
          {step.title}
        </div>
      ))}

      <div
        className={styles.Content}
        {...api.getContentProps({ value: steps.COMPLETE })}
      >
        Complete - Thank you 🎉
      </div>

      <div>
        <button
          className={styles.PrevTrigger}
          {...api.getPreviousTriggerProps()}
        >
          Back
        </button>
        <button className={styles.NextTrigger} {...api.getNextTriggerProps()}>
          Next
        </button>
      </div>
    </div>
  )
}
