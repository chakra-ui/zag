import { toggleGroupControls, toggleGroupData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import * as toggle from "@zag-js/toggle-group"
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-solid"
import { For, createMemo, createUniqueId } from "solid-js"
import { Dynamic } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/toggle-group.css"

const icons = { bold: BoldIcon, italic: ItalicIcon, underline: UnderlineIcon }

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
        <div class="hstack gap-4">
          {/* Focus target outside the group, for tab order checks */}
          <button>Outside</button>
          <div {...api().getRootProps()}>
            <For each={toggleGroupData}>
              {(item) => (
                <button {...api().getItemProps({ value: item.value })} aria-label={item.value}>
                  <Dynamic component={icons[item.value as keyof typeof icons]} />
                </button>
              )}
            </For>
          </div>
        </div>
      </main>

      <Toolbar controls={controls} viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
