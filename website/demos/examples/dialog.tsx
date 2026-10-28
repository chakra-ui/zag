import * as dialog from "@zag-js/dialog"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId, useRef, useState } from "react"
import { HiX } from "react-icons/hi"
import styles from "../../styles/machines/dialog.module.css"
import { Ghost, Log, Row, Stack } from "./shared"

function useDialog(props: Partial<dialog.Props> = {}) {
  const service = useMachine(dialog.machine, { id: useId(), ...props })
  return dialog.connect(service, normalizeProps)
}

function Trigger(props: { api: dialog.Api; label?: string }) {
  return (
    <button className={styles.Trigger} {...props.api.getTriggerProps()}>
      {props.label ?? "Edit profile"}
    </button>
  )
}

function Content(props: {
  api: dialog.Api
  title?: string
  description?: string
  children?: React.ReactNode
}) {
  const { api } = props
  return (
    <Portal>
      {api.modal && (
        <div className={styles.Backdrop} {...api.getBackdropProps()} />
      )}
      <div className={styles.Positioner} {...api.getPositionerProps()}>
        <div className={styles.Content} {...api.getContentProps()}>
          <h2 className={styles.Title} {...api.getTitleProps()}>
            {props.title ?? "Edit profile"}
          </h2>
          <p className={styles.Description} {...api.getDescriptionProps()}>
            {props.description ??
              "Make changes to your profile here. Click save when you are done."}
          </p>
          {props.children ?? (
            <div className={styles.Actions}>
              <input placeholder="Enter name..." />
              <button onClick={() => api.setOpen(false)}>Save</button>
            </div>
          )}
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

export function DialogInitialFocus() {
  const inputRef = useRef<HTMLInputElement>(null)
  const api = useDialog({ initialFocusEl: () => inputRef.current })
  return (
    <Stack>
      <Trigger api={api} />
      <Content api={api}>
        <div className={styles.Actions}>
          <input placeholder="First name" />
          <input ref={inputRef} placeholder="Focused on open" />
        </div>
      </Content>
    </Stack>
  )
}

export function DialogNonModal() {
  const [count, setCount] = useState(0)
  const api = useDialog({ modal: false })
  return (
    <Stack>
      <Row>
        <Trigger api={api} />
        <Ghost onClick={() => setCount((n) => n + 1)}>Click behind</Ghost>
      </Row>
      <Content api={api} />
      <Log label="clicks behind" value={count} />
    </Stack>
  )
}

export function DialogInteractOutside() {
  const api = useDialog({ closeOnInteractOutside: false })
  return (
    <Stack>
      <Trigger api={api} />
      <Content
        api={api}
        description="Clicking the backdrop won't close this dialog. Use the close button or Esc."
      />
    </Stack>
  )
}

export function DialogOpenChange() {
  const [open, setOpen] = useState(false)
  const api = useDialog({ onOpenChange: (details) => setOpen(details.open) })
  return (
    <Stack>
      <Trigger api={api} />
      <Content api={api} />
      <Log label="open" value={String(open)} />
    </Stack>
  )
}

export function DialogEscape() {
  const api = useDialog({ closeOnEscape: false })
  return (
    <Stack>
      <Trigger api={api} />
      <Content
        api={api}
        description="Pressing Esc won't close this dialog. Use the close button."
      />
    </Stack>
  )
}

export function DialogControlled() {
  const [open, setOpen] = useState(false)
  const api = useDialog({
    open,
    onOpenChange: (details) => setOpen(details.open),
  })
  return (
    <Stack>
      <Row>
        <Trigger api={api} />
        <Ghost onClick={() => setOpen(true)}>Open from outside</Ghost>
      </Row>
      <Content api={api} />
      <Log label="open" value={String(open)} />
    </Stack>
  )
}

export function DialogScroll() {
  const api = useDialog({ preventScroll: false })
  return (
    <Stack>
      <Trigger api={api} />
      <Content
        api={api}
        description="The page behind keeps scrolling while this dialog is open."
      />
    </Stack>
  )
}

export function DialogAlert() {
  const [result, setResult] = useState("—")
  const cancelRef = useRef<HTMLButtonElement>(null)
  const api = useDialog({
    role: "alertdialog",
    initialFocusEl: () => cancelRef.current,
  })
  const close = (value: string) => {
    setResult(value)
    api.setOpen(false)
  }
  return (
    <Stack>
      <Trigger api={api} label="Delete project" />
      <Content
        api={api}
        title="Delete project?"
        description="This permanently deletes the project and its files."
      >
        <div className={styles.Footer}>
          <button ref={cancelRef} onClick={() => close("cancelled")}>
            Cancel
          </button>
          <button data-variant="danger" onClick={() => close("deleted")}>
            Delete
          </button>
        </div>
      </Content>
      <Log label="result" value={result} />
    </Stack>
  )
}

const users = [
  { id: "1", name: "Alice Johnson" },
  { id: "2", name: "Bob Smith" },
]

export function DialogMultipleTriggers() {
  const [activeUser, setActiveUser] = useState<(typeof users)[number] | null>(
    null,
  )
  const api = useDialog({
    onTriggerValueChange({ value }) {
      setActiveUser(users.find((user) => user.id === value) ?? null)
    },
  })
  return (
    <Stack>
      <Row>
        {users.map((user) => (
          <button
            key={user.id}
            className={styles.Trigger}
            {...api.getTriggerProps({ value: user.id })}
          >
            Edit {user.name}
          </button>
        ))}
      </Row>
      <Content
        api={api}
        title={`Edit ${activeUser?.name ?? "user"}`}
        description="One dialog, shared by every trigger."
      />
      <Log label="triggerValue" value={api.triggerValue ?? "—"} />
    </Stack>
  )
}
