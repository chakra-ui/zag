import styles from "../../../../shared/src/css/tags-input.module.css"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as tagsInput from "@zag-js/tags-input"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

function toKey(value: string, index: number) {
  const safe = value.replace(/\s/g, "space").replace(/,/g, "comma")
  return `${safe}-${index}`
}

/**
 * Demo for GitHub #2928: Sentence builder with repeatable tokens.
 * Use case: predefined tokens (e.g. ",", " ") or custom values that can repeat.
 * Each token can be used multiple times with different separators per item.
 */
export default function Page() {
  const service = useMachine(tagsInput.machine, {
    id: useId(),
    defaultValue: ["Hello", ",", " ", "world", "!"],
    allowDuplicates: true,
    delimiter: /[,\s]+/,
    addOnPaste: true,
    editable: true,
  })

  const api = tagsInput.connect(service, normalizeProps)

  return (
    <>
      <main className="tags-input">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()} className={styles.Label}>Sentence builder (tokens can repeat):</label>
          <div {...api.getControlProps()} className={styles.Control}>
            {api.value.map((value, index) => (
              <span key={toKey(value, index)} {...api.getItemProps({ index, value })}>
                <div {...api.getItemPreviewProps({ index, value })} className={styles.ItemPreview}>
                  <span {...api.getItemTextProps({ index, value })}>{value} </span>
                  <button {...api.getItemDeleteTriggerProps({ index, value })} className={styles.ItemDeleteTrigger}>&#x2715;</button>
                </div>
                <input {...api.getItemInputProps({ index, value })} />
              </span>
            ))}
            <input
              placeholder='Add tokens: type "Hello" or paste "a, b, a" (comma/space splits)'
              {...api.getInputProps()} className={styles.Input}
            />
            <button {...api.getClearTriggerProps()} className={styles.ClearTrigger}>Clear all</button>
          </div>
          <input {...api.getHiddenInputProps()} />
        </div>
      </main>
      <Toolbar controls={null}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
