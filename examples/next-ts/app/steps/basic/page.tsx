"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import { stepsControls, stepsData } from "@zag-js/shared"
import * as steps from "@zag-js/steps"
import { useId } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { useControls } from "@/hooks/use-controls"
import "@styles/steps.css"

export default function Page() {
  const controls = useControls(stepsControls)

  const service = useMachine(steps.machine, {
    id: useId(),
    items: stepsData,
    ...controls.context,
  })

  const api = steps.connect(service, normalizeProps)

  return (
    <>
      <main className="steps">
        <div {...api.getRootProps()}>
          <div {...api.getListProps()}>
            {stepsData.map((step, index) => {
              const itemState = api.getItemState({ value: step.value })
              return (
                <div key={step.value} {...api.getItemProps({ value: step.value })}>
                  <button {...api.getTriggerProps({ value: step.value })}>
                    <div {...api.getIndicatorProps({ value: step.value })}>{itemState.completed ? "✓" : index + 1}</div>
                    <span>{step.title}</span>
                  </button>
                  <div {...api.getSeparatorProps({ value: step.value })} />
                </div>
              )
            })}
          </div>

          {stepsData.map((step) => (
            <div key={step.value} {...api.getContentProps({ value: step.value })}>
              {step.title} - {step.description}
            </div>
          ))}

          <div {...api.getContentProps({ value: steps.COMPLETE })}>
            Steps Complete - Thank you for filling out the form!
          </div>

          <div>
            <button {...api.getPreviousTriggerProps()}>Back</button>
            <button {...api.getSkipTriggerProps()}>Skip</button>
            <button {...api.getNextTriggerProps()}>Next</button>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
