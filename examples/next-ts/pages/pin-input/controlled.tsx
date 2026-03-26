import styles from "../../../../shared/src/css/pin-input.module.css"
import * as pinInput from "@zag-js/pin-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default function Page() {
  const [value, setValue] = useState(["", "", ""])

  const service = useMachine(pinInput.machine, {
    id: useId(),
    name: "test",
    count: 3,
    value,
    onValueChange(details) {
      setValue(details.value)
    },
  })

  const api = pinInput.connect(service, normalizeProps)

  return (
    <>
      <main className="pin-input">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            console.log("submitted:", value.join(""))
          }}
        >
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()} className={styles.Label}>Enter code:</label>
            <div {...api.getControlProps()} className={styles.Control}>
              {api.items.map((index) => (
                <input key={index} data-testid={`input-${index + 1}`} {...api.getInputProps({ index })} className={styles.Input} />
              ))}
            </div>
            <input {...api.getHiddenInputProps()} />
          </div>

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button type="button" data-testid="clear-button" onClick={api.clearValue}>
              Clear
            </button>
            <button type="button" onClick={api.focus}>
              Focus
            </button>
            <button type="button" data-testid="set-value" onClick={() => setValue(["1", "2", "3"])}>
              Set 1-2-3
            </button>
            <button type="button" data-testid="reset-value" onClick={() => setValue(["", "", ""])}>
              Reset
            </button>
          </div>
        </form>

        <div style={{ marginTop: "1rem", padding: "0.5rem", background: "#f5f5f5", borderRadius: "4px" }}>
          <strong>Controlled value:</strong> [{value.map((v) => `"${v}"`).join(", ")}]
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} context={["value", "focusedIndex"]} />
      </Toolbar>
    </>
  )
}
