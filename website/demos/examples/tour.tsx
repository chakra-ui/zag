import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as tour from "@zag-js/tour"
import { useId, useState } from "react"
import { HiX } from "react-icons/hi"
import { Presence } from "../../components/docs/presence"
import styles from "../../styles/machines/tour.module.css"
import { Ghost, Log, Row, Stack, show } from "./shared"

const target = (name: string) => () =>
  document.querySelector<HTMLElement>(`[data-tour-target="${name}"]`)

function useTour(props: Partial<tour.Props> = {}) {
  const service = useMachine(tour.machine, { id: useId(), ...props })
  return tour.connect(service, normalizeProps)
}

function Target(props: { name: string; children: React.ReactNode }) {
  return (
    <span className={styles.Target} data-tour-target={props.name}>
      {props.children}
    </span>
  )
}

function Start(props: { api: tour.Api; label?: string }) {
  return (
    <button className={styles.Trigger} onClick={() => props.api.start()}>
      {props.label ?? "Start tour"}
    </button>
  )
}

function Step(props: {
  api: tour.Api
  header?: React.ReactNode
  present?: boolean
}) {
  const { api } = props
  const step = api.step
  if (!step) return null
  const body = (
    <>
      {step.arrow && (
        <div className={styles.Arrow} {...api.getArrowProps()}>
          <div {...api.getArrowTipProps()} />
        </div>
      )}
      {props.header ?? (
        <div className={styles.ProgressText} {...api.getProgressTextProps()}>
          {api.getProgressText()}
        </div>
      )}
      <p className={styles.Title} {...api.getTitleProps()}>
        {step.title}
      </p>
      <div className={styles.Description} {...api.getDescriptionProps()}>
        {step.description}
      </div>
      {step.actions && (
        <div className={styles.Actions}>
          {step.actions.map((action) => (
            <button
              key={action.label}
              className={styles.ActionTrigger}
              {...api.getActionTriggerProps({ action })}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
      <button className={styles.CloseTrigger} {...api.getCloseTriggerProps()}>
        <HiX />
      </button>
    </>
  )
  if (props.present === undefined) {
    return (
      <div className={styles.Content} {...api.getContentProps()}>
        {body}
      </div>
    )
  }
  return (
    <Presence
      present={props.present}
      className={styles.Content}
      {...api.getContentProps()}
    >
      {body}
    </Presence>
  )
}

function TourView(props: { api: tour.Api; header?: React.ReactNode }) {
  const { api } = props
  if (!api.step || !api.open) return null
  return (
    <Portal>
      {api.step.backdrop && (
        <div className={styles.Backdrop} {...api.getBackdropProps()} />
      )}
      <div className={styles.Spotlight} {...api.getSpotlightProps()} />
      <div className={styles.Positioner} {...api.getPositionerProps()}>
        <Step api={api} header={props.header} />
      </div>
    </Portal>
  )
}

const nav: tour.StepAction[] = [
  { label: "Back", action: "previous" },
  { label: "Next", action: "next" },
]

export function TourStepTypes() {
  const api = useTour({
    steps: [
      {
        id: "tooltip",
        type: "tooltip",
        placement: "top-start",
        target: target("types"),
        title: "Tooltip step",
        description: "Anchored to an element on the page.",
        actions: [{ label: "Next", action: "next" }],
      },
      {
        id: "dialog",
        type: "dialog",
        title: "Dialog step",
        description: "Centered on screen, with no target.",
        actions: nav,
      },
      {
        id: "floating",
        type: "floating",
        placement: "bottom-end",
        title: "Floating step",
        description: "Pinned to a corner of the viewport.",
        actions: [
          { label: "Back", action: "previous" },
          { label: "Done", action: "dismiss" },
        ],
      },
    ],
  })
  return (
    <Stack>
      <Target name="types">Target</Target>
      <Start api={api} />
      <TourView api={api} />
    </Stack>
  )
}

export function TourActions() {
  const [status, setStatus] = useState("—")
  const api = useTour({
    onStatusChange: (details) => setStatus(details.status),
    steps: [
      {
        id: "welcome",
        type: "dialog",
        title: "Welcome aboard",
        description: "Take a 10 second tour of the editor?",
        actions: [
          { label: "Skip", action: "skip" },
          { label: "Show me a tour!", action: "next" },
        ],
      },
      {
        id: "end",
        type: "dialog",
        title: "That's the tour",
        description: "Dismiss ends it for good.",
        actions: [{ label: "Dismiss", action: "dismiss" }],
      },
    ],
  })
  return (
    <Stack>
      <Start api={api} />
      <TourView api={api} />
      <Log label="status" value={status} />
    </Stack>
  )
}

export function TourPlacement() {
  const api = useTour({
    steps: [
      {
        id: "placement",
        type: "tooltip",
        placement: "top-start",
        target: target("placement"),
        title: "Top start",
        description: "This step sits above its target, aligned to the start.",
        actions: [{ label: "Done", action: "dismiss" }],
      },
    ],
  })
  return (
    <Stack>
      <Target name="placement">Target</Target>
      <Start api={api} />
      <TourView api={api} />
    </Stack>
  )
}

export function TourHideArrow() {
  const api = useTour({
    steps: [
      {
        id: "arrow",
        type: "tooltip",
        arrow: false,
        target: target("arrow"),
        title: "No arrow",
        description: "A tooltip step without the arrow.",
        actions: [{ label: "Done", action: "dismiss" }],
      },
    ],
  })
  return (
    <Stack>
      <Target name="arrow">Target</Target>
      <Start api={api} />
      <TourView api={api} />
    </Stack>
  )
}

export function TourHideBackdrop() {
  const api = useTour({
    steps: [
      {
        id: "backdrop",
        type: "dialog",
        backdrop: false,
        title: "No backdrop",
        description: "The page behind stays visible.",
        actions: [{ label: "Done", action: "dismiss" }],
      },
    ],
  })
  return (
    <Stack>
      <Start api={api} />
      <TourView api={api} />
    </Stack>
  )
}

export function TourEffects() {
  const api = useTour({
    steps: [
      {
        id: "effect",
        type: "tooltip",
        target: target("effect"),
        title: "Loading…",
        description: "",
        effect({ show, update }) {
          const timer = setTimeout(() => {
            update({
              title: "Loaded after 800ms",
              description:
                "The effect fetched data, updated the step, then showed it.",
            })
            show()
          }, 800)
          return () => clearTimeout(timer)
        },
        actions: [{ label: "Done", action: "dismiss" }],
      },
    ],
  })
  return (
    <Stack>
      <Target name="effect">Target</Target>
      <Start api={api} />
      <TourView api={api} />
    </Stack>
  )
}

export function TourWait() {
  const api = useTour({
    steps: [
      {
        id: "ask",
        type: "tooltip",
        target: target("wait"),
        title: "Click the button",
        description: "The tour waits until you click it.",
        actions: [{ label: "Got it", action: "next" }],
      },
      {
        id: "wait",
        type: "wait",
        title: "Waiting",
        description: "",
        effect({ next }) {
          const button = document.querySelector('[data-tour-target="wait"]')
          const listener = () => next()
          button?.addEventListener("click", listener)
          return () => button?.removeEventListener("click", listener)
        },
      },
      {
        id: "done",
        type: "dialog",
        title: "Nice click",
        description: "The wait step moved on by itself.",
        actions: [{ label: "Finish", action: "dismiss" }],
      },
    ],
  })
  return (
    <Stack>
      <button className={styles.Trigger} data-tour-target="wait">
        Click me
      </button>
      <Start api={api} />
      <TourView api={api} />
    </Stack>
  )
}

const threeSteps: tour.StepDetails[] = [
  {
    id: "one",
    type: "dialog",
    title: "Step one",
    description: "Every tour starts somewhere.",
    actions: [{ label: "Next", action: "next" }],
  },
  {
    id: "two",
    type: "dialog",
    title: "Step two",
    description: "Halfway there.",
    actions: nav,
  },
  {
    id: "three",
    type: "dialog",
    title: "Step three",
    description: "That's all of it.",
    actions: [
      { label: "Back", action: "previous" },
      { label: "Finish", action: "dismiss" },
    ],
  },
]

const openSteps = threeSteps.map((step) => ({ ...step, backdrop: false }))

export function TourProgress() {
  const api = useTour({ steps: threeSteps })
  return (
    <Stack>
      <Start api={api} />
      <TourView
        api={api}
        header={
          <div className={styles.Dots}>
            {Array.from({ length: api.totalSteps }, (_, index) => (
              <span
                key={index}
                className={styles.Dot}
                data-active={index <= api.stepIndex ? "" : undefined}
              />
            ))}
          </div>
        }
      />
      <Log
        label="getProgressPercent()"
        value={Math.round(api.getProgressPercent())}
      />
    </Stack>
  )
}

export function TourLifecycle() {
  const [step, setStep] = useState<tour.StepChangeDetails | null>(null)
  const [status, setStatus] = useState("—")
  const api = useTour({
    steps: threeSteps,
    onStepChange: setStep,
    onStatusChange: (details) => setStatus(details.status),
  })
  return (
    <Stack>
      <Start api={api} />
      <TourView api={api} />
      <Log
        label="onStepChange"
        value={
          step
            ? `${show(step.stepId)} · ${step.stepIndex + 1}/${step.totalSteps}`
            : "—"
        }
      />
      <Log label="onStatusChange" value={status} />
    </Stack>
  )
}

export function TourControlled() {
  const [stepId, setStepId] = useState<string | null>(null)
  const api = useTour({
    steps: openSteps,
    closeOnInteractOutside: false,
    stepId,
    onStepChange: (details) => setStepId(details.stepId),
  })
  return (
    <Stack>
      <Row>
        <Start api={api} />
        {threeSteps.map((step) => (
          <Ghost key={step.id} onClick={() => setStepId(step.id)}>
            Go to {step.id}
          </Ghost>
        ))}
      </Row>
      <TourView api={api} />
      <Log label="stepId" value={show(stepId)} />
    </Stack>
  )
}

export function TourProgrammatic() {
  const api = useTour({
    steps: openSteps,
    closeOnInteractOutside: false,
  })
  return (
    <Stack>
      <Row>
        <Ghost onClick={() => api.start()}>start()</Ghost>
        <Ghost onClick={() => api.setStep("two")}>setStep("two")</Ghost>
        <Ghost onClick={() => api.previous()}>previous()</Ghost>
        <Ghost onClick={() => api.next()}>next()</Ghost>
        <Ghost
          onClick={() => api.updateStep("two", { title: "Updated title" })}
        >
          updateStep()
        </Ghost>
      </Row>
      <TourView api={api} />
      <Log label="step" value={api.open ? show(api.step?.id) : "closed"} />
    </Stack>
  )
}

export function TourDismissBehavior() {
  const api = useTour({
    closeOnEscape: false,
    closeOnInteractOutside: false,
    preventInteraction: true,
    steps: [
      {
        id: "locked",
        type: "tooltip",
        target: target("dismiss"),
        title: "Locked in",
        description:
          "Esc and outside clicks do nothing. The page can't be clicked either.",
        actions: [{ label: "Done", action: "dismiss" }],
      },
    ],
  })
  return (
    <Stack>
      <Target name="dismiss">Target</Target>
      <Start api={api} />
      <TourView api={api} />
    </Stack>
  )
}

export function TourPresence() {
  const api = useTour({ steps: threeSteps })
  return (
    <Stack>
      <Start api={api} />
      {api.step && (
        <Portal>
          {api.open && (
            <div className={styles.Backdrop} {...api.getBackdropProps()} />
          )}
          <div className={styles.Positioner} {...api.getPositionerProps()}>
            <Step api={api} present={api.open} />
          </div>
        </Portal>
      )}
    </Stack>
  )
}
