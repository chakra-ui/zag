import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as toast from "@zag-js/toast"
import { useId, useRef, useState } from "react"
import { HiX } from "react-icons/hi"
import styles from "../../styles/machines/toast.module.css"
import { Button, Log, Row, Stack } from "./shared"

function useToaster(props: toast.StoreProps = {}) {
  const [store] = useState(() =>
    toast.createStore({ placement: "bottom-end", ...props }),
  )
  return store
}

function Toaster(props: { store: toast.Store }) {
  const service = useMachine(toast.group.machine, {
    id: useId(),
    store: props.store,
  })
  const api = toast.group.connect(service, normalizeProps)
  return (
    <Portal>
      <div {...api.getGroupProps()}>
        {api.getToasts().map((item, index) => (
          <Toast key={item.id} actor={item} index={index} parent={service} />
        ))}
      </div>
    </Portal>
  )
}

function Toast(props: {
  actor: toast.Options<React.ReactNode>
  index: number
  parent: toast.GroupService
}) {
  const { actor, index, parent } = props
  const service = useMachine(toast.machine, { ...actor, index, parent })
  const api = toast.connect(service, normalizeProps)
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <span {...api.getGhostBeforeProps()} />
      <div className={styles.Body}>
        <div className={styles.Title} {...api.getTitleProps()}>
          {api.type === "loading" && <span className={styles.Spinner} />}
          {api.title}
        </div>
        {api.description && (
          <div className={styles.Description} {...api.getDescriptionProps()}>
            {api.description}
          </div>
        )}
        {actor.action && (
          <button
            className={styles.ActionTrigger}
            {...api.getActionTriggerProps()}
          >
            {actor.action.label}
          </button>
        )}
      </div>
      <button className={styles.CloseTrigger} {...api.getCloseTriggerProps()}>
        <HiX />
      </button>
      <span {...api.getGhostAfterProps()} />
    </div>
  )
}

const types = ["info", "success", "warning", "error", "loading"] as const

export function ToastTypes() {
  const toaster = useToaster()
  return (
    <Row>
      {types.map((type) => (
        <Button
          key={type}
          onClick={() =>
            toaster.create({
              title: "Hello World",
              description: "This is a toast",
              type,
            })
          }
        >
          {type}
        </Button>
      ))}
      <Toaster store={toaster} />
    </Row>
  )
}

export function ToastPlacement() {
  const toaster = useToaster({ placement: "top-start" })
  return (
    <>
      <Button onClick={() => toaster.create({ title: "Placed top-start" })}>
        Show toast
      </Button>
      <Toaster store={toaster} />
    </>
  )
}

export function ToastOverlap() {
  const toaster = useToaster({ overlap: true })
  const count = useRef(0)
  return (
    <>
      <Button
        onClick={() => {
          count.current += 1
          toaster.create({
            title: `Toast ${count.current}`,
            description: "Hover the stack to expand it",
          })
        }}
      >
        Add toast
      </Button>
      <Toaster store={toaster} />
    </>
  )
}

export function ToastDuration() {
  const toaster = useToaster()
  return (
    <>
      <Button
        onClick={() =>
          toaster.create({
            title: "Hello World",
            description: "This is a toast",
            type: "info",
            duration: 6000,
          })
        }
      >
        Show for 6 seconds
      </Button>
      <Toaster store={toaster} />
    </>
  )
}

export function ToastProgrammatic() {
  const toaster = useToaster()
  const [id, setId] = useState<string>()
  return (
    <Stack>
      <Row>
        <Button
          onClick={() =>
            setId(
              toaster.create({
                title: "Hello World",
                description: "This is a toast",
                type: "info",
                duration: 6000,
              }),
            )
          }
        >
          Create
        </Button>
        <Button
          disabled={!id}
          onClick={() =>
            id &&
            toaster.update(id, {
              title: "Hello World",
              description: "This is a toast",
              type: "success",
            })
          }
        >
          Update
        </Button>
        <Button disabled={!id} onClick={() => id && toaster.dismiss(id)}>
          Dismiss
        </Button>
        <Button disabled={!id} onClick={() => id && toaster.remove(id)}>
          Remove
        </Button>
      </Row>
      <Log label="id" value={id ?? "—"} />
      <Toaster store={toaster} />
    </Stack>
  )
}

const settle = (ok: boolean) =>
  new Promise<string>((resolve, reject) =>
    setTimeout(
      () => (ok ? resolve("done") : reject(new Error("failed"))),
      1500,
    ),
  )

export function ToastPromise() {
  const toaster = useToaster()
  const [result, setResult] = useState("—")
  const run = (ok: boolean) => {
    const toastPromise = toaster.promise(settle(ok), {
      loading: {
        title: "Loading",
        description: "Please wait...",
      },
      success: () => ({
        title: "Success",
        description: "Your request has been completed",
      }),
      error: () => ({
        title: "Error",
        description: "An error has occurred",
      }),
    })
    setResult("pending")
    toastPromise
      ?.unwrap()
      .then((value) => setResult(value))
      .catch((error: Error) => setResult(error.message))
  }
  return (
    <Stack>
      <Row>
        <Button onClick={() => run(true)}>Resolve</Button>
        <Button onClick={() => run(false)}>Reject</Button>
      </Row>
      <Log label="unwrap()" value={result} />
      <Toaster store={toaster} />
    </Stack>
  )
}

export function ToastPause() {
  const toaster = useToaster({ pauseOnPageIdle: true })
  const [id, setId] = useState<string>()
  const [paused, setPaused] = useState(false)
  return (
    <Stack>
      <Row>
        <Button
          onClick={() => {
            setPaused(false)
            setId(toaster.create({ title: "Pausable toast", duration: 5000 }))
          }}
        >
          Create
        </Button>
        <Button
          disabled={!id}
          onClick={() => {
            if (!id) return
            toaster.pause(id)
            setPaused(true)
          }}
        >
          Pause
        </Button>
        <Button
          disabled={!id}
          onClick={() => {
            if (!id) return
            toaster.resume(id)
            setPaused(false)
          }}
        >
          Resume
        </Button>
      </Row>
      <Log label="paused" value={String(paused)} />
      <Toaster store={toaster} />
    </Stack>
  )
}

export function ToastMax() {
  const toaster = useToaster({ max: 3 })
  const count = useRef(0)
  return (
    <Stack>
      <Button
        onClick={() => {
          for (let i = 0; i < 5; i++) {
            count.current += 1
            toaster.create({ title: `Toast ${count.current}`, duration: 2500 })
          }
        }}
      >
        Add 5 toasts
      </Button>
      <Toaster store={toaster} />
    </Stack>
  )
}

export function ToastPriority() {
  const toaster = useToaster({ max: 1 })
  return (
    <Stack>
      <Button
        onClick={() => {
          toaster.create({ title: "Info 1", type: "info", duration: 2000 })
          toaster.create({ title: "Info 2", type: "info", duration: 2000 })
          toaster.create({ title: "Info 3", type: "info", duration: 2000 })
          toaster.create({
            title: "Critical update",
            type: "info",
            priority: 1,
            duration: 2000,
          })
        }}
      >
        Queue 4 toasts
      </Button>
      <Toaster store={toaster} />
    </Stack>
  )
}

export function ToastStatus() {
  const toaster = useToaster()
  const [status, setStatus] = useState("—")
  return (
    <Stack>
      <Button
        onClick={() =>
          toaster.info({
            title: "Hello World",
            description: "This is a toast",
            type: "info",
            duration: 3000,
            onStatusChange: (details) => {
              setStatus(details.status)
            },
          })
        }
      >
        Show toast
      </Button>
      <Log label="onStatusChange" value={status} />
      <Toaster store={toaster} />
    </Stack>
  )
}

export function ToastGap() {
  const toaster = useToaster({ gap: 24 })
  const count = useRef(0)
  return (
    <>
      <Button
        onClick={() => {
          count.current += 1
          toaster.create({ title: `Toast ${count.current}` })
        }}
      >
        Add toast
      </Button>
      <Toaster store={toaster} />
    </>
  )
}

export function ToastOffset() {
  const toaster = useToaster({ offsets: "24px" })
  return (
    <>
      <Button onClick={() => toaster.create({ title: "24px from the edges" })}>
        Show toast
      </Button>
      <Toaster store={toaster} />
    </>
  )
}

export const toastExamples = {
  ToastTypes,
  ToastPlacement,
  ToastOverlap,
  ToastDuration,
  ToastProgrammatic,
  ToastPromise,
  ToastPause,
  ToastMax,
  ToastPriority,
  ToastStatus,
  ToastGap,
  ToastOffset,
}
