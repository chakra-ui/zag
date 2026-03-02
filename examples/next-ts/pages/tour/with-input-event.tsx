import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as tour from "@zag-js/tour"
import { useId } from "react"

interface TourProps extends Omit<tour.Props, "id" | "steps"> {}

export default function Tour(props: TourProps) {
  const service = useMachine(tour.machine, {
    id: useId(),
    steps,
    ...props,
  })

  const api = tour.connect(service, normalizeProps)

  return (
    <main>
      <button className="tour-trigger" onClick={() => api.start()}>
        Start Tour
      </button>

      <div data-id="source" style={{ padding: "20px" }}>
        <h3>Source</h3>
        <p>This is the source code for the tour</p>
      </div>

      <div data-id="logic" style={{ padding: "20px" }}>
        <input type="text" style={{ border: "1px solid black", padding: "10px" }} />
      </div>

      {api.step && api.open && (
        <Portal>
          {api.step.backdrop && <div {...api.getBackdropProps()} />}
          <div {...api.getSpotlightProps()} />
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <button {...api.getCloseTriggerProps()}>X</button>

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
                    <button key={action.label} {...api.getActionTriggerProps({ action })}>
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Portal>
      )}
    </main>
  )
}

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
    effect({ next, show }) {
      show()
      const [promise, cleanup] = tour.waitForElementValue(
        () => document.querySelector("[data-id=logic] input"),
        "test",
        {
          timeout: 10000,
        },
      )
      promise.then(() => {
        cleanup()
        next()
      })
      return cleanup
    },
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
