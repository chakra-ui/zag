import styles from "../../../../../shared/src/css/steps.module.css"
import { stepsControls, stepsData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import * as steps from "@zag-js/steps"
import { createMemo, createUniqueId, Index } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

export default function Page() {
  const controls = useControls(stepsControls)

  const service = useMachine(
    steps.machine,
    controls.mergeProps<steps.Props>({
      id: createUniqueId(),
      count: stepsData.length,
    }),
  )

  const api = createMemo(() => steps.connect(service, normalizeProps))

  return (
    <>
      <main class="steps">
        <div {...api().getRootProps()} class={styles.Root}>
          <div {...api().getListProps()} class={styles.List}>
            <Index each={stepsData}>
              {(step, index) => (
                <div {...api().getItemProps({ index })} class={styles.Item}>
                  <button {...api().getTriggerProps({ index })} class={styles.Trigger}>
                    <div {...api().getIndicatorProps({ index })} class={styles.Indicator}>{index + 1}</div>
                    <span>{step().title}</span>
                  </button>
                  <div {...api().getSeparatorProps({ index })} class={styles.Separator} />
                </div>
              )}
            </Index>
          </div>

          <Index each={stepsData}>
            {(step, index) => (
              <div {...api().getContentProps({ index })}>
                {step().title} - {step().description}
              </div>
            )}
          </Index>

          <div {...api().getContentProps({ index: stepsData.length })}>
            Steps Complete - Thank you for filling out the form!
          </div>

          <div>
            <button {...api().getPrevTriggerProps()}>Back</button>
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
