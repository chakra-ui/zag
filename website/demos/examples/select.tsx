import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { useId, useMemo, useRef, useState } from "react"
import styles from "../../styles/machines/select.module.css"
import { Ghost, Log, Row, Stack, show } from "./shared"

interface Country {
  label: string
  value: string
  disabled?: boolean
}

const countries: Country[] = [
  { label: "Nigeria", value: "NG" },
  { label: "Japan", value: "JP" },
  { label: "Korea", value: "KO" },
  { label: "Kenya", value: "KE" },
  { label: "United Kingdom", value: "UK" },
]

const defaultCollection = select.collection({ items: countries })

function useSelect(props: Partial<select.Props<any>> = {}) {
  const service = useMachine(select.machine, {
    id: useId(),
    collection: defaultCollection,
    ...props,
  })
  return select.connect(service, normalizeProps)
}

function Control(props: { api: select.Api; label?: string }) {
  const { api } = props
  return (
    <>
      <label className={styles.Label} {...api.getLabelProps()}>
        {props.label ?? "Country"}
      </label>
      <div className={styles.Control} {...api.getControlProps()}>
        <button className={styles.Trigger} {...api.getTriggerProps()}>
          <span {...api.getValueTextProps()}>
            {api.valueAsString || "Select option"}
          </span>
          <span className={styles.Indicator} {...api.getIndicatorProps()}>
            ▾
          </span>
        </button>
      </div>
    </>
  )
}

function Item(props: { api: select.Api; item: select.CollectionItem }) {
  const { api, item } = props
  return (
    <div className={styles.Item} {...api.getItemProps({ item })}>
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
  )
}

function Field(props: {
  api: select.Api
  label?: string
  children?: React.ReactNode
}) {
  const { api } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <Control api={api} label={props.label} />
      <Portal>
        <div {...api.getPositionerProps()}>
          <div className={styles.Content} {...api.getContentProps()}>
            {props.children ?? (
              <div {...api.getListProps()}>
                {api.collection.items.map((item) => (
                  <Item
                    key={api.collection.getItemValue(item)}
                    api={api}
                    item={item}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Portal>
    </div>
  )
}

function Groups(props: { api: select.Api }) {
  const { api } = props
  return (
    <>
      {api.collection.group().map(([group, items]) => (
        <div key={group} {...api.getItemGroupProps({ id: group })}>
          <div
            className={styles.GroupLabel}
            {...api.getItemGroupLabelProps({ htmlFor: group })}
          >
            {group}
          </div>
          {items.map((item) => (
            <Item
              key={api.collection.getItemValue(item)}
              api={api}
              item={item}
            />
          ))}
        </div>
      ))}
    </>
  )
}

export function SelectInitialValue() {
  const api = useSelect({ defaultValue: ["NG"] })
  return <Field api={api} />
}

export function SelectMultiple() {
  const api = useSelect({ multiple: true })
  return (
    <Stack>
      <Field api={api} label="Countries" />
      <Log label="value" value={show(api.value)} />
    </Stack>
  )
}

export function SelectControlled() {
  const [value, setValue] = useState<string[]>(["JP"])
  const api = useSelect({
    value,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <Field api={api} />
      <Row>
        <Ghost onClick={() => setValue(["KE"])}>Pick Kenya</Ghost>
        <Ghost onClick={() => setValue([])}>Clear</Ghost>
      </Row>
      <Log label="value" value={show(value)} />
    </Stack>
  )
}

interface Fruit {
  id: number
  fruit: string
  available: boolean
  quantity: number
}

const fruits = select.collection<Fruit>({
  items: [
    { id: 1, fruit: "Banana", available: true, quantity: 10 },
    { id: 2, fruit: "Apple", available: false, quantity: 5 },
    { id: 3, fruit: "Orange", available: true, quantity: 3 },
    { id: 4, fruit: "Mango", available: true, quantity: 0 },
    { id: 5, fruit: "Grape", available: false, quantity: 8 },
  ],
  itemToString: (item) => item.fruit,
  itemToValue: (item) => String(item.id),
  isItemDisabled: (item) => !item.available || item.quantity === 0,
  groupBy: (item) => (item.available ? "available" : "unavailable"),
  groupSort: ["available", "unavailable"],
})

export function SelectCustomObject() {
  const api = useSelect({ collection: fruits })
  return (
    <Stack>
      <Field api={api} label="Fruit">
        <div {...api.getListProps()}>
          <Groups api={api} />
        </div>
      </Field>
      <Log label="value" value={show(api.value)} />
    </Stack>
  )
}

const withDisabled = select.collection<Country>({
  items: countries.map((item) => ({
    ...item,
    disabled: item.value === "JP" || item.value === "KE",
  })),
  isItemDisabled: (item) => !!item.disabled,
})

export function SelectDisabledItem() {
  const api = useSelect({ collection: withDisabled })
  return <Field api={api} />
}

export function SelectKeepOpen() {
  const api = useSelect({ closeOnSelect: false, multiple: true })
  return (
    <Stack>
      <Field api={api} label="Countries" />
      <Log label="value" value={show(api.value)} />
    </Stack>
  )
}

export function SelectProgrammatic() {
  const api = useSelect({ multiple: true })
  return (
    <Stack>
      <Field api={api} label="Countries" />
      <Row>
        <Ghost onClick={() => api.selectValue("NG")}>selectValue</Ghost>
        <Ghost onClick={() => api.setValue(["NG", "KE"])}>setValue</Ghost>
        <Ghost onClick={() => api.clearValue()}>clearValue</Ghost>
      </Row>
      <Log label="value" value={show(api.value)} />
    </Stack>
  )
}

export function SelectControlledOpen() {
  const [open, setOpen] = useState(false)
  const api = useSelect({
    open,
    onOpenChange: (details) => setOpen(details.open),
  })
  return (
    <Stack>
      <Field api={api} />
      <Ghost onClick={() => setOpen((current) => !current)}>
        {open ? "Close" : "Open"} from outside
      </Ghost>
    </Stack>
  )
}

export function SelectControlledHighlight() {
  const [highlightedValue, setHighlightedValue] = useState<string | null>(null)
  const api = useSelect({
    highlightedValue,
    onHighlightChange: (details) =>
      setHighlightedValue(details.highlightedValue),
  })
  return (
    <Stack>
      <Field api={api} />
      <Row>
        <Ghost
          onClick={() => {
            api.setOpen(true)
            setHighlightedValue("KE")
          }}
        >
          Highlight Kenya
        </Ghost>
      </Row>
      <Log label="highlighted" value={show(highlightedValue)} />
    </Stack>
  )
}

export function SelectPositioning() {
  const api = useSelect({ positioning: { placement: "right-start" } })
  return <Field api={api} />
}

export function SelectLoopFocus() {
  const api = useSelect({ loopFocus: true })
  return (
    <Stack>
      <Field api={api} />
      <Log label="highlighted" value={show(api.highlightedValue)} />
    </Stack>
  )
}

export function SelectDeselectable() {
  const api = useSelect({ deselectable: true, defaultValue: ["NG"] })
  return (
    <Stack>
      <Field api={api} />
      <Log label="value" value={show(api.value)} />
    </Stack>
  )
}

export function SelectHighlight() {
  const [value, setValue] = useState<unknown>(null)
  const api = useSelect({
    onHighlightChange: (details) =>
      setValue({
        highlightedValue: details.highlightedValue,
        highlightedIndex: details.highlightedIndex,
      }),
  })
  return (
    <Stack>
      <Field api={api} />
      <Log label="onHighlightChange" value={show(value)} />
    </Stack>
  )
}

export function SelectValueChange() {
  const [value, setValue] = useState<unknown>(null)
  const api = useSelect({
    onValueChange: (details) =>
      setValue({
        value: details.value,
        items: details.items.map((item) => item.label),
      }),
  })
  return (
    <Stack>
      <Field api={api} />
      <Log label="onValueChange" value={show(value)} />
    </Stack>
  )
}

export function SelectSelection() {
  const [value, setValue] = useState("—")
  const api = useSelect({ onSelect: (details) => setValue(details.value) })
  return (
    <Stack>
      <Field api={api} />
      <Log label="onSelect" value={value} />
    </Stack>
  )
}

export function SelectOpenChange() {
  const [open, setOpen] = useState(false)
  const api = useSelect({ onOpenChange: (details) => setOpen(details.open) })
  return (
    <Stack>
      <Field api={api} />
      <Log label="open" value={String(open)} />
    </Stack>
  )
}

const regions = select.collection({
  items: [
    { label: "Nigeria", value: "NG", group: "Africa" },
    { label: "Kenya", value: "KE", group: "Africa" },
    { label: "Japan", value: "JP", group: "Asia" },
    { label: "Korea", value: "KO", group: "Asia" },
    { label: "United Kingdom", value: "UK", group: "Europe" },
  ],
  groupBy: (item) => item.group,
})

export function SelectGroups() {
  const api = useSelect({ collection: regions })
  return (
    <Field api={api}>
      <div {...api.getListProps()}>
        <Groups api={api} />
      </div>
    </Field>
  )
}

function useSearchSelect(props: Partial<select.Props<Country>> = {}) {
  const [search, setSearch] = useState("")
  const collection = useMemo(
    () =>
      select.collection({
        items: countries.filter((item) =>
          item.label.toLowerCase().includes(search.toLowerCase()),
        ),
      }),
    [search],
  )
  const api = useSelect({
    collection,
    popupType: "dialog",
    onOpenChange(details) {
      if (!details.open) setSearch("")
    },
    ...props,
  })
  return { api, search, setSearch }
}

export function SelectComposition() {
  const { api, search, setSearch } = useSearchSelect()
  return (
    <Field api={api}>
      <input
        className={styles.Input}
        {...api.getInputProps()}
        aria-label="Filter countries"
        placeholder="Filter…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <div {...api.getListProps()}>
        {api.collection.items.map((item) => (
          <Item key={item.value} api={api} item={item} />
        ))}
      </div>
      <div className={styles.Footer}>
        {api.collection.size} of {countries.length}
      </div>
    </Field>
  )
}

export function SelectInitialFocus() {
  const inputRef = useRef<HTMLInputElement>(null)
  const { api, search, setSearch } = useSearchSelect({
    initialFocusEl: () => inputRef.current,
  })
  return (
    <Field api={api}>
      <input
        ref={inputRef}
        className={styles.Input}
        {...api.getInputProps()}
        aria-label="Filter countries"
        placeholder="Focused on open"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <div {...api.getListProps()}>
        {api.collection.items.map((item) => (
          <Item key={item.value} api={api} item={item} />
        ))}
      </div>
    </Field>
  )
}
