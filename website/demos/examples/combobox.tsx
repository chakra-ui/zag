import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/utils/search"
import {
  mergeProps,
  normalizeProps,
  Portal,
  useMachine,
  type PropTypes,
} from "@zag-js/react"
import { ListVirtualizer } from "@zag-js/virtualizer"
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react"
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

const { contains } = createFilter({ sensitivity: "base" })

const matches = (text: string, query: string) => contains(text, query.trim())

interface Config<T> {
  items?: T[]
  toCollection?: (items: T[]) => combobox.Props<any>["collection"]
  filter?: (item: T, query: string) => boolean
}

function useCombobox<T = Country>(
  props: Partial<combobox.Props<any>> = {},
  config: Config<T> = {},
) {
  const items = (config.items ?? countries) as T[]
  const create = config.toCollection ?? (toCountries as never)
  const filter = config.filter
  const [query, setQuery] = useState(props.defaultInputValue ?? "")
  const collection = useMemo(() => {
    const base = create(items)!
    return create(
      items.filter((item) =>
        filter
          ? filter(item, query.trim())
          : matches(base.stringifyItem(item) ?? "", query),
      ),
    )
  }, [items, create, filter, query])
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

function Item(props: {
  api: combobox.Api
  item: any
  children?: React.ReactNode
}) {
  const { api, item } = props
  return (
    <div className={styles.Item} {...api.getItemProps({ item })}>
      <span className={styles.ItemText} {...api.getItemTextProps({ item })}>
        {props.children ?? api.collection.stringifyItem(item)}
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

function Empty(props: { api: combobox.Api }) {
  const { api } = props
  return (
    <div className={styles.Empty} {...api.getEmptyProps()}>
      {api.collection.size === 0 && "No matches"}
    </div>
  )
}

function Items(props: { api: combobox.Api }) {
  const { api } = props
  return (
    <>
      <Empty api={api} />
      <div className={styles.List} {...api.getListProps()}>
        {api.collection.items.map((item) => (
          <Item key={api.collection.getItemValue(item)} api={api} item={item} />
        ))}
      </div>
    </>
  )
}

function Field(props: {
  api: combobox.Api
  label?: string
  children?: React.ReactNode
  /** Replaces the default empty state and list */
  content?: React.ReactNode
}) {
  const { api } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <Control api={api} label={props.label} />
      {props.children}
      <Portal>
        <div className={styles.Positioner} {...api.getPositionerProps()}>
          <div className={styles.Content} {...api.getContentProps()}>
            {props.content ?? <Items api={api} />}
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
    openOnChange: ({ inputValue }) => inputValue.length >= 2,
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

export function ComboboxAutoHighlight() {
  const api = useCombobox({ autoHighlight: true })
  return (
    <Stack>
      <Field api={api} />
      <Log label="highlightedValue" value={show(api.highlightedValue)} />
    </Stack>
  )
}

interface CountryWithKeywords extends Country {
  keywords: string[]
}

const countriesWithKeywords: CountryWithKeywords[] = [
  { label: "Germany", code: "DE", keywords: ["Deutschland"] },
  { label: "Japan", code: "JP", keywords: ["Nihon", "Nippon"] },
  { label: "Spain", code: "ES", keywords: ["España"] },
  { label: "Finland", code: "FI", keywords: ["Suomi"] },
  { label: "Switzerland", code: "CH", keywords: ["Schweiz", "Suisse"] },
  { label: "Greece", code: "GR", keywords: ["Hellas"] },
]

const { startsWith } = createFilter({ sensitivity: "base" })

const filterByKeywords = (item: CountryWithKeywords, query: string) =>
  [item.label, ...item.keywords].some((text) => startsWith(text, query))

export function ComboboxFilter() {
  const api = useCombobox(
    { placeholder: "Try “deutsch” or “suomi”" },
    { items: countriesWithKeywords, filter: filterByKeywords },
  )
  return <Field api={api} />
}

function Highlight(props: { text: string; query: string }) {
  const { text, query } = props
  const index = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1
  if (index === -1) return <>{text}</>
  const end = index + query.length
  return (
    <>
      {text.slice(0, index)}
      <mark className={styles.Mark}>{text.slice(index, end)}</mark>
      {text.slice(end)}
    </>
  )
}

export function ComboboxHighlightMatches() {
  const [query, setQuery] = useState("")
  const api = useCombobox({
    onInputValueChange: (details) =>
      setQuery(details.reason === "input-change" ? details.inputValue : ""),
  })
  return (
    <Field
      api={api}
      content={
        <>
          <Empty api={api} />
          <div className={styles.List} {...api.getListProps()}>
            {api.collection.items.map((item: Country) => (
              <Item key={item.code} api={api} item={item}>
                <Highlight text={item.label} query={query.trim()} />
              </Item>
            ))}
          </div>
        </>
      }
    />
  )
}

interface City {
  label: string
  value: string
  region: string
}

const cities: City[] = [
  { label: "Lagos", value: "lagos", region: "Africa" },
  { label: "Nairobi", value: "nairobi", region: "Africa" },
  { label: "Accra", value: "accra", region: "Africa" },
  { label: "Chicago", value: "chicago", region: "Americas" },
  { label: "Toronto", value: "toronto", region: "Americas" },
  { label: "São Paulo", value: "sao-paulo", region: "Americas" },
  { label: "Tokyo", value: "tokyo", region: "Asia" },
  { label: "Seoul", value: "seoul", region: "Asia" },
  { label: "Singapore", value: "singapore", region: "Asia" },
]

const toCities = (items: City[]) =>
  combobox.collection({ items, groupBy: (item) => item.region })

function GroupedItems(props: { api: combobox.Api }) {
  const { api } = props
  return (
    <>
      <Empty api={api} />
      <div className={styles.List} {...api.getListProps()}>
        {api.collection.group().map(([region, items], index) => (
          <div key={region}>
            {index > 0 && (
              <hr className={styles.Separator} {...api.getSeparatorProps()} />
            )}
            <div {...api.getItemGroupProps({ id: region })}>
              <div
                className={styles.ItemGroupLabel}
                {...api.getItemGroupLabelProps({ htmlFor: region })}
              >
                {region}
              </div>
              {items.map((item) => (
                <Item key={item.value} api={api} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export function ComboboxGroups() {
  const api = useCombobox(
    { placeholder: "Type a city" },
    { items: cities, toCollection: toCities },
  )
  return <Field api={api} label="City" content={<GroupedItems api={api} />} />
}

const recentCodes = ["JP", "KE", "CA"]

export function ComboboxRecentItems() {
  const [query, setQuery] = useState("")
  const items = useMemo(
    () =>
      query
        ? countries
        : countries.filter((item) => recentCodes.includes(item.code)),
    [query],
  )
  const api = useCombobox(
    {
      openOnClick: true,
      onInputValueChange: (details) =>
        setQuery(details.reason === "input-change" ? details.inputValue : ""),
    },
    { items },
  )
  return (
    <Field
      api={api}
      content={
        <>
          <Empty api={api} />
          <div className={styles.List} {...api.getListProps()}>
            <div {...api.getItemGroupProps({ id: "results" })}>
              <div
                className={styles.ItemGroupLabel}
                {...api.getItemGroupLabelProps({ htmlFor: "results" })}
              >
                {query.trim() ? "Results" : "Recent"}
              </div>
              {api.collection.items.map((item: Country) => (
                <Item key={item.code} api={api} item={item} />
              ))}
            </div>
          </div>
        </>
      }
    />
  )
}

function ChipsField(props: { api: combobox.Api; label?: string }) {
  const { api } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <label className={styles.Label} {...api.getLabelProps()}>
        {props.label ?? "Countries"}
      </label>
      <div className={styles.Control} {...api.getControlProps()}>
        <div className={styles.ChipGroup} {...api.getChipGroupProps()}>
          {api.selectedItems.map((item: Country) => (
            <span
              key={item.code}
              className={styles.Chip}
              {...api.getChipProps({ item })}
            >
              {item.label}
              <button
                className={styles.ChipDeleteTrigger}
                {...api.getChipDeleteTriggerProps({ item })}
              >
                ×
              </button>
            </span>
          ))}
          <input
            className={styles.Input}
            {...api.getInputProps()}
            placeholder={api.hasSelectedItems ? "" : "Add countries"}
          />
        </div>
      </div>
      <Portal>
        <div className={styles.Positioner} {...api.getPositionerProps()}>
          <div className={styles.Content} {...api.getContentProps()}>
            <Items api={api} />
          </div>
        </div>
      </Portal>
    </div>
  )
}

export function ComboboxChips() {
  const [reason, setReason] = useState<string>()
  const api = useCombobox({
    multiple: true,
    defaultValue: ["NG", "JP"],
    onValueChange: (details) => setReason(details.reason),
  })
  return (
    <Stack>
      <ChipsField api={api} />
      <Log label="reason" value={show(reason)} />
    </Stack>
  )
}

export function ComboboxSelectAll() {
  const api = useCombobox({ multiple: true, placeholder: "Filter countries" })
  const selectAll = api.getSelectAllState()
  return (
    <Stack>
      <Field
        api={api}
        label="Countries"
        content={
          <>
            <Empty api={api} />
            <div className={styles.List} {...api.getListProps()}>
              <div className={styles.Item} {...api.getSelectAllProps()}>
                <span className={styles.Check}>
                  {selectAll.checked ? "✓" : selectAll.indeterminate ? "–" : ""}
                </span>
                {selectAll.checked ? "Unselect all" : "Select all"}
              </div>
              <hr className={styles.Separator} {...api.getSeparatorProps()} />
              {api.collection.items.map((item: Country) => (
                <Item key={item.code} api={api} item={item} />
              ))}
            </div>
          </>
        }
      />
      <Row>
        <Ghost onClick={() => api.selectAll()}>Select all</Ghost>
        <Ghost onClick={() => api.clearValue()}>Clear</Ghost>
      </Row>
      <Log label="value" value={show(api.value)} />
    </Stack>
  )
}

const MAX_SELECTED = 3

export function ComboboxMaxSelected() {
  const [value, setValue] = useState<string[]>([])
  const limitReached = value.length >= MAX_SELECTED
  const toCollection = useCallback(
    (items: Country[]) =>
      combobox.collection({
        items,
        itemToValue: (item) => item.code,
        itemToString: (item) => item.label,
        // Once full, only selected items stay enabled so they can be removed
        isItemDisabled: (item) => limitReached && !value.includes(item.code),
      }),
    [limitReached, value],
  )
  const api = useCombobox(
    {
      multiple: true,
      value,
      onValueChange: (details) => setValue(details.value),
    },
    { toCollection },
  )
  return (
    <Stack>
      <ChipsField api={api} />
      <Log label="selected" value={`${value.length} / ${MAX_SELECTED}`} />
    </Stack>
  )
}

const toItem = (label: string): Country => ({
  label,
  code: label.toLowerCase(),
})

const labels = ["Bug", "Feature", "Enhancement", "Documentation"].map(toItem)

function CreateItem(props: { api: combobox.Api }) {
  const { api } = props
  const create = api.getCreateItemState()
  return (
    <div className={styles.CreateItem} {...api.getCreateItemProps()}>
      {create.pending
        ? `Creating “${create.inputValue}”…`
        : `Create “${create.inputValue}”`}
      {create.error && (
        <span className={styles.CreateError}>{create.error.message}</span>
      )}
    </div>
  )
}

function CreatableItems(props: { api: combobox.Api }) {
  const { api } = props
  return (
    <div className={styles.List} {...api.getListProps()}>
      {api.collection.items.map((item: Country) => (
        <Item key={item.code} api={api} item={item} />
      ))}
      <CreateItem api={api} />
    </div>
  )
}

export function ComboboxCreate() {
  const [items, setItems] = useState(labels)
  const api = useCombobox(
    {
      placeholder: "Search or create",
      autoHighlight: true,
      onCreate({ inputValue }) {
        const item = toItem(inputValue)
        setItems((prev) => [...prev, item])
        return item.code
      },
    },
    { items },
  )
  return (
    <Stack>
      <Field api={api} label="Label" content={<CreatableItems api={api} />} />
      <Log label="value" value={show(api.value)} />
    </Stack>
  )
}

// Fake server: slow, abortable, and rejects labels starting with "x"
function saveLabel(label: string, signal: AbortSignal) {
  return new Promise<Country>((resolve, reject) => {
    const timer = setTimeout(() => {
      if (/^x/i.test(label)) reject(new Error(`“${label}” is reserved`))
      else resolve(toItem(label))
    }, 1000)
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })
}

export function ComboboxCreateAsync() {
  const [items, setItems] = useState(labels)
  const api = useCombobox(
    {
      placeholder: "Try “Xylophone” to fail",
      autoHighlight: true,
      async onCreate({ inputValue, signal }) {
        const item = await saveLabel(inputValue, signal)
        setItems((prev) => [...prev, item])
        return item.code
      },
    },
    { items },
  )
  return (
    <Stack>
      <Field api={api} label="Label" content={<CreatableItems api={api} />} />
      <Log label="value" value={show(api.value)} />
    </Stack>
  )
}

export function ComboboxInputInPopup() {
  const api = useCombobox({
    popupType: "dialog",
    selectionBehavior: "clear",
    autoHighlight: true,
    placeholder: "Search",
  })
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <label className={styles.Label} {...api.getLabelProps()}>
        Country
      </label>
      <div {...api.getControlProps()}>
        <button
          className={styles.SelectTrigger}
          {...api.getTriggerProps({ focusable: true })}
        >
          {api.valueAsString || "Select a country"}
          <span aria-hidden>▾</span>
        </button>
      </div>
      <Portal>
        <div className={styles.Positioner} {...api.getPositionerProps()}>
          <div className={styles.Content} {...api.getContentProps()}>
            <input className={styles.PopupInput} {...api.getInputProps()} />
            <Items api={api} />
          </div>
        </div>
      </Portal>
    </div>
  )
}

const manyItems = Array.from({ length: 5000 }, (_, index) => ({
  label: `Item ${index + 1}`,
  value: `item-${index + 1}`,
}))

const ITEM_SIZE = 32

function useListVirtualizer(count: number) {
  const id = useId()
  const [virtualizer] = useState(
    () =>
      new ListVirtualizer<PropTypes>({
        id,
        normalizeProps,
        count,
        itemSize: ITEM_SIZE,
        overscan: 6,
        observeScrollElementSize: true,
      }),
  )
  useSyncExternalStore(
    virtualizer.subscribe,
    virtualizer.getSnapshot,
    virtualizer.getSnapshot,
  )
  useLayoutEffect(() => virtualizer.updateOptions({ count }))
  const ref = useCallback(
    (element: HTMLElement | null) => {
      if (element) virtualizer.init(element)
    },
    [virtualizer],
  )
  useEffect(() => () => virtualizer.destroy(), [virtualizer])
  return { virtualizer, ref }
}

const toManyItems = (items: typeof manyItems) => combobox.collection({ items })

export function ComboboxVirtualized() {
  const [count, setCount] = useState(manyItems.length)
  const { virtualizer, ref } = useListVirtualizer(count)
  const api = useCombobox(
    {
      placeholder: "Search 5,000 items",
      scrollToIndexFn(details) {
        virtualizer.scrollToIndex(details.index, {
          align: details.immediate ? "center" : "auto",
        })
      },
    },
    { items: manyItems, toCollection: toManyItems },
  )
  const items = api.collection.items
  // The virtualizer's count follows the filtered list
  if (items.length !== count) setCount(items.length)
  return (
    <Field
      api={api}
      label="Item"
      content={
        <>
          <Empty api={api} />
          <div
            className={styles.VirtualList}
            ref={ref}
            {...mergeProps(virtualizer.getRootProps(), api.getListProps())}
          >
            <div {...virtualizer.getContentProps()}>
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const item = items[virtualItem.index]
                if (!item) return null
                return (
                  <div
                    key={item.value}
                    className={styles.Item}
                    {...mergeProps(
                      virtualizer.getItemProps(virtualItem),
                      api.getItemProps({ item }),
                    )}
                  >
                    <span className={styles.ItemText}>{item.label}</span>
                    <span
                      className={styles.ItemIndicator}
                      {...api.getItemIndicatorProps({ item })}
                    >
                      ✓
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      }
    />
  )
}
