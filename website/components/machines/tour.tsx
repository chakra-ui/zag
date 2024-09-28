import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as tour from "@zag-js/tour"
import { useId } from "react"
import { HiX } from "react-icons/hi"

const steps: tour.StepDetails[] = [
  {
    type: "dialog",
    id: "start",
    title: "Ready to go for a ride",
    description: "Let's take the tour component for a ride and have some fun!",
    actions: [{ label: "Let's go!", action: "next" }],
  },
  {
    id: "logic",
    title: "Statechart",
    description:
      "As an engineer, you'll learn about the internal statechart that powers the tour. Don't worry, it's just a flow diagram.",
    target: () => document.querySelector("[data-id=logic]"),
    placement: "bottom",
    actions: [
      { label: "Prev", action: "prev" },
      { label: "Next", action: "next" },
    ],
  },
  {
    id: "source",
    title: "Github Source",
    description: "Here's the link to the github source of the Tour",
    target: () => document.querySelector("[data-id=source]"),
    placement: "bottom",
    actions: [
      { label: "Prev", action: "prev" },
      { label: "Next", action: "next" },
    ],
  },
  {
    type: "dialog",
    id: "end",
    title: "Amazing! You got to the end",
    description: "Like what you see? Now go ahead and use it in your project.",
    actions: [{ label: "Finish", action: "dismiss" }],
  },
]

export function Tour(props: any) {
  const context = props.controls

  const [state, send] = useMachine(tour.machine({ id: useId(), steps }), {
    context,
  })

  const api = tour.connect(state, send, normalizeProps)

  return (
    <>
      <button className="tour-trigger" onClick={() => api.start()}>
        Start Tour
      </button>
      {api.step && api.open && (
        <Portal>
          {api.step.backdrop && <div {...api.getBackdropProps()} />}
          <div {...api.getSpotlightProps()} />
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              {api.step.arrow && (
                <div {...api.getArrowProps()}>
                  <div {...api.getArrowTipProps()} />
                </div>
              )}

              <div {...api.getProgressTextProps()}>{api.getProgressText()}</div>

              <p {...api.getTitleProps()}>{api.step.title}</p>
              <div {...api.getDescriptionProps()}>{api.step.description}</div>

              {api.step.actions && (
                <div style={{ display: "flex", gap: "5px" }}>
                  {api.step.actions.map((action) => (
                    <button
                      key={action.label}
                      {...api.getActionTriggerProps({ action })}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              <button {...api.getCloseTriggerProps()}>
                <HiX />
              </button>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}
