import * as accordion from "@zag-js/accordion"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import styles from "../../styles/machines/accordion.module.css"
import { Ghost, Log, Row, Stack, show } from "./shared"

const items = [
  {
    value: "shipping",
    title: "Shipping",
    desc: "Delivery times and costs",
    content: "Orders ship within two business days from our warehouse.",
  },
  {
    value: "returns",
    title: "Returns",
    desc: "How to send an item back",
    content: "Return any unused item within 30 days for a full refund.",
  },
  {
    value: "warranty",
    title: "Warranty",
    desc: "What the guarantee covers",
    content: "Every product carries a two year warranty against defects.",
  },
]

function useAccordion(props: Partial<accordion.Props> = {}) {
  const service = useMachine(accordion.machine, { id: useId(), ...props })
  return accordion.connect(service, normalizeProps)
}

interface ViewProps {
  api: accordion.Api
  disabled?: string
  content?: Record<string, string>
}

function View(props: ViewProps) {
  const { api } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      {items.map((item) => {
        const itemProps = {
          value: item.value,
          disabled: props.disabled === item.value,
        }
        return (
          <div
            key={item.value}
            className={styles.Item}
            {...api.getItemProps(itemProps)}
          >
            <h3>
              <button
                className={styles.ItemTrigger}
                {...api.getItemTriggerProps(itemProps)}
              >
                <div>{item.title}</div>
                <div>{item.desc}</div>
                <span
                  className={styles.ItemIndicator}
                  {...api.getItemIndicatorProps(itemProps)}
                >
                  ▾
                </span>
              </button>
            </h3>
            <div
              className={styles.ItemContent}
              {...api.getItemContentProps(itemProps)}
            >
              {props.content?.[item.value] ?? item.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function AccordionMultiple() {
  const api = useAccordion({ multiple: true })
  return <View api={api} />
}

export function AccordionInitialValue() {
  const api = useAccordion({
    multiple: true,
    defaultValue: ["shipping", "returns"],
  })
  return <View api={api} />
}

export function AccordionControlled() {
  const [value, setValue] = useState(["shipping"])
  const api = useAccordion({
    multiple: true,
    value,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <Row>
        <Ghost onClick={() => setValue(items.map((item) => item.value))}>
          Expand all
        </Ghost>
        <Ghost onClick={() => setValue([])}>Collapse all</Ghost>
      </Row>
      <View api={api} />
      <Log label="value" value={show(value)} />
    </Stack>
  )
}

export function AccordionKeepOpen() {
  const api = useAccordion({ collapsible: false, defaultValue: ["shipping"] })
  return <View api={api} />
}

export function AccordionValueChange() {
  const [value, setValue] = useState<string[]>([])
  const api = useAccordion({
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <View api={api} />
      <Log label="onValueChange" value={show(value)} />
    </Stack>
  )
}

export function AccordionFocusChange() {
  const [value, setValue] = useState<string | null>(null)
  const api = useAccordion({
    onFocusChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <View api={api} />
      <Log label="focused" value={show(value)} />
    </Stack>
  )
}

export function AccordionHorizontal() {
  const api = useAccordion({
    orientation: "horizontal",
    defaultValue: ["shipping"],
  })
  return <View api={api} />
}

export function AccordionDisabled() {
  const api = useAccordion({ defaultValue: ["shipping"] })
  return <View api={api} disabled="returns" />
}

const searchable = {
  shipping: "Parcels leave the depot by courier within two days.",
  returns: "Pack the item with its original label and drop it at any locker.",
  warranty: "Cover includes the motor, the battery and the charging dock.",
}

export function AccordionHiddenUntilFound() {
  const [value, setValue] = useState<string[]>([])
  const api = useAccordion({
    hiddenUntilFound: true,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <View api={api} content={searchable} />
      <Log
        label="find-in-page"
        value={`search "locker" · open ${show(value)}`}
      />
    </Stack>
  )
}
