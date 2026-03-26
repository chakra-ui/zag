import styles from "../../../../shared/src/css/tags-input.module.css"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as tagsInput from "@zag-js/tags-input"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

function toDashCase(str: string) {
  return str.replace(/\s+/g, "-").toLowerCase()
}

/**
 * Custom validate example: only allow lowercase alphabetic tags.
 * Duplicates are prevented by default. Use onValueInvalid for feedback.
 */
export default function Page() {
  const [invalidReason, setInvalidReason] = useState<string | null>(null)

  const service = useMachine(tagsInput.machine, {
    id: useId(),
    defaultValue: ["react", "vue"],
    validate(details) {
      return /^[a-z]+$/.test(details.inputValue)
    },
    onValueChange() {
      setInvalidReason(null)
    },
    onValueInvalid(details) {
      setInvalidReason(details.reason)
    },
  })

  const api = tagsInput.connect(service, normalizeProps)

  return (
    <>
      <main className="tags-input">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()} className={styles.Label}>Lowercase letters only:</label>
          <div {...api.getControlProps()} className={styles.Control}>
            {api.value.map((value, index) => (
              <span key={`${toDashCase(value)}-tag-${index}`} {...api.getItemProps({ index, value })}>
                <div {...api.getItemPreviewProps({ index, value })} className={styles.ItemPreview}>
                  <span {...api.getItemTextProps({ index, value })}>{value} </span>
                  <button {...api.getItemDeleteTriggerProps({ index, value })} className={styles.ItemDeleteTrigger}>&#x2715;</button>
                </div>
                <input {...api.getItemInputProps({ index, value })} />
              </span>
            ))}
            <input placeholder="Try: svelte or React (rejected)" {...api.getInputProps()} className={styles.Input} />
            <button {...api.getClearTriggerProps()} className={styles.ClearTrigger}>Clear all</button>
          </div>
          {invalidReason && <p style={{ marginTop: 8, fontSize: 14, color: "red" }}>Invalid: {invalidReason}</p>}
          <input {...api.getHiddenInputProps()} />
        </div>
      </main>
      <Toolbar controls={null}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
