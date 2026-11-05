import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as menu from "@zag-js/menu"
import * as toolbar from "@zag-js/toolbar"
import { Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "@solidjs/web"
import { ChevronDownIcon } from "lucide-solid"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar as ControlsPanel } from "~/components/toolbar"
import "@styles/toolbar.css"
import "@styles/menu.css"

function MoreActionsMenu(props: { api: () => toolbar.Api }) {
  const id = createUniqueId()
  const triggerId = createMemo(() => props.api().getItemId("more"))

  const service = useMachine(menu.machine, () => ({
    id,
    ids: { trigger: triggerId() },
    onSelect: console.log,
  }))
  const menuApi = createMemo(() => menu.connect(service, normalizeProps))

  return (
    <>
      <button {...mergeProps(menuApi().getTriggerProps(), props.api().getItemProps({ value: "more" }))}>
        More actions
        <span {...menuApi().getIndicatorProps()}>
          <ChevronDownIcon />
        </span>
      </button>
      <Show when={menuApi().open}>
        <Portal>
          <div {...menuApi().getPositionerProps()}>
            <ul {...menuApi().getContentProps()}>
              <li {...menuApi().getItemProps({ value: "help" })}>Help</li>
              <li {...menuApi().getItemProps({ value: "shortcuts" })}>Keyboard Shortcuts</li>
              <li {...menuApi().getItemProps({ value: "release-notes" })}>Release Notes</li>
            </ul>
          </div>
        </Portal>
      </Show>
    </>
  )
}

export default function Page() {
  const service = useMachine(toolbar.machine, { id: createUniqueId() })
  const api = createMemo(() => toolbar.connect(service, normalizeProps))

  return (
    <>
      <main class="toolbar">
        <div {...api().getRootProps()}>
          <button {...api().getItemProps({ value: "cut" })}>Cut</button>
          <button {...api().getItemProps({ value: "copy" })}>Copy</button>
          <button {...api().getItemProps({ value: "paste" })}>Paste</button>

          <div {...api().getSeparatorProps()} />

          <MoreActionsMenu api={api} />
        </div>
        <p class="toolbar-note">
          Open the menu and use arrow keys — they navigate menu items, not the toolbar. Closing the menu returns roving
          focus to the toolbar.
        </p>
      </main>

      <ControlsPanel viz>
        <StateVisualizer state={service} />
      </ControlsPanel>
    </>
  )
}
