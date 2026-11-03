import * as editable from "@zag-js/editable"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import styles from "../../styles/machines/editable.module.css"
import { Ghost, Log, Row, Stack, show } from "./shared"

function useEditable(props: Partial<editable.Props> = {}) {
  const service = useMachine(editable.machine, {
    id: useId(),
    defaultValue: "Hello World",
    ...props,
  })
  return editable.connect(service, normalizeProps)
}

function Editable(props: { api: editable.Api; controls?: boolean }) {
  const { api } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <div className={styles.Area} {...api.getAreaProps()}>
        <input className={styles.Input} {...api.getInputProps()} />
        <span {...api.getPreviewProps()} />
      </div>
      {props.controls && (
        <div {...api.getControlProps()}>
          {!api.editing && (
            <button
              className={styles.EditTrigger}
              {...api.getEditTriggerProps()}
            >
              Edit
            </button>
          )}
          {api.editing && (
            <div className={styles.SubmitActions}>
              <button
                className={styles.SubmitTrigger}
                {...api.getSubmitTriggerProps()}
              >
                Save
              </button>
              <button
                className={styles.CancelTrigger}
                {...api.getCancelTriggerProps()}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function EditableDefaultValue() {
  const api = useEditable()
  return <Editable api={api} />
}

export function EditableControlled() {
  const [value, setValue] = useState("Draft title")
  const api = useEditable({
    value,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <Editable api={api} />
      <Ghost onClick={() => setValue("Final title")}>Set from outside</Ghost>
    </Stack>
  )
}

export function EditableControlledEdit() {
  const [edit, setEdit] = useState(false)
  const api = useEditable({
    edit,
    onEditChange: (details) => setEdit(details.edit),
  })
  return (
    <Stack>
      <Editable api={api} />
      <Row>
        <Ghost onClick={() => setEdit((e) => !e)}>
          {edit ? "Leave" : "Enter"} edit mode
        </Ghost>
      </Row>
      <Log label="edit" value={String(edit)} />
    </Stack>
  )
}

export function EditableValueChange() {
  const [changed, setChanged] = useState("—")
  const [committed, setCommitted] = useState("—")
  const api = useEditable({
    onValueChange: (details) => setChanged(show(details.value)),
    onValueCommit: (details) => setCommitted(show(details.value)),
  })
  return (
    <Stack>
      <Editable api={api} />
      <Log label="onValueChange" value={changed} />
      <Log label="onValueCommit" value={committed} />
    </Stack>
  )
}

export function EditableValueRevert() {
  const [reverted, setReverted] = useState("—")
  const api = useEditable({
    onValueRevert: (details) => setReverted(show(details.value)),
  })
  return (
    <Stack>
      <Editable api={api} />
      <Log label="onValueRevert" value={reverted} />
      <Log label="try" value="Edit, then press Escape" />
    </Stack>
  )
}

export function EditableCustomControls() {
  const api = useEditable()
  return <Editable api={api} controls />
}

export function EditableAutoResize() {
  const api = useEditable({ autoResize: true })
  return (
    <div {...api.getRootProps()}>
      <div className={styles.Area} {...api.getAreaProps()}>
        <input className={styles.Input} {...api.getInputProps()} />
        <span {...api.getPreviewProps()} />
      </div>
    </div>
  )
}

export function EditableDoubleClick() {
  const api = useEditable({ activationMode: "dblclick" })
  return (
    <Stack>
      <Editable api={api} />
      <Log label="try" value="Double-click the text" />
    </Stack>
  )
}

export function EditableSubmitMode() {
  const [committed, setCommitted] = useState("—")
  const api = useEditable({
    submitMode: "enter",
    onValueCommit: (details) => setCommitted(show(details.value)),
  })
  return (
    <Stack>
      <Editable api={api} />
      <Log label="commits on" value="Enter only" />
      <Log label="onValueCommit" value={committed} />
    </Stack>
  )
}

export function EditableTextarea() {
  const api = useEditable({ defaultValue: "Line one" })
  return (
    <Stack>
      <div className={styles.Root} {...api.getRootProps()}>
        <div className={styles.Area} {...api.getAreaProps()}>
          <textarea
            className={styles.Input}
            rows={3}
            {...(api.getInputProps() as React.ComponentProps<"textarea">)}
          />
          <span {...api.getPreviewProps()} />
        </div>
      </div>
      <Log label="commit with" value="Cmd/Ctrl + Enter" />
    </Stack>
  )
}

export function EditablePlaceholder() {
  const api = useEditable({
    defaultValue: "",
    placeholder: { preview: "Click to edit", edit: "Type a value" },
  })
  return <Editable api={api} />
}
