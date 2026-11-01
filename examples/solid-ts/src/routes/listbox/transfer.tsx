import * as listbox from "@zag-js/listbox"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, For, Show, splitProps, type JSX } from "solid-js"
import "@styles/listbox.css"

interface Item {
  label: string
  value: string
}

type ListBoxProps = { label?: JSX.Element } & Omit<listbox.Props<Item>, "id">

function ListBox(props: ListBoxProps) {
  const [local, rest] = splitProps(props, ["label"])
  const id = createUniqueId()

  const service = useMachine(listbox.machine as listbox.Machine<Item>, (): listbox.Props<Item> => ({
    id,
    selectionMode: "multiple",
    ...rest,
  }))

  const api = createMemo(() => listbox.connect(service, normalizeProps))

  return (
    <div {...mergeProps(api().getRootProps(), { style: { flex: "1" } })}>
      <Show when={local.label}>
        <label {...api().getLabelProps()}>{local.label}</label>
      </Show>
      <div {...mergeProps(api().getContentProps(), { style: { width: "100%", height: "100%" } })}>
        <ul {...mergeProps(api().getListProps(), { style: { width: "100%", height: "100%" } })}>
          <For each={rest.collection.items}>
            {(item) => (
              <li {...api().getItemProps({ item })}>
                <span {...api().getItemTextProps({ item })}>{item.label}</span>
                <span {...api().getItemIndicatorProps({ item })}>✓</span>
              </li>
            )}
          </For>
        </ul>
      </div>
    </div>
  )
}

export default function Page() {
  const [source, setSource] = createSignal(
    listbox.collection<Item>({
      items: [
        { label: "Naruto", value: "naruto" },
        { label: "Sasuke", value: "sasuke" },
        { label: "Sakura", value: "sakura" },
        { label: "Kakashi", value: "kakashi" },
        { label: "Shisui", value: "shisui" },
      ],
    }),
  )

  const [target, setTarget] = createSignal(listbox.collection<Item>({ items: [] }))

  const [selectedSource, setSelectedSource] = createSignal<Item[]>([])
  const [selectedTarget, setSelectedTarget] = createSignal<Item[]>([])

  return (
    <main class="listbox">
      <div style={{ display: "flex", gap: "1rem", width: "100%" }}>
        <ListBox
          collection={source()}
          label="Source"
          value={selectedSource().map((item) => item.value)}
          onValueChange={(e) => setSelectedSource(e.items)}
        />
        <div style={{ display: "flex", "flex-direction": "column", gap: "1rem", "margin-top": "1rem" }}>
          <button
            onClick={() => {
              setSource(source().remove(...selectedSource()))
              setTarget(target().append(...selectedSource()))
              setSelectedSource([])
            }}
          >
            Move Right
          </button>
          <button
            onClick={() => {
              setSource(source().append(...selectedTarget()))
              setTarget(target().remove(...selectedTarget()))
              setSelectedTarget([])
            }}
          >
            Move Left
          </button>
        </div>
        <ListBox
          collection={target()}
          label="Target"
          value={selectedTarget().map((item) => item.value)}
          onValueChange={(e) => setSelectedTarget(e.items)}
        />
      </div>
    </main>
  )
}
