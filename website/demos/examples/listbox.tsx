import * as listbox from "@zag-js/listbox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useMemo, useState } from "react"
import styles from "../../styles/machines/listbox.module.css"
import { Ghost, Log, Row, Stack, show } from "./shared"

interface Item {
  label: string
  value: string
}

const frameworks: Item[] = [
  { label: "React", value: "react" },
  { label: "Solid", value: "solid" },
  { label: "Svelte", value: "svelte" },
  { label: "Vue", value: "vue" },
  { label: "Preact", value: "preact" },
]

const defaultCollection = listbox.collection({ items: frameworks })

function useListbox(props: Partial<listbox.Props<any>> = {}) {
  const service = useMachine(listbox.machine, {
    id: useId(),
    collection: defaultCollection,
    ...props,
  })
  return listbox.connect(service, normalizeProps)
}

function Items(props: { api: listbox.Api }) {
  const { api } = props
  return (
    <>
      {api.collection.items.map((item) => (
        <div
          key={api.collection.getItemValue(item)}
          className={styles.Item}
          {...api.getItemProps({ item })}
        >
          <span className={styles.ItemText} {...api.getItemTextProps({ item })}>
            {api.collection.stringifyItem(item)}
          </span>
          <span
            className={styles.ItemIndicator}
            {...api.getItemIndicatorProps({ item })}
          >
            ✓
          </span>
        </div>
      ))}
    </>
  )
}

function List(props: {
  api: listbox.Api
  label?: string
  children?: React.ReactNode
}) {
  const { api } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <label className={styles.Label} {...api.getLabelProps()}>
        {props.label ?? "Framework"}
      </label>
      <div className={styles.Content} {...api.getContentProps()}>
        {props.children ?? (
          <div className={styles.List} {...api.getListProps()}>
            <Items api={api} />
          </div>
        )}
      </div>
    </div>
  )
}

export function ListboxInitialValue() {
  const api = useListbox({
    selectionMode: "multiple",
    defaultValue: ["react", "solid"],
  })
  return <List api={api} label="Frameworks" />
}

export function ListboxControlled() {
  const [value, setValue] = useState(["react", "vue"])
  const api = useListbox({
    selectionMode: "multiple",
    value,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <List api={api} label="Frameworks" />
      <Row>
        <Ghost onClick={() => setValue(["svelte"])}>Pick Svelte</Ghost>
        <Ghost onClick={() => setValue([])}>Clear</Ghost>
      </Row>
      <Log label="value" value={show(value)} />
    </Stack>
  )
}

export function ListboxControlledHighlight() {
  const [highlightedValue, setHighlightedValue] = useState<string | null>(
    "solid",
  )
  const api = useListbox({
    highlightedValue,
    onHighlightChange: (details) =>
      setHighlightedValue(details.highlightedValue),
  })
  return (
    <Stack>
      <List api={api} />
      <Row>
        <Ghost onClick={() => setHighlightedValue("preact")}>
          Highlight Preact
        </Ghost>
      </Row>
      <Log label="highlightedValue" value={show(highlightedValue)} />
    </Stack>
  )
}

export function ListboxFiltering() {
  const [search, setSearch] = useState("")
  const collection = useMemo(
    () =>
      listbox.collection({
        items: frameworks.filter((item) =>
          item.label.toLowerCase().startsWith(search.toLowerCase()),
        ),
      }),
    [search],
  )
  const api = useListbox({ collection, typeahead: false })
  return (
    <List api={api}>
      <input
        className={styles.Input}
        {...api.getInputProps({ autoHighlight: true })}
        placeholder="Filter…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <div className={styles.List} {...api.getListProps()}>
        <Items api={api} />
      </div>
      <div className={styles.Empty} {...api.getEmptyProps()}>
        {api.empty && "No matches"}
      </div>
    </List>
  )
}

export function ListboxMultiple() {
  const api = useListbox({ selectionMode: "multiple" })
  return (
    <Stack>
      <List api={api} label="Frameworks" />
      <Log label="value" value={show(api.value)} />
    </Stack>
  )
}

const modes = ["single", "multiple", "extended"] as const

export function ListboxSelectionModes() {
  const [mode, setMode] = useState<(typeof modes)[number]>("extended")
  const api = useListbox({ selectionMode: mode })
  return (
    <Stack>
      <Row>
        {modes.map((item) => (
          <Ghost
            key={item}
            aria-pressed={mode === item}
            onClick={() => {
              setMode(item)
              api.clearValue()
            }}
          >
            {item}
          </Ghost>
        ))}
      </Row>
      <List api={api} label="Frameworks" />
      <Log label="value" value={show(api.value)} />
    </Stack>
  )
}

export function ListboxSelectOnHighlight() {
  const api = useListbox({ selectOnHighlight: true })
  return (
    <Stack>
      <List api={api} />
      <Log label="value" value={show(api.value)} />
    </Stack>
  )
}

export function ListboxDisallowSelectAll() {
  const api = useListbox({ selectionMode: "multiple", disallowSelectAll: true })
  return (
    <Stack>
      <List api={api} label="Frameworks" />
      <Log label="value" value={show(api.value)} />
    </Stack>
  )
}

export function ListboxSelection() {
  const [value, setValue] = useState<string>()
  const api = useListbox({ onSelect: (details) => setValue(details.value) })
  return (
    <Stack>
      <List api={api} />
      <Log label="onSelect" value={show(value)} />
    </Stack>
  )
}

const withDisabled = listbox.collection({
  items: frameworks,
  isItemDisabled: (item) => item.value === "svelte",
})

export function ListboxDisabled() {
  const [disabled, setDisabled] = useState(false)
  const api = useListbox({ collection: withDisabled, disabled })
  return (
    <Stack>
      <List api={api} />
      <Ghost onClick={() => setDisabled((current) => !current)}>
        disabled: {String(disabled)}
      </Ghost>
    </Stack>
  )
}

const colors = listbox.gridCollection({
  items: [
    { label: "Red", value: "red" },
    { label: "Green", value: "green" },
    { label: "Blue", value: "blue" },
    { label: "Yellow", value: "yellow" },
    { label: "Purple", value: "purple" },
    { label: "Orange", value: "orange" },
  ],
  columnCount: 3,
})

export function ListboxGrid() {
  const api = useListbox({ collection: colors })
  return (
    <List api={api} label="Color">
      <div className={styles.Grid} {...api.getListProps()}>
        <Items api={api} />
      </div>
    </List>
  )
}

export function ListboxHorizontal() {
  const api = useListbox({ orientation: "horizontal" })
  return (
    <Stack>
      <List api={api} />
      <Log label="highlighted" value={show(api.highlightedValue)} />
    </Stack>
  )
}
