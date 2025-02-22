import * as zagSwitch from "@zag-js/switch"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { switchControls } from "@zag-js/shared"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const controls = useControls(switchControls)

  const service = useMachine(
    zagSwitch.machine,
    controls.mergeProps<zagSwitch.Props>({
      name: "switch",
      id: createUniqueId(),
    }),
  )

  const api = createMemo(() => zagSwitch.connect(service, normalizeProps))

  return (
    <>
      <main class="switch">
        <label {...api().getRootProps()}>
          <input {...api().getHiddenInputProps()} />
          <span {...api().getControlProps()}>
            <span {...api().getThumbProps()} />
          </span>
          <span {...api().getLabelProps()}>Feature is {api().checked ? "enabled" : "disabled"}</span>
        </label>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
