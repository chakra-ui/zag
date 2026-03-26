import styles from "../../../../shared/src/css/tags-input.module.css"
import { normalizeProps, useMachine } from "@zag-js/react"
import { tagsInputControls } from "@zag-js/shared"
import * as tagsInput from "@zag-js/tags-input"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

function toDashCase(str: string) {
  return str.replace(/\s+/g, "-").toLowerCase()
}

export default function Page() {
  const controls = useControls(tagsInputControls)

  const service = useMachine(tagsInput.machine, {
    id: useId(),
    defaultValue: ["React", "Vue"],
    ...controls.context,
  })

  const api = tagsInput.connect(service, normalizeProps)

  return (
    <>
      <main className="tags-input">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()} className={styles.Label}>Enter frameworks:</label>
          <div {...api.getControlProps()} className={styles.Control}>
            {api.value.map((value, index) => (
              <span key={`${toDashCase(value)}-tag-${index}`} {...api.getItemProps({ index, value })}>
                <div data-testid={`${toDashCase(value)}-tag`} {...api.getItemPreviewProps({ index, value })} className={styles.ItemPreview}>
                  <span data-testid={`${toDashCase(value)}-valuetext`} {...api.getItemTextProps({ index, value })}>
                    {value}{" "}
                  </span>
                  <button
                    data-testid={`${toDashCase(value)}-close-button`}
                    {...api.getItemDeleteTriggerProps({ index, value })} className={styles.ItemDeleteTrigger}
                  >
                    &#x2715;
                  </button>
                </div>
                <input data-testid={`${toDashCase(value)}-input`} {...api.getItemInputProps({ index, value })} />
              </span>
            ))}
            <input data-testid="input" placeholder="add tag" {...api.getInputProps()} className={styles.Input} />
            <button {...api.getClearTriggerProps()} className={styles.ClearTrigger}>X</button>
          </div>
          <input {...api.getHiddenInputProps()} />
        </div>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
