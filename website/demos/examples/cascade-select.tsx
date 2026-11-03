import * as cascadeSelect from "@zag-js/cascade-select"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import styles from "../../styles/machines/cascade-select.module.css"
import { Ghost, Log, Row, Stack, show } from "./shared"

interface Node {
  label: string
  value: string
  children?: Node[]
}

const collection = cascadeSelect.collection<Node>({
  nodeToValue: (node) => node.value,
  nodeToString: (node) => node.label,
  nodeToChildren: (node) => node.children ?? [],
  rootNode: {
    label: "ROOT",
    value: "ROOT",
    children: [
      {
        label: "North America",
        value: "north-america",
        children: [
          {
            label: "United States",
            value: "us",
            children: [
              { label: "New York", value: "ny" },
              { label: "California", value: "ca" },
            ],
          },
          {
            label: "Canada",
            value: "canada",
            children: [
              { label: "Ontario", value: "on" },
              { label: "British Columbia", value: "bc" },
            ],
          },
        ],
      },
      {
        label: "Africa",
        value: "africa",
        children: [
          {
            label: "Nigeria",
            value: "ng",
            children: [
              { label: "Lagos", value: "lagos" },
              { label: "Abuja", value: "abuja" },
            ],
          },
          {
            label: "Kenya",
            value: "ke",
            children: [
              { label: "Nairobi", value: "nairobi" },
              { label: "Mombasa", value: "mombasa" },
            ],
          },
        ],
      },
      {
        label: "Asia",
        value: "asia",
        children: [
          { label: "Japan", value: "jp" },
          { label: "India", value: "in" },
        ],
      },
    ],
  },
})

function useCascadeSelect(props: Partial<cascadeSelect.Props<Node>> = {}) {
  const service = useMachine(cascadeSelect.machine, {
    id: useId(),
    collection,
    ...props,
  })
  return cascadeSelect.connect(service, normalizeProps)
}

function Level(props: {
  api: cascadeSelect.Api
  node: Node
  indexPath?: number[]
  value?: string[]
}) {
  const { api, node, indexPath = [], value = [] } = props
  const nodeState = api.getItemState({ indexPath, value, item: node })
  const child = nodeState.highlightedChild as Node | undefined
  return (
    <>
      <ul
        className={styles.List}
        {...api.getListProps({ indexPath, value, item: node })}
      >
        {collection.getNodeChildren(node).map((item, index) => {
          const itemProps = {
            indexPath: [...indexPath, index],
            value: [...value, item.value],
            item,
          }
          const itemState = api.getItemState(itemProps)
          return (
            <li
              key={item.value}
              className={styles.Item}
              {...api.getItemProps(itemProps)}
            >
              <span
                className={styles.ItemText}
                {...api.getItemTextProps(itemProps)}
              >
                {item.label}
              </span>
              <span
                className={styles.ItemIndicator}
                {...api.getItemIndicatorProps(itemProps)}
              >
                ✓
              </span>
              {itemState.hasChildren && (
                <span className={styles.Chevron}>›</span>
              )}
            </li>
          )
        })}
      </ul>
      {child && collection.isBranchNode(child) && (
        <Level
          api={api}
          node={child}
          indexPath={[...indexPath, nodeState.highlightedIndex]}
          value={[...value, child.value]}
        />
      )}
    </>
  )
}

function Field(props: { api: cascadeSelect.Api }) {
  const { api } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <label className={styles.Label} {...api.getLabelProps()}>
        Location
      </label>
      <div className={styles.Control} {...api.getControlProps()}>
        <button className={styles.Trigger} {...api.getTriggerProps()}>
          <span {...api.getValueTextProps()}>
            {api.valueAsString || "Select location"}
          </span>
          <span className={styles.Indicator} {...api.getIndicatorProps()}>
            ▾
          </span>
        </button>
        <button className={styles.ClearTrigger} {...api.getClearTriggerProps()}>
          ×
        </button>
      </div>
      <Portal>
        <div {...api.getPositionerProps()}>
          <div className={styles.Content} {...api.getContentProps()}>
            <Level api={api} node={collection.rootNode} />
          </div>
        </div>
      </Portal>
    </div>
  )
}

const paths = (value: string[][]) => show(value.map((path) => path.join("/")))

export function CascadeSelectBasic() {
  const api = useCascadeSelect()
  return <Field api={api} />
}

export function CascadeSelectInitialValue() {
  const api = useCascadeSelect({
    defaultValue: [["north-america", "us", "ny"]],
  })
  return <Field api={api} />
}

export function CascadeSelectControlled() {
  const [value, setValue] = useState<string[][]>([["africa", "ng", "lagos"]])
  const api = useCascadeSelect({
    value,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <Field api={api} />
      <Row>
        <Ghost onClick={() => setValue([["asia", "jp"]])}>Pick Japan</Ghost>
        <Ghost onClick={() => setValue([])}>Clear</Ghost>
      </Row>
      <Log label="value" value={paths(value)} />
    </Stack>
  )
}

export function CascadeSelectMultiple() {
  const api = useCascadeSelect({ multiple: true })
  return (
    <Stack>
      <Field api={api} />
      <Log label="value" value={paths(api.value)} />
    </Stack>
  )
}

export function CascadeSelectHover() {
  const api = useCascadeSelect({ highlightTrigger: "hover" })
  return <Field api={api} />
}

export function CascadeSelectParentSelection() {
  const api = useCascadeSelect({ allowParentSelection: true })
  return (
    <Stack>
      <Field api={api} />
      <Log label="value" value={paths(api.value)} />
    </Stack>
  )
}

export function CascadeSelectKeepOpen() {
  const api = useCascadeSelect({ closeOnSelect: false })
  return (
    <Stack>
      <Field api={api} />
      <Log label="value" value={paths(api.value)} />
    </Stack>
  )
}

export function CascadeSelectLoopFocus() {
  const api = useCascadeSelect({ loopFocus: true })
  return (
    <Stack>
      <Field api={api} />
      <Log label="highlighted" value={show(api.highlightedValue.join("/"))} />
    </Stack>
  )
}

export function CascadeSelectHighlight() {
  const [value, setValue] = useState<string[]>([])
  const api = useCascadeSelect({
    onHighlightChange: (details) => setValue(details.highlightedValue),
  })
  return (
    <Stack>
      <Field api={api} />
      <Log label="highlightedValue" value={show(value)} />
    </Stack>
  )
}

export function CascadeSelectInitialHighlight() {
  const api = useCascadeSelect({
    defaultHighlightedValue: ["north-america", "us"],
  })
  return <Field api={api} />
}

export function CascadeSelectControlledHighlight() {
  const [highlightedValue, setHighlightedValue] = useState<string[]>([])
  const api = useCascadeSelect({
    highlightedValue,
    onHighlightChange: (details) =>
      setHighlightedValue(details.highlightedValue),
  })
  return (
    <Stack>
      <Field api={api} />
      <Ghost
        onClick={() => {
          api.setOpen(true)
          setHighlightedValue(["africa", "ke"])
        }}
      >
        Highlight Kenya
      </Ghost>
      <Log label="highlightedValue" value={show(highlightedValue)} />
    </Stack>
  )
}

export function CascadeSelectValueChange() {
  const [value, setValue] = useState<unknown>(null)
  const api = useCascadeSelect({
    onValueChange: (details) =>
      setValue({
        value: details.value,
        items: details.items.map((path) => path.map((item) => item.label)),
      }),
  })
  return (
    <Stack>
      <Field api={api} />
      <Log label="onValueChange" value={show(value)} />
    </Stack>
  )
}

export function CascadeSelectOpenChange() {
  const [open, setOpen] = useState(false)
  const api = useCascadeSelect({
    onOpenChange: (details) => setOpen(details.open),
  })
  return (
    <Stack>
      <Field api={api} />
      <Log label="open" value={String(open)} />
    </Stack>
  )
}

export function CascadeSelectControlledOpen() {
  const [open, setOpen] = useState(false)
  const api = useCascadeSelect({
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

export function CascadeSelectPositioning() {
  const api = useCascadeSelect({
    positioning: { placement: "right-start", gutter: 4 },
  })
  return <Field api={api} />
}

export function CascadeSelectFormatValue() {
  const api = useCascadeSelect({
    multiple: true,
    formatValue: (selectedItems) =>
      selectedItems
        .map((path) => path.map((item) => item.label).join(" / "))
        .join(", "),
  })
  return <Field api={api} />
}

export function CascadeSelectReadOnly() {
  const [readOnly, setReadOnly] = useState(true)
  const [invalid, setInvalid] = useState(false)
  const api = useCascadeSelect({
    readOnly,
    required: true,
    invalid,
    defaultValue: [["africa", "ke", "nairobi"]],
  })
  return (
    <Stack>
      <Field api={api} />
      <Row>
        <Ghost onClick={() => setReadOnly((current) => !current)}>
          readOnly: {String(readOnly)}
        </Ghost>
        <Ghost onClick={() => setInvalid((current) => !current)}>
          invalid: {String(invalid)}
        </Ghost>
      </Row>
    </Stack>
  )
}
