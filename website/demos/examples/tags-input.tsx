import { normalizeProps, useMachine } from "@zag-js/react"
import * as tagsInput from "@zag-js/tags-input"
import { useId, useState } from "react"
import styles from "../../styles/machines/tags-input.module.css"
import { Ghost, Log, Row, Stack, show } from "./shared"

function useTagsInput(props: Partial<tagsInput.Props> = {}) {
  const service = useMachine(tagsInput.machine, {
    id: useId(),
    defaultValue: ["React", "Vue"],
    placeholder: "Add tag…",
    ...props,
  })
  return tagsInput.connect(service, normalizeProps)
}

function Field(props: { api: tagsInput.Api; clearable?: boolean }) {
  const { api } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <label className={styles.Label} {...api.getLabelProps()}>
        Frameworks
      </label>
      <div className={styles.Control} {...api.getControlProps()}>
        {api.value.map((value, index) => {
          const item = { index, value }
          return (
            <span key={`${value}-${index}`} {...api.getItemProps(item)}>
              <div
                className={styles.ItemPreview}
                {...api.getItemPreviewProps(item)}
              >
                <span {...api.getItemTextProps(item)}>{value}</span>
                <button
                  className={styles.ItemDeleteTrigger}
                  {...api.getItemDeleteTriggerProps(item)}
                >
                  ✕
                </button>
              </div>
              <input
                className={styles.ItemInput}
                {...api.getItemInputProps(item)}
              />
            </span>
          )
        })}
        <input className={styles.Input} {...api.getInputProps()} />
        {props.clearable && (
          <button
            className={styles.ClearTrigger}
            {...api.getClearTriggerProps()}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

export function TagsInputInitialValue() {
  const api = useTagsInput({
    defaultValue: ["React", "Redux", "TypeScript"],
  })
  return <Field api={api} />
}

export function TagsInputControlled() {
  const [value, setValue] = useState(["React", "Vue"])
  const api = useTagsInput({
    value,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <Field api={api} />
      <Row>
        <Ghost onClick={() => setValue(["Solid", "Svelte"])}>
          Set Solid, Svelte
        </Ghost>
        <Ghost onClick={() => setValue([])}>Clear</Ghost>
      </Row>
      <Log label="value" value={show(value)} />
    </Stack>
  )
}

export function TagsInputControlledInput() {
  const [inputValue, setInputValue] = useState("")
  const api = useTagsInput({
    inputValue,
    onInputValueChange: (details) => setInputValue(details.inputValue),
  })
  return (
    <Stack>
      <Field api={api} />
      <Ghost onClick={() => setInputValue("Preact")}>Type “Preact”</Ghost>
      <Log label="inputValue" value={show(inputValue)} />
    </Stack>
  )
}

export function TagsInputClear() {
  const api = useTagsInput()
  return <Field api={api} clearable />
}

export function TagsInputMax() {
  const [reason, setReason] = useState<string>()
  const api = useTagsInput({
    max: 3,
    allowOverflow: true,
    onValueInvalid: (details) => setReason(details.reason),
  })
  return (
    <Stack>
      <Field api={api} />
      <Log label="count" value={`${api.count} / 3 · ${show(reason)}`} />
    </Stack>
  )
}

export function TagsInputValidate() {
  const [reason, setReason] = useState<string>()
  const api = useTagsInput({
    defaultValue: ["react", "vue"],
    validate: (details) => /^[a-z]+$/.test(details.inputValue),
    onValueInvalid: (details) => setReason(details.reason),
    placeholder: "lowercase only",
  })
  return (
    <Stack>
      <Field api={api} />
      <Log label="onValueInvalid" value={show(reason)} />
    </Stack>
  )
}

export function TagsInputDuplicates() {
  const api = useTagsInput({
    allowDuplicates: true,
    placeholder: "Try React again",
  })
  return (
    <Stack>
      <Field api={api} />
      <Log label="value" value={show(api.value)} />
    </Stack>
  )
}

export function TagsInputBlur() {
  const api = useTagsInput({
    blurBehavior: "add",
    placeholder: "Type, then click away",
  })
  return (
    <Stack>
      <Field api={api} />
      <Log label="value" value={show(api.value)} />
    </Stack>
  )
}

export function TagsInputPaste() {
  const api = useTagsInput({
    addOnPaste: true,
    placeholder: "Paste Solid, Svelte",
  })
  return (
    <Stack>
      <Field api={api} />
      <Log label="value" value={show(api.value)} />
    </Stack>
  )
}

export function TagsInputEditable() {
  const api = useTagsInput({
    editable: true,
    placeholder: "Double-click a tag",
  })
  return (
    <Stack>
      <Field api={api} />
      <Log label="value" value={show(api.value)} />
    </Stack>
  )
}

export function TagsInputDelimiter() {
  const api = useTagsInput({
    delimiter: ";",
    placeholder: "Separate with ;",
  })
  return (
    <Stack>
      <Field api={api} />
      <Log label="value" value={show(api.value)} />
    </Stack>
  )
}

export function TagsInputEvents() {
  const [value, setValue] = useState<string[]>()
  const [highlighted, setHighlighted] = useState<string | null>(null)
  const [invalid, setInvalid] = useState<string>()
  const api = useTagsInput({
    onValueChange: (details) => setValue(details.value),
    onHighlightChange: (details) => setHighlighted(details.highlightedValue),
    onValueInvalid: (details) => setInvalid(details.reason),
  })
  return (
    <Stack>
      <Field api={api} />
      <Log label="onValueChange" value={show(value)} />
      <Log label="onHighlightChange" value={show(highlighted)} />
      <Log label="onValueInvalid" value={show(invalid)} />
    </Stack>
  )
}

export function TagsInputProgrammatic() {
  const api = useTagsInput()
  return (
    <Stack>
      <Field api={api} />
      <Row>
        <Ghost onClick={() => api.addValue("React")}>addValue</Ghost>
        <Ghost onClick={() => api.setValue(["React", "TypeScript"])}>
          setValue
        </Ghost>
        <Ghost onClick={() => api.setValueAtIndex(0, "Vue")}>
          setValueAtIndex
        </Ghost>
        <Ghost onClick={() => api.clearValue()}>clearValue</Ghost>
        <Ghost onClick={() => api.focus()}>focus</Ghost>
      </Row>
    </Stack>
  )
}
