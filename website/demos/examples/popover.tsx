import * as popover from "@zag-js/popover"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId, useRef, useState } from "react"
import { HiX } from "react-icons/hi"
import styles from "../../styles/machines/popover.module.css"
import { Ghost, Log, Row, Stack } from "./shared"

function usePopover(props: Partial<popover.Props> = {}) {
  const service = useMachine(popover.machine, { id: useId(), ...props })
  return popover.connect(service, normalizeProps)
}

function Trigger(props: { api: popover.Api; label?: string }) {
  return (
    <button className={styles.Trigger} {...props.api.getTriggerProps()}>
      {props.label ?? "Share"}
    </button>
  )
}

function Content(props: {
  api: popover.Api
  arrow?: boolean
  title?: string
  description?: string
  children?: React.ReactNode
}) {
  const { api } = props
  return (
    <Portal>
      <div {...api.getPositionerProps()}>
        <div className={styles.Content} {...api.getContentProps()}>
          {props.arrow && (
            <div className={styles.Arrow} {...api.getArrowProps()}>
              <div className={styles.ArrowTip} {...api.getArrowTipProps()} />
            </div>
          )}
          <div className={styles.Body}>
            <strong {...api.getTitleProps()}>
              {props.title ?? "Share this page"}
            </strong>
            <p {...api.getDescriptionProps()}>
              {props.description ?? "Anyone with the link can view it."}
            </p>
            {props.children ?? (
              <button className={styles.ActionButton}>Copy link</button>
            )}
          </div>
          <button
            className={styles.CloseTrigger}
            {...api.getCloseTriggerProps()}
          >
            <HiX />
          </button>
        </div>
      </div>
    </Portal>
  )
}

export function PopoverInitialFocus() {
  const inputRef = useRef<HTMLInputElement>(null)
  const api = usePopover({ initialFocusEl: () => inputRef.current })
  return (
    <Stack>
      <Trigger api={api} label="Rename" />
      <Content
        api={api}
        title="Rename file"
        description="The input gets focus when this opens."
      >
        <input ref={inputRef} defaultValue="report.pdf" />
      </Content>
    </Stack>
  )
}

export function PopoverModal() {
  const api = usePopover({ modal: true })
  return (
    <Stack>
      <Trigger api={api} />
      <Content
        api={api}
        description="Focus is trapped here and the page behind can't be clicked."
      />
    </Stack>
  )
}

export function PopoverCloseBehavior() {
  const api = usePopover({ closeOnInteractOutside: false })
  return (
    <Stack>
      <Trigger api={api} />
      <Content
        api={api}
        description="Clicking outside won't close this. Press Esc or use the close button."
      />
    </Stack>
  )
}

export function PopoverControlled() {
  const [open, setOpen] = useState(false)
  const api = usePopover({
    open,
    onOpenChange: (details) => setOpen(details.open),
  })
  return (
    <Stack>
      <Row>
        <Trigger api={api} />
        <Ghost onClick={() => setOpen((current) => !current)}>
          {open ? "Close" : "Open"} from outside
        </Ghost>
      </Row>
      <Content api={api} />
    </Stack>
  )
}

export function PopoverArrow() {
  const api = usePopover()
  return (
    <Stack>
      <Trigger api={api} />
      <Content api={api} arrow />
    </Stack>
  )
}

export function PopoverPlacement() {
  const api = usePopover({ positioning: { placement: "top-start" } })
  return (
    <Stack>
      <Trigger api={api} />
      <Content api={api} arrow />
    </Stack>
  )
}

export function PopoverOpenChange() {
  const [open, setOpen] = useState(false)
  const api = usePopover({ onOpenChange: (details) => setOpen(details.open) })
  return (
    <Stack>
      <Trigger api={api} />
      <Content api={api} />
      <Log label="open" value={String(open)} />
    </Stack>
  )
}

export function PopoverMultipleTriggers() {
  const [active, setActive] = useState("—")
  const api = usePopover({
    onTriggerValueChange: (details) => setActive(details.value ?? "—"),
  })
  return (
    <Stack>
      <Row>
        <button
          className={styles.Trigger}
          {...api.getTriggerProps({ value: "info" })}
        >
          Info
        </button>
        <button
          className={styles.Trigger}
          {...api.getTriggerProps({ value: "help" })}
        >
          Help
        </button>
      </Row>
      <Content
        api={api}
        arrow
        title={api.triggerValue === "info" ? "Info" : "Help"}
        description={
          api.triggerValue === "info"
            ? "Details about this page."
            : "Need a hand? Read the guides."
        }
      />
      <Log label="triggerValue" value={active} />
    </Stack>
  )
}
