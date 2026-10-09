import { createFilter } from "@zag-js/i18n-utils"
import * as menu from "@zag-js/menu"
import { menuFilterData } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { type Accessor, For, Show, createMemo, createSignal, createUniqueId, onMount } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/menu.css"

const { contains } = createFilter({ sensitivity: "base" })

interface FolderSubmenuProps {
  id: string
  parentService: menu.Service
  parent: Accessor<menu.Api>
}

// Rendered only while its trigger matches the parent's query, so filtering the trigger out removes the submenu
function FolderSubmenu(props: FolderSubmenuProps) {
  const [query, setQuery] = createSignal("")

  const service = useMachine(menu.machine, {
    id: props.id,
    composite: false,
    onOpenChange(details) {
      if (!details.open) setQuery("")
    },
  })

  const api = createMemo(() => menu.connect(service, normalizeProps))
  const folders = createMemo(() => menuFilterData.folders.filter((item) => contains(item.label, query())))
  const triggerItemProps = createMemo(() => props.parent().getTriggerItemProps(api()))

  onMount(() => {
    props.parent().setChild(service)
    api().setParent(props.parentService)
  })

  const inputProps = mergeProps(
    () => api().getInputProps(),
    () => ({
      value: query(),
      onInput: (event: InputEvent & { currentTarget: HTMLInputElement }) => setQuery(event.currentTarget.value),
    }),
  )

  return (
    <>
      <div data-testid="move-to-folder" {...triggerItemProps()}>
        Move to folder →
      </div>
      <Portal>
        <div {...api().getPositionerProps()}>
          <div data-testid="folders-submenu" {...api().getContentProps()}>
            <input
              data-testid="folders-input"
              aria-label="Filter folders"
              placeholder="Search folders..."
              {...inputProps}
            />
            <Show when={folders().length === 0}>
              <div data-menu-empty="">No folders found</div>
            </Show>
            <div {...api().getListProps()}>
              <For each={folders()}>
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
    </>
  )
}

export default function Page() {
  const [query, setQuery] = createSignal("")
  const folderMenuId = createUniqueId()

  const service = useMachine(menu.machine, {
    id: createUniqueId(),
    composite: false,
    onOpenChange(details) {
      if (!details.open) setQuery("")
    },
  })

  const api = createMemo(() => menu.connect(service, normalizeProps))
  const actions = createMemo(() => menuFilterData.actions.filter((item) => contains(item.label, query())))
  const showMoveTo = createMemo(() => contains("Move to folder", query()))

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
            File
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
                <Show when={actions().length === 0 && !showMoveTo()}>
                  <div data-menu-empty="">No actions found</div>
                </Show>
                <div {...api().getListProps()}>
                  <For each={actions()}>
                    {(item) => (
                      <div data-testid={item.value} {...api().getItemProps({ value: item.value })}>
                        {item.label}
                      </div>
                    )}
                  </For>
                  <Show when={showMoveTo()}>
                    <FolderSubmenu id={folderMenuId} parentService={service} parent={api} />
                  </Show>
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
