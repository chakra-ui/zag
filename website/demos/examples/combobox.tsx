import * as combobox from "@zag-js/combobox"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId, useMemo, useState } from "react"
import styles from "../../styles/machines/combobox.module.css"
import { Ghost, Log, Row, Stack, show } from "./shared"

interface Country {
  label: string
  code: string
  disabled?: boolean
}

const countries: Country[] = [
  { label: "Nigeria", code: "NG" },
  { label: "Ghana", code: "GH" },
  { label: "Kenya", code: "KE" },
  { label: "Japan", code: "JP" },
  { label: "Canada", code: "CA" },
  { label: "United States", code: "US" },
  { label: "Australia", code: "AU" },
  { label: "Austria", code: "AT" },
  { label: "Malaysia", code: "MY" },
  { label: "Malta", code: "MT" },
  { label: "Togo", code: "TG" },
  { label: "Tunisia", code: "TN" },
]

const toCountries = (items: Country[]) =>
  combobox.collection({
    items,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
    isItemDisabled: (item) => !!item.disabled,
  })

const matches = (text: string, query: string) =>
  text.toLowerCase().includes(query.trim().toLowerCase())

interface Config<T> {
  items?: T[]
  toCollection?: (items: T[]) => combobox.Props<any>["collection"]
}

function useCombobox<T = Country>(
  props: Partial<combobox.Props<any>> = {},
  config: Config<T> = {},
) {
  const items = (config.items ?? countries) as T[]
  const create = config.toCollection ?? (toCountries as never)
  const [query, setQuery] = useState(props.defaultInputValue ?? "")
  const collection = useMemo(() => {
    const base = create(items)!
    return create(
      items.filter((item) => matches(base.stringifyItem(item) ?? "", query)),
    )
  }, [items, create, query])
  const service = useMachine(combobox.machine, {
    id: useId(),
    placeholder: "Type a country",
    ...props,
    collection,
    onInputValueChange(details) {
      setQuery(details.reason === "input-change" ? details.inputValue : "")
      props.onInputValueChange?.(details)
    },
  })
  return combobox.connect(service, normalizeProps)
}

function Control(props: { api: combobox.Api; label?: string }) {
  const { api } = props
  return (
    <>
      <label className={styles.Label} {...api.getLabelProps()}>
        {props.label ?? "Country"}
      </label>
      <div className={styles.Control} {...api.getControlProps()}>
        <input className={styles.Input} {...api.getInputProps()} />
        <button className={styles.ClearTrigger} {...api.getClearTriggerProps()}>
          ×
        </button>
        <button className={styles.Trigger} {...api.getTriggerProps()}>
          ▾
        </button>
      </div>
    </>
  )
}

function Items(props: { api: combobox.Api }) {
  const { api } = props
  return (
    <>
      <div className={styles.Empty} {...api.getEmptyProps()}>
        {api.collection.size === 0 && "No matches"}
      </div>
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

function Field(props: {
  api: combobox.Api
  label?: string
  children?: React.ReactNode
}) {
  const { api } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <Control api={api} label={props.label} />
      {props.children}
      <Portal>
        <div {...api.getPositionerProps()}>
          <div className={styles.Content} {...api.getContentProps()}>
            <Items api={api} />
          </div>
        </div>
      </Portal>
    </div>
  )
}

export function ComboboxInitialValue() {
  const api = useCombobox({ defaultValue: ["NG"] })
  return <Field api={api} />
}

export function ComboboxControlled() {
  const [value, setValue] = useState(["NG"])
  const api = useCombobox({
    value,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <Field api={api} />
      <Row>
        <Ghost onClick={() => setValue(["JP"])}>Pick Japan</Ghost>
        <Ghost onClick={() => setValue([])}>Clear</Ghost>
      </Row>
      <Log label="value" value={show(value)} />
    </Stack>
  )
}

export function ComboboxInitialInputValue() {
  const api = useCombobox({ defaultInputValue: "Ma" })
  return <Field api={api} />
}

export function ComboboxFiltering() {
  const [inputValue, setInputValue] = useState("")
  const api = useCombobox({
    inputValue,
    onInputValueChange: (details) => setInputValue(details.inputValue),
  })
  return (
    <Stack>
      <Field api={api} />
      <Log
        label="inputValue"
        value={`${show(inputValue)} · ${api.collection.size} options`}
      />
    </Stack>
  )
}

export function ComboboxMultiple() {
  const api = useCombobox({ multiple: true })
  return (
    <Stack>
      <Field api={api} label="Countries" />
      <Log label="value" value={show(api.value)} />
    </Stack>
  )
}

interface Fruit {
  id: number
  fruit: string
  available: boolean
  quantity: number
}

const fruits: Fruit[] = [
  { id: 1, fruit: "Banana", available: true, quantity: 10 },
  { id: 2, fruit: "Apple", available: false, quantity: 5 },
  { id: 3, fruit: "Orange", available: true, quantity: 3 },
  { id: 4, fruit: "Mango", available: true, quantity: 0 },
  { id: 5, fruit: "Pear", available: true, quantity: 7 },
]

const toFruits = (items: Fruit[]) =>
  combobox.collection({
    items,
    itemToString: (item) => item.fruit,
    itemToValue: (item) => String(item.id),
    isItemDisabled: (item) => !item.available || item.quantity === 0,
  })

export function ComboboxCustomObject() {
  const api = useCombobox(
    { placeholder: "Type a fruit" },
    { items: fruits, toCollection: toFruits },
  )
  return (
    <Stack>
      <Field api={api} label="Fruit" />
      <Log label="value" value={show(api.value)} />
    </Stack>
  )
}

export function ComboboxSelectedOutside() {
  const api = useCombobox({ selectionBehavior: "clear", multiple: true })
  return (
    <Field api={api} label="Countries">
      <div className={styles.Tags}>
        {api.selectedItems.map((item: Country) => (
          <span key={item.code} className={styles.Tag}>
            {item.label}
            <button
              type="button"
              aria-label={`Remove ${item.label}`}
              onClick={() => api.clearValue(item.code)}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </Field>
  )
}

export function ComboboxDisabled() {
  const api = useCombobox({ disabled: true })
  return <Field api={api} />
}

const withDisabled = countries.map((item) => ({
  ...item,
  disabled: item.code === "GH" || item.code === "JP",
}))

export function ComboboxDisabledItem() {
  const api = useCombobox({}, { items: withDisabled })
  return <Field api={api} />
}

export function ComboboxKeepOpen() {
  const api = useCombobox({ closeOnSelect: false, multiple: true })
  return (
    <Stack>
      <Field api={api} label="Countries" />
      <Log label="value" value={show(api.value)} />
    </Stack>
  )
}

export function ComboboxControlledOpen() {
  const [open, setOpen] = useState(false)
  const api = useCombobox({
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

export function ComboboxOpenBehavior() {
  const [reason, setReason] = useState<string>()
  const api = useCombobox({
    openOnClick: true,
    openOnChange: false,
    openOnKeyPress: false,
    inputBehavior: "autohighlight",
    onOpenChange: (details) =>
      setReason(`${details.open} (${details.reason ?? "—"})`),
  })
  return (
    <Stack>
      <Field api={api} />
      <Log label="open" value={show(reason)} />
    </Stack>
  )
}

export function ComboboxPositioning() {
  const api = useCombobox({ positioning: { placement: "top-start" } })
  return <Field api={api} />
}

export function ComboboxInline() {
  const api = useCombobox({ inline: true, placeholder: "Search countries" })
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <Control api={api} />
      <div className={styles.Content} data-inline="" {...api.getContentProps()}>
        <Items api={api} />
      </div>
    </div>
  )
}

export function ComboboxReadOnly() {
  const api = useCombobox({ readOnly: true, defaultValue: ["KE"] })
  return <Field api={api} />
}

export function ComboboxInvalid() {
  const [invalid, setInvalid] = useState(true)
  const api = useCombobox({ required: true, invalid })
  return (
    <Stack>
      <Field api={api} />
      <Ghost onClick={() => setInvalid((current) => !current)}>
        invalid: {String(invalid)}
      </Ghost>
    </Stack>
  )
}

export function ComboboxHighlight() {
  const [value, setValue] = useState<string | null>(null)
  const api = useCombobox({
    onHighlightChange: (details) => setValue(details.highlightedValue),
  })
  return (
    <Stack>
      <Field api={api} />
      <Log label="highlightedValue" value={show(value)} />
    </Stack>
  )
}

export function ComboboxInitialHighlight() {
  const api = useCombobox({ defaultHighlightedValue: "KE" })
  return <Field api={api} />
}

export function ComboboxSelection() {
  const [value, setValue] = useState<string>()
  const api = useCombobox({
    onSelect: (details) => setValue(details.itemValue),
  })
  return (
    <Stack>
      <Field api={api} />
      <Log label="onSelect" value={show(value)} />
    </Stack>
  )
}

export function ComboboxValueChange() {
  const [value, setValue] = useState<unknown>(null)
  const api = useCombobox({
    onValueChange: (details) =>
      setValue({
        value: details.value,
        items: details.items.map((item: Country) => item.label),
      }),
  })
  return (
    <Stack>
      <Field api={api} />
      <Log label="onValueChange" value={show(value)} />
    </Stack>
  )
}

export function ComboboxCustomValue() {
  const api = useCombobox({
    allowCustomValue: true,
    placeholder: "Type anything",
  })
  return (
    <Stack>
      <Field api={api} />
      <Log label="inputValue" value={show(api.inputValue)} />
    </Stack>
  )
}
