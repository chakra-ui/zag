import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as tooltip from "@zag-js/tooltip"
import { useId, useState } from "react"
import styles from "../../styles/machines/tooltip.module.css"
import { Ghost, Log, Row, Stack } from "./shared"

function useTooltip(props: Partial<tooltip.Props> = {}) {
  const service = useMachine(tooltip.machine, { id: useId(), ...props })
  return tooltip.connect(service, normalizeProps)
}

function Trigger(props: { api: tooltip.Api; label?: string }) {
  return (
    <button className={styles.Trigger} {...props.api.getTriggerProps()}>
      {props.label ?? "Hover me"}
    </button>
  )
}

function Content(props: {
  api: tooltip.Api
  arrow?: boolean
  children?: React.ReactNode
}) {
  const { api } = props
  if (!api.open) return null
  return (
    <Portal>
      <div {...api.getPositionerProps()}>
        <div className={styles.Content} {...api.getContentProps()}>
          {props.arrow && (
            <div className={styles.Arrow} {...api.getArrowProps()}>
              <div className={styles.ArrowTip} {...api.getArrowTipProps()} />
            </div>
          )}
          {props.children ?? "Copy to clipboard"}
        </div>
      </div>
    </Portal>
  )
}

export function TooltipTimings() {
  const api = useTooltip({ openDelay: 500, closeDelay: 200 })
  return (
    <Stack>
      <Trigger api={api} />
      <Content api={api}>Opens after 500ms, closes after 200ms</Content>
    </Stack>
  )
}

export function TooltipPlacement() {
  const api = useTooltip({ positioning: { placement: "bottom-start" } })
  return (
    <Stack>
      <Trigger api={api} />
      <Content api={api} arrow />
    </Stack>
  )
}

export function TooltipArrow() {
  const api = useTooltip()
  return (
    <Stack>
      <Trigger api={api} />
      <Content api={api} arrow />
    </Stack>
  )
}

export function TooltipDismiss() {
  const api = useTooltip({
    closeOnEscape: false,
    closeOnClick: false,
    closeOnPointerDown: false,
    closeOnScroll: false,
  })
  return (
    <Stack>
      <Trigger api={api} label="Hover, then click" />
      <Content api={api}>Clicking or pressing Esc keeps me open</Content>
    </Stack>
  )
}

export function TooltipInteractive() {
  const api = useTooltip({ interactive: true })
  return (
    <Stack>
      <Trigger api={api} />
      <Content api={api}>
        Move into me and{" "}
        <a href="#interactive" onClick={(event) => event.preventDefault()}>
          click this link
        </a>
      </Content>
    </Stack>
  )
}

export function TooltipOpenChange() {
  const [open, setOpen] = useState(false)
  const api = useTooltip({ onOpenChange: (details) => setOpen(details.open) })
  return (
    <Stack>
      <Trigger api={api} />
      <Content api={api} />
      <Log label="open" value={String(open)} />
    </Stack>
  )
}

export function TooltipMultipleTriggers() {
  const [active, setActive] = useState("—")
  const api = useTooltip({
    onTriggerValueChange: (details) => setActive(details.value ?? "—"),
  })
  return (
    <Stack>
      <Row>
        <button
          className={styles.Trigger}
          {...api.getTriggerProps({ value: "bold" })}
        >
          <b>B</b>
        </button>
        <button
          className={styles.Trigger}
          {...api.getTriggerProps({ value: "italic" })}
        >
          <i>I</i>
        </button>
      </Row>
      <Content api={api}>
        {api.triggerValue === "bold" ? "Bold" : "Italic"}
      </Content>
      <Log label="triggerValue" value={active} />
    </Stack>
  )
}

export function TooltipControlled() {
  const [open, setOpen] = useState(false)
  const api = useTooltip({
    open,
    onOpenChange: (details) => setOpen(details.open),
  })
  return (
    <Stack>
      <Row>
        <Trigger api={api} />
        <Ghost onClick={() => setOpen((current) => !current)}>
          {open ? "Hide" : "Show"} from outside
        </Ghost>
      </Row>
      <Content api={api} arrow />
    </Stack>
  )
}

export function TooltipProgrammatic() {
  const api = useTooltip()
  return (
    <Stack>
      <Row>
        <Trigger api={api} />
        <Ghost onClick={() => api.setOpen(!api.open)}>
          api.setOpen({String(!api.open)})
        </Ghost>
      </Row>
      <Content api={api} arrow />
    </Stack>
  )
}
