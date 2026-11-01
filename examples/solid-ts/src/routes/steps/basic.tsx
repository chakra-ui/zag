import { normalizeProps, useMachine } from "@zag-js/solid"
import { stepsControls, stepsData } from "@zag-js/shared"
import * as steps from "@zag-js/steps"
import { createMemo, createUniqueId, Index } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"
import "@styles/steps.css"

export default function Page() {
  const controls = useControls(stepsControls)

  const service = useMachine(
    steps.machine,
    controls.mergeProps<steps.Props>({
      id: createUniqueId(),
      items: stepsData,
    }),
  )

  const api = createMemo(() => steps.connect(service, normalizeProps))

  return (
    <>
      <main class="steps">
        <div {...api().getRootProps()}>
          <div {...api().getListProps()}>
            <Index each={stepsData}>
              {(step, index) => (
                <div {...api().getItemProps({ value: step().value })}>
                  <button {...api().getTriggerProps({ value: step().value })}>
                    <div {...api().getIndicatorProps({ value: step().value })}>{index + 1}</div>
                    <span>{step().title}</span>
                  </button>
                  <div {...api().getSeparatorProps({ value: step().value })} />
                </div>
              )}
            </Index>
          </div>

          <Index each={stepsData}>
            {(step) => (
              <div {...api().getContentProps({ value: step().value })}>
                {step().title} - {step().description}
              </div>
            )}
          </Index>

          <div {...api().getContentProps({ value: steps.COMPLETE })}>
            Steps Complete - Thank you for filling out the form!
          </div>

          <div>
            <button {...api().getPreviousTriggerProps()}>Back</button>
            <button {...api().getSkipTriggerProps()}>Skip</button>
            <button {...api().getNextTriggerProps()}>Next</button>
          </div>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
