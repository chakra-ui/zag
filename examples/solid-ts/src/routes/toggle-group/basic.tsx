import styles from "../../../../../shared/src/css/toggle-group.module.css"
import { toggleGroupControls, toggleGroupData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import * as toggle from "@zag-js/toggle-group"
import { For, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const controls = useControls(toggleGroupControls)

  const service = useMachine(
    toggle.machine,
    controls.mergeProps<toggle.Props>({
      id: createUniqueId(),
    }),
  )

  const api = createMemo(() => toggle.connect(service, normalizeProps))

  return (
    <>
      <main class="toggle-group">
        <button>Outside</button>
        <div {...api().getRootProps()} class={styles.Root}>
          <For each={toggleGroupData}>
            {(item) => <button {...api().getItemProps({ value: item.value })} class={styles.Item}>{item.label}</button>}
          </For>
        </div>
      </main>

      <Toolbar controls={controls} viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
