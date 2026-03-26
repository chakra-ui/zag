import styles from "../../../../shared/src/css/tags-input.module.css"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as tagsInput from "@zag-js/tags-input"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

function toDashCase(str: string) {
  return str.replace(/\s+/g, "-").toLowerCase()
}

/**
 * Demo for GitHub #78 and #2928: Allow duplicate tags.
 * Set allowDuplicates: true to add the same tag multiple times.
 * Previously, duplicates were always prevented, so validate could not allow them.
 */
export default function Page() {
  const service = useMachine(tagsInput.machine, {
    id: useId(),
    defaultValue: ["React", "Vue"],
    allowDuplicates: true,
  })

  const api = tagsInput.connect(service, normalizeProps)

  return (
    <>
      <main className="tags-input">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()} className={styles.Label}>Add tags (duplicates allowed):</label>
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
            <input placeholder="Try adding React or Vue again..." {...api.getInputProps()} className={styles.Input} />
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
