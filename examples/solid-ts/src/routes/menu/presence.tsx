import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { menuControls } from "@zag-js/shared"
import { Presence } from "~/components/presence"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const controls = useControls(menuControls)
  const service = useMachine(
    menu.machine,
    controls.mergeProps<menu.Props>({
      id: createUniqueId(),
      onSelect: console.log,
    }),
  )

  const api = createMemo(() => menu.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div>
          <button {...api().getTriggerProps()}>
            Actions <span {...api().getIndicatorProps()}>▾</span>
          </button>

          <Presence hidden={!api().open} lazyMount unmountOnExit>
            <div {...api().getPositionerProps()}>
              <ul {...api().getContentProps()}>
                <li {...api().getItemProps({ value: "edit" })}>Edit</li>
                <li {...api().getItemProps({ value: "duplicate" })}>Duplicate</li>
                <li {...api().getItemProps({ value: "delete" })}>Delete</li>
                <li {...api().getItemProps({ value: "export" })}>Export...</li>
              </ul>
            </div>
          </Presence>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
