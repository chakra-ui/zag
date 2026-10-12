import { createFilter } from "@zag-js/i18n-utils"
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/select.css"

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [search, setSearch] = createSignal("")

  const collection = createMemo(() =>
    select.collection({
      items: selectData.filter((item) => contains(item.label, search())),
    }),
  )

  const id = createUniqueId()
  const service = useMachine(select.machine, (): select.Props => ({
    id,
    collection: collection(),
    popupType: "dialog",
    onOpenChange(details) {
      if (!details.open) setSearch("")
    },
  }))

  const api = createMemo(() => select.connect(service, normalizeProps))

  return (
    <>
      <main class="select">
        <div {...api().getRootProps()}>
          <div {...api().getControlProps()}>
            <label {...api().getLabelProps()}>Country</label>
            <button {...api().getTriggerProps()}>
              <span>{api().valueAsString || "Select country"}</span>
              <span {...api().getIndicatorProps()}>▼</span>
            </button>
          </div>

          <Portal>
            <div {...api().getPositionerProps()}>
              <div {...api().getContentProps()}>
                <input
                  {...api().getInputProps()}
                  aria-label="Filter countries"
                  placeholder="Filter…"
                  value={search()}
                  onInput={(e) => setSearch(e.currentTarget.value)}
                />

                <div {...api().getListProps()}>
                  <For each={collection().items}>
                    {(item) => (
                      <div {...api().getItemProps({ item })}>
                        <span {...api().getItemTextProps({ item })}>{item.label}</span>
                        <span {...api().getItemIndicatorProps({ item })}>✓</span>
                      </div>
                    )}
                  </For>
                </div>

                <div {...api().getEmptyProps()}>{collection().size === 0 && `No matches for "${search()}"`}</div>

                <div data-select-footer="">
                  <span>
                    {collection().size} of {selectData.length}
                  </span>
                  <Show when={api().hasSelectedItems}>
                    <button type="button" onClick={() => api().clearValue()}>
                      Clear
                    </button>
                  </Show>
                </div>
              </div>
            </div>
          </Portal>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} omit={["collection"]} />
      </Toolbar>
    </>
  )
}
