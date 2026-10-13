import * as select from "@zag-js/select"
import { selectControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronsUpDownIcon, XIcon } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, For, onMount } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/select.css"

interface Pokemon {
  name: string
  url: string
}

export default function Page() {
  const controls = useControls(selectControls)

  const [items, setItems] = createSignal<Pokemon[]>([])

  onMount(async () => {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon`)
    const json = await res.json()
    setItems(json.results)
  })

  const collection = createMemo(() =>
    select.collection({
      items: items(),
      itemToString(item) {
        return item.name
      },
      itemToValue(item) {
        return item.name
      },
    }),
  )

  const id = createUniqueId()

  const service = useMachine(select.machine as select.Machine<Pokemon>, () => ({
    id,
    collection: collection(),
  }))

  const api = createMemo(() => select.connect(service, normalizeProps))

  return (
    <>
      <main class="select">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Label</label>
          <div {...api().getControlProps()}>
            <button {...api().getTriggerProps()}>
              <span>{api().hasSelectedItems ? api().valueAsString : "Select option"}</span>
            </button>
            <div class="select-indicator-group">
              <button {...api().getClearTriggerProps()}>
                <XIcon />
              </button>
              <span {...api().getIndicatorProps()}>
                <ChevronsUpDownIcon />
              </span>
            </div>
          </div>

          <Portal>
            <div {...api().getPositionerProps()}>
              <div {...api().getContentProps()}>
                <div {...api().getListProps()}>
                  <For each={items()}>
                    {(item) => (
                      <div {...api().getItemProps({ item })}>
                        <span {...api().getItemTextProps({ item })}>{item.name}</span>
                        <span {...api().getItemIndicatorProps({ item })}>✓</span>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </div>
          </Portal>
        </div>
      </main>

      <Toolbar controls={controls} viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
