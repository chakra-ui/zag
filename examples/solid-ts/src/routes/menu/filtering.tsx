import { createFilter } from "@zag-js/i18n-utils"
import * as menu from "@zag-js/menu"
import { menuFilterData } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { For, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/menu.css"

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [query, setQuery] = createSignal("")

  const service = useMachine(menu.machine, {
    id: createUniqueId(),
    composite: false,
    onOpenChange(details) {
      if (!details.open) setQuery("")
    },
  })

  const api = createMemo(() => menu.connect(service, normalizeProps))
  const items = createMemo(() => menuFilterData.actions.filter((item) => contains(item.label, query())))

  const inputProps = mergeProps(
    () => api().getInputProps(),
    () => ({
      value: query(),
      onInput: (event: InputEvent & { currentTarget: HTMLInputElement }) => setQuery(event.currentTarget.value),
    }),
  )

  return (
    <>
      <main>
        <div>
          <button data-testid="trigger" {...api().getTriggerProps()}>
            Actions
          </button>

          <Portal>
            <div {...api().getPositionerProps()}>
              <div data-testid="menu" {...api().getContentProps()}>
                <input
                  data-testid="input"
                  aria-label="Filter actions"
                  placeholder="Search actions..."
                  {...inputProps}
                />
                <Show when={items().length === 0}>
                  <div data-menu-empty="">No actions found</div>
                </Show>
                <div {...api().getListProps()}>
                  <For each={items()}>
                    {(item) => (
                      <div data-testid={item.value} {...api().getItemProps({ value: item.value })}>
                        {item.label}
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </div>
          </Portal>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
