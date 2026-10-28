import { normalizeProps, useMachine } from "@zag-js/react"
import * as steps from "@zag-js/steps"
import { useId, useState } from "react"
import styles from "../../styles/machines/steps.module.css"
import { Ghost, Log, Row, Stack, show } from "./shared"

const baseItems: steps.StepItem[] = [
  { value: "shipping", title: "Shipping", description: "Where to send it" },
  { value: "payment", title: "Payment", description: "How you pay" },
  { value: "review", title: "Review", description: "Check and confirm" },
]

function useSteps(props: Partial<steps.Props> = {}) {
  const service = useMachine(steps.machine, {
    id: useId(),
    items: baseItems,
    ...props,
  })
  return steps.connect(service, normalizeProps)
}

interface ViewProps {
  api: steps.Api
  description?: boolean
  skip?: boolean
  content?: (item: steps.StepItem) => React.ReactNode
}

function View(props: ViewProps) {
  const { api } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <div className={styles.List} {...api.getListProps()}>
        {api.items.map((item, index) => (
          <div
            key={item.value}
            className={styles.Item}
            {...api.getItemProps({ value: item.value })}
          >
            <button
              className={styles.Trigger}
              {...api.getTriggerProps({ value: item.value })}
            >
              <div
                className={styles.Indicator}
                {...api.getIndicatorProps({ value: item.value })}
              >
                {api.getItemState({ value: item.value }).completed
                  ? "✓"
                  : index + 1}
              </div>
              <span className={styles.Label}>
                <span>{item.title}</span>
                {props.description && (
                  <span className={styles.Description}>{item.description}</span>
                )}
              </span>
            </button>
            <div
              className={styles.Separator}
              {...api.getSeparatorProps({ value: item.value })}
            />
          </div>
        ))}
      </div>

      <div className={styles.Panels}>
        {api.items.map((item) => (
          <div
            key={item.value}
            className={styles.Content}
            {...api.getContentProps({ value: item.value })}
          >
            {props.content?.(item) ?? `${item.title} details`}
          </div>
        ))}
        <div
          className={styles.Content}
          {...api.getContentProps({ value: steps.COMPLETE })}
        >
          All done. Your order is on its way.
        </div>

        <div className={styles.Actions}>
          <button
            className={styles.PrevTrigger}
            {...api.getPreviousTriggerProps()}
          >
            Back
          </button>
          {props.skip && (
            <button
              className={styles.SkipTrigger}
              {...api.getSkipTriggerProps()}
            >
              Skip
            </button>
          )}
          <button className={styles.NextTrigger} {...api.getNextTriggerProps()}>
            {api.index === api.count - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  )
}

export function StepsDefinition() {
  const api = useSteps()
  return <View api={api} description />
}

export function StepsRendering() {
  const api = useSteps()
  return (
    <Stack>
      <View api={api} />
      <Log
        label="progress"
        value={
          api.complete ? "complete" : `Step ${api.index + 1} of ${api.count}`
        }
      />
    </Stack>
  )
}

export function StepsInitialStep() {
  const api = useSteps({ defaultValue: "payment" })
  return <View api={api} />
}

export function StepsControlled() {
  const [value, setValue] = useState<string | undefined>("shipping")
  const api = useSteps({
    value,
    onValueChange: (details) => setValue(details.value ?? undefined),
  })
  return (
    <Stack>
      <Row>
        {baseItems.map((item) => (
          <Ghost key={item.value} onClick={() => setValue(item.value)}>
            {item.title}
          </Ghost>
        ))}
      </Row>
      <View api={api} />
      <Log label="value" value={show(value)} />
    </Stack>
  )
}

export function StepsCompletion() {
  const [done, setDone] = useState<string[] | null>(null)
  const api = useSteps({
    onComplete: (details) => setDone(details.completedValues),
  })
  return (
    <Stack>
      <View api={api} />
      <Log label="onComplete" value={show(done)} />
    </Stack>
  )
}

export function StepsCompletedValues() {
  const [completedValues, setCompletedValues] = useState<string[]>([])
  const api = useSteps({
    completedValues,
    onCompletedChange: (details) => setCompletedValues(details.completedValues),
  })
  return (
    <Stack>
      <View api={api} />
      <Row>
        <Log label="completedValues" value={show(completedValues)} />
        <Ghost onClick={() => setCompletedValues([])}>Clear</Ghost>
      </Row>
    </Stack>
  )
}

export function StepsLinear() {
  const api = useSteps({ linear: true })
  return <View api={api} />
}

export function StepsValidation() {
  const [name, setName] = useState("")
  const api = useSteps({
    items: [
      { value: "personal", title: "Personal", invalid: name.trim() === "" },
      { value: "review", title: "Review" },
    ],
  })
  return (
    <View
      api={api}
      content={(item) =>
        item.value === "personal" ? (
          <label className={styles.Field}>
            Name
            <input
              value={name}
              placeholder="Required to continue"
              onChange={(event) => setName(event.currentTarget.value)}
            />
          </label>
        ) : (
          `Hello, ${name}`
        )
      }
    />
  )
}

export function StepsBlocked() {
  const [blocked, setBlocked] = useState<steps.NavigationBlockedDetails>()
  const api = useSteps({
    linear: true,
    onNavigationBlocked: setBlocked,
  })
  return (
    <Stack>
      <View api={api} />
      <Row>
        <Ghost onClick={() => api.setValue("review")}>
          api.setValue("review")
        </Ghost>
        <Log
          label="blocked"
          value={
            blocked ? `${blocked.reason} by ${show(blocked.blockedBy)}` : "—"
          }
        />
      </Row>
    </Stack>
  )
}

export function StepsSkip() {
  const api = useSteps({
    items: [
      { value: "shipping", title: "Shipping" },
      { value: "gift-note", title: "Gift note", optional: true },
      { value: "review", title: "Review" },
    ],
  })
  return <View api={api} skip />
}

export function StepsLocked() {
  const api = useSteps({
    items: [
      { value: "shipping", title: "Shipping" },
      { value: "payment", title: "Payment", editable: false },
      { value: "review", title: "Review" },
    ],
  })
  return <View api={api} />
}

export function StepsVertical() {
  const api = useSteps({ orientation: "vertical" })
  return <View api={api} description />
}

export function StepsProgrammatic() {
  const api = useSteps()
  return (
    <Stack>
      <View api={api} />
      <Row>
        <Ghost onClick={() => api.setValue("review")}>setValue("review")</Ghost>
        <Ghost onClick={() => api.goToPreviousStep()}>goToPreviousStep()</Ghost>
        <Ghost onClick={() => api.goToNextStep()}>goToNextStep()</Ghost>
        <Ghost onClick={() => api.resetStep()}>resetStep()</Ghost>
      </Row>
    </Stack>
  )
}
