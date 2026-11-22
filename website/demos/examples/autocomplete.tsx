import * as asyncList from "@zag-js/async-list"
import * as autocomplete from "@zag-js/autocomplete"
import { createFilter } from "@zag-js/i18n-utils"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { Fragment, useId, useMemo, useState } from "react"
import styles from "../../styles/machines/autocomplete.module.css"
import { Button, Ghost, Log, Row, Stack, show } from "./shared"

interface Country {
  label: string
  code: string
  disabled?: boolean
}

const countries: Country[] = [
  { label: "Australia", code: "AU" },
  { label: "Austria", code: "AT" },
  { label: "Canada", code: "CA" },
  { label: "Ghana", code: "GH" },
  { label: "Japan", code: "JP" },
  { label: "Kenya", code: "KE" },
  { label: "Malaysia", code: "MY" },
  { label: "Malta", code: "MT" },
  { label: "Nigeria", code: "NG" },
  { label: "Togo", code: "TG" },
  { label: "Tunisia", code: "TN" },
  { label: "United States", code: "US" },
]

const toCountries = (items: Country[]) =>
  autocomplete.collection({
    items,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
    isItemDisabled: (item) => !!item.disabled,
  })

const { contains } = createFilter({ sensitivity: "base" })

interface Config<T> {
  items?: T[]
  toCollection?: (items: T[]) => autocomplete.Props<any>["collection"]
}

function useAutocomplete<T = Country>(
  props: Partial<autocomplete.Props<any>> = {},
  config: Config<T> = {},
) {
  const items = (config.items ?? countries) as T[]
  const create = config.toCollection ?? (toCountries as never)
  const [query, setQuery] = useState(props.defaultValue ?? "")
  const text = props.value ?? query
  // `inline` and `none` keep every suggestion
  const filtered = props.mode !== "inline" && props.mode !== "none"
  const collection = useMemo(() => {
    const base = create(items)!
    if (!filtered) return base
    return create(
      items.filter((item) => contains(base.stringifyItem(item) ?? "", text)),
    )
  }, [items, create, text, filtered])
  const service = useMachine(autocomplete.machine, {
    id: useId(),
    placeholder: "Type a country",
    ...props,
    collection,
    onValueChange(details) {
      setQuery(details.value)
      props.onValueChange?.(details)
    },
  })
  return autocomplete.connect(service, normalizeProps)
}

function Control(props: { api: autocomplete.Api; label?: string }) {
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

function Items(props: {
  api: autocomplete.Api
  render?: (item: any) => React.ReactNode
}) {
  const { api } = props
  return (
    <ul className={styles.List} {...api.getListProps()}>
      {api.collection.items.map((item) => (
        <li
          key={api.collection.getItemValue(item)}
          className={styles.Item}
          {...api.getItemProps({ item })}
        >
          <span className={styles.ItemText} {...api.getItemTextProps({ item })}>
            {props.render?.(item) ?? api.collection.stringifyItem(item)}
          </span>
        </li>
      ))}
    </ul>
  )
}

function Field(props: {
  api: autocomplete.Api
  label?: string
  list?: React.ReactNode
  status?: React.ReactNode
  empty?: React.ReactNode
}) {
  const { api } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <Control api={api} label={props.label} />
      <Portal>
        <div className={styles.Positioner} {...api.getPositionerProps()}>
          <div className={styles.Content} {...api.getContentProps()}>
            {props.status}
            <div className={styles.Empty} {...api.getEmptyProps()}>
              {props.empty ?? "No matches"}
            </div>
            {props.list ?? <Items api={api} />}
          </div>
        </div>
      </Portal>
    </div>
  )
}

export function AutocompleteInitialValue() {
  const api = useAutocomplete({ defaultValue: "Ma" })
  return <Field api={api} />
}

export function AutocompleteControlled() {
  const [value, setValue] = useState("")
  const api = useAutocomplete({
    value,
    onValueChange(details) {
      // ignoring a change keeps the previous text
      if (details.value.length > 12) return
      setValue(details.value)
    },
  })
  return (
    <Stack>
      <Field api={api} label="Country (12 characters at most)" />
      <Row>
        <Ghost onClick={() => setValue("Japan")}>Set to Japan</Ghost>
        <Ghost onClick={() => setValue("")}>Clear</Ghost>
      </Row>
      <Log label="value" value={show(value)} />
    </Stack>
  )
}

export function AutocompleteValueChange() {
  const [change, setChange] = useState<string>()
  const api = useAutocomplete({
    onValueChange: (details) =>
      setChange(`${show(details.value)} (${details.reason ?? "—"})`),
  })
  return (
    <Stack>
      <Field api={api} />
      <Log label="onValueChange" value={show(change)} />
    </Stack>
  )
}

const modes: autocomplete.Mode[] = ["list", "both", "inline", "none"]

export function AutocompleteModes() {
  const [mode, setMode] = useState<autocomplete.Mode>("both")
  const api = useAutocomplete({ mode })
  return (
    <Stack>
      <Field api={api} />
      <Row>
        {modes.map((item) => (
          <Ghost
            key={item}
            aria-pressed={item === mode}
            onClick={() => setMode(item)}
          >
            {item}
          </Ghost>
        ))}
      </Row>
      <Log label="mode" value={mode} />
    </Stack>
  )
}

export function AutocompleteAutoHighlight() {
  const api = useAutocomplete({ autoHighlight: true, loopFocus: false })
  return <Field api={api} />
}

export function AutocompleteOpenOnClick() {
  const [reason, setReason] = useState<string>()
  const api = useAutocomplete({
    openOnClick: true,
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

export function AutocompleteControlledOpen() {
  const [open, setOpen] = useState(false)
  const api = useAutocomplete({
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

export function AutocompleteClearTrigger() {
  const api = useAutocomplete({ defaultValue: "Kenya" })
  return <Field api={api} />
}

export function AutocompleteDisabled() {
  const api = useAutocomplete({ disabled: true, defaultValue: "Ghana" })
  return <Field api={api} />
}

const withDisabled = countries.map((item) => ({
  ...item,
  disabled: item.code === "AT" || item.code === "MT",
}))

export function AutocompleteDisabledItem() {
  const api = useAutocomplete({ defaultValue: "a" }, { items: withDisabled })
  return <Field api={api} />
}

export function AutocompleteHighlight() {
  const [value, setValue] = useState<string | null>(null)
  const api = useAutocomplete({
    onHighlightChange: (details) => setValue(details.highlightedValue),
  })
  return (
    <Stack>
      <Field api={api} />
      <Log label="highlightedValue" value={show(value)} />
    </Stack>
  )
}

export function AutocompleteSelection() {
  const [value, setValue] = useState<unknown>(null)
  const api = useAutocomplete({
    onSelect: (details) =>
      setValue({ itemValue: details.itemValue, value: details.value }),
  })
  return (
    <Stack>
      <Field api={api} />
      <Log label="onSelect" value={show(value)} />
    </Stack>
  )
}

export function AutocompletePositioning() {
  const api = useAutocomplete({ positioning: { placement: "top-start" } })
  return <Field api={api} />
}

interface Produce {
  label: string
  value: string
  type: string
}

const produce: Produce[] = [
  { label: "Apple", value: "apple", type: "Fruits" },
  { label: "Banana", value: "banana", type: "Fruits" },
  { label: "Mango", value: "mango", type: "Fruits" },
  { label: "Carrot", value: "carrot", type: "Vegetables" },
  { label: "Lettuce", value: "lettuce", type: "Vegetables" },
  { label: "Spinach", value: "spinach", type: "Vegetables" },
  { label: "Almond", value: "almond", type: "Nuts" },
  { label: "Cashew", value: "cashew", type: "Nuts" },
]

const toProduce = (items: Produce[]) =>
  autocomplete.collection({ items, groupBy: (item) => item.type })

export function AutocompleteGrouped() {
  const api = useAutocomplete(
    { placeholder: "e.g. apple" },
    { items: produce, toCollection: toProduce },
  )
  return (
    <Field
      api={api}
      label="Produce"
      list={
        <div {...api.getListProps()}>
          {api.collection.group().map(([type, items], index) => (
            <Fragment key={type}>
              {index > 0 && (
                <hr className={styles.Separator} {...api.getSeparatorProps()} />
              )}
              <div {...api.getItemGroupProps({ id: type })}>
                <div
                  className={styles.GroupLabel}
                  {...api.getItemGroupLabelProps({ htmlFor: type })}
                >
                  {type}
                </div>
                {items.map((item: Produce) => (
                  <div
                    key={item.value}
                    className={styles.Item}
                    {...api.getItemProps({ item })}
                  >
                    <span {...api.getItemTextProps({ item })}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </Fragment>
          ))}
        </div>
      }
    />
  )
}

function highlight(text: string, query: string) {
  const index = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1
  if (index === -1) return text
  const end = index + query.length
  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, end)}</mark>
      {text.slice(end)}
    </>
  )
}

export function AutocompleteHighlightMatches() {
  const api = useAutocomplete({ placeholder: "e.g. ma" })
  return (
    <Field
      api={api}
      list={
        <Items
          api={api}
          render={(item: Country) => highlight(item.label, api.value)}
        />
      }
    />
  )
}

interface Command {
  label: string
  value: string
  icon: string
  description: string
}

const commands: Command[] = [
  { label: "Replies", value: "replies", icon: "↩", description: "Threads" },
  { label: "Reactions", value: "reactions", icon: "☺", description: "Emoji" },
  { label: "Mentions", value: "mentions", icon: "@", description: "People" },
  { label: "Reminders", value: "reminders", icon: "⏰", description: "Later" },
]

const toCommands = (items: Command[]) => autocomplete.collection({ items })

export function AutocompleteRichItems() {
  const api = useAutocomplete(
    { placeholder: "e.g. rep" },
    { items: commands, toCollection: toCommands },
  )
  return (
    <Field
      api={api}
      label="Activity"
      list={
        <ul className={styles.List} {...api.getListProps()}>
          {api.collection.items.map((item: Command) => (
            <li
              key={item.value}
              className={styles.Item}
              {...api.getItemProps({ item })}
            >
              <span aria-hidden>{item.icon}</span>
              <span
                className={styles.ItemText}
                {...api.getItemTextProps({ item })}
              >
                {item.label}
              </span>
              <span aria-hidden className={styles.Status}>
                {item.description}
              </span>
            </li>
          ))}
        </ul>
      }
    />
  )
}

const LIMIT = 4

export function AutocompleteLimit() {
  const [value, setValue] = useState("")
  const matches = countries.filter((item) => contains(item.label, value))
  const items = matches.slice(0, LIMIT)
  const hidden = matches.length - items.length

  const service = useMachine(autocomplete.machine, {
    id: useId(),
    collection: toCountries(items),
    placeholder: "Type a country",
    openOnClick: true,
    value,
    onValueChange: (details) => setValue(details.value),
  })
  const api = autocomplete.connect(service, normalizeProps)

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <Control api={api} label={`Country (first ${LIMIT} matches)`} />
      <Portal>
        <div className={styles.Positioner} {...api.getPositionerProps()}>
          <div className={styles.Content} {...api.getContentProps()}>
            <div className={styles.Empty} {...api.getEmptyProps()}>
              No matches
            </div>
            <Items api={api} />
            {hidden > 0 && (
              <div className={styles.Status} role="status">
                {hidden} more. Keep typing to narrow them.
              </div>
            )}
          </div>
        </div>
      </Portal>
    </div>
  )
}

const topics = [
  "react hooks",
  "react server components",
  "tailwind grid",
  "tailwind colors",
  "web components",
  "vue v-model",
  "vue router",
]

export function AutocompleteSearch() {
  const [searches, setSearches] = useState<string[]>([])
  const [value, setValue] = useState("")
  const items = topics.filter((topic) => contains(topic, value))

  const service = useMachine(autocomplete.machine, {
    id: useId(),
    collection: autocomplete.collection({ items }),
    name: "q",
    placeholder: "Search docs",
    submitOnSelect: true,
    value,
    onValueChange: (details) => setValue(details.value),
  })
  const api = autocomplete.connect(service, normalizeProps)

  return (
    <Stack>
      <form
        role="search"
        className={styles.Form}
        onSubmit={(event) => {
          event.preventDefault()
          const query = new FormData(event.currentTarget).get("q")
          setSearches((prev) => [String(query), ...prev].slice(0, 3))
        }}
      >
        <div className={styles.Root} {...api.getRootProps()}>
          <label className={styles.Label} {...api.getLabelProps()}>
            Search docs
          </label>
          <div className={styles.Control} {...api.getControlProps()}>
            <input
              className={styles.Input}
              {...api.getInputProps()}
              type="search"
            />
          </div>
        </div>
        <Button type="submit">Search</Button>
      </form>
      <Log label="searches" value={show(searches)} />
      <Portal>
        <div className={styles.Positioner} {...api.getPositionerProps()}>
          <div className={styles.Content} {...api.getContentProps()}>
            <div className={styles.Empty} {...api.getEmptyProps()}>
              No suggestions
            </div>
            <Items api={api} />
          </div>
        </div>
      </Portal>
    </Stack>
  )
}

export function AutocompleteForm() {
  const [submitted, setSubmitted] = useState<string>()
  const api = useAutocomplete({ name: "country", required: true })
  return (
    <Stack>
      <form
        className={styles.Form}
        onSubmit={(event) => {
          event.preventDefault()
          setSubmitted(String(new FormData(event.currentTarget).get("country")))
        }}
      >
        <Field api={api} />
        <Button type="submit">Submit</Button>
      </form>
      <Log label="submitted" value={show(submitted)} />
    </Stack>
  )
}

const recent = ["react hooks", "tailwind grid", "vue router"]

export function AutocompleteRecent() {
  const [value, setValue] = useState("")
  const showRecent = value.trim() === ""
  const items = showRecent
    ? recent
    : topics.filter((topic) => contains(topic, value))

  const service = useMachine(autocomplete.machine, {
    id: useId(),
    collection: autocomplete.collection({ items }),
    placeholder: "Search docs",
    openOnClick: true,
    value,
    onValueChange: (details) => setValue(details.value),
  })
  const api = autocomplete.connect(service, normalizeProps)

  const renderItem = (item: string) => (
    <li key={item} className={styles.Item} {...api.getItemProps({ item })}>
      <span className={styles.ItemText} {...api.getItemTextProps({ item })}>
        {item}
      </span>
    </li>
  )

  return (
    <Field
      api={api}
      label="Search docs"
      empty="No topics found"
      list={
        <ul className={styles.List} {...api.getListProps()}>
          {showRecent ? (
            <li {...api.getItemGroupProps({ id: "recent" })}>
              <span
                className={styles.GroupLabel}
                {...api.getItemGroupLabelProps({ htmlFor: "recent" })}
              >
                Recent searches
              </span>
              <ul className={styles.List} role="presentation">
                {items.map(renderItem)}
              </ul>
            </li>
          ) : (
            items.map(renderItem)
          )}
        </ul>
      }
    />
  )
}

const cities = [
  "Amsterdam",
  "Athens",
  "Barcelona",
  "Berlin",
  "Boston",
  "Brussels",
  "Cairo",
  "Chicago",
  "Lagos",
  "Lisbon",
  "London",
  "Madrid",
  "Paris",
  "Prague",
  "Rome",
  "Tokyo",
]

// A fake server: slow, and aborted when the query changes
function searchCities(query: string, signal?: AbortSignal) {
  return new Promise<string[]>((resolve, reject) => {
    const timer = setTimeout(() => {
      const needle = query.trim().toLowerCase()
      resolve(cities.filter((city) => city.toLowerCase().startsWith(needle)))
    }, 600)
    signal?.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(new DOMException("Aborted", "AbortError"))
    })
  })
}

export function AutocompleteAsync() {
  const listService = useMachine(
    asyncList.machine as asyncList.Machine<string>,
    {
      keepPreviousItems: true,
      async load({ signal, filter }) {
        if (!filter?.trim()) return { items: [] }
        return { items: await searchCities(filter, signal) }
      },
    },
  )
  const list = asyncList.connect(listService)

  const service = useMachine(autocomplete.machine, {
    id: useId(),
    collection: autocomplete.collection({ items: list.items }),
    placeholder: "e.g. Paris",
    loading: list.isLoading,
    onValueChange({ value, reason }) {
      if (reason === "item-select") return
      list.setFilter(value)
    },
  })
  const api = autocomplete.connect(service, normalizeProps)

  return (
    <Field
      api={api}
      label="City"
      empty={!list.isLoading && "No cities found"}
      status={
        list.isLoading &&
        list.isEmpty && <div className={styles.Status}>Searching…</div>
      }
    />
  )
}
