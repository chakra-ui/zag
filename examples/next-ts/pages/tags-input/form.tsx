import { normalizeProps, useMachine } from "@zag-js/react"
import { tagsInputControls } from "@zag-js/shared"
import * as tagsInput from "@zag-js/tags-input"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

function toDashCase(str: string) {
  return str.replace(/\s+/g, "-").toLowerCase()
}

export default function Page() {
  const controls = useControls(tagsInputControls)

  const [submitCount, setSubmitCount] = useState(0)
  const [lastSubmit, setLastSubmit] = useState<string | null>(null)

  const service = useMachine(tagsInput.machine, {
    id: useId(),
    name: "tags",
    defaultValue: ["React", "Vue"],
    ...controls.context,
  })

  const api = tagsInput.connect(service, normalizeProps)

  return (
    <>
      <main className="tags-input">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const data = new FormData(e.currentTarget)
            const value = String(data.get("tags") ?? "")
            setSubmitCount((c) => c + 1)
            setLastSubmit(value)
          }}
        >
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>Enter frameworks:</label>
            <div {...api.getControlProps()}>
              {api.value.map((value, index) => (
                <span key={`${toDashCase(value)}-tag-${index}`} {...api.getItemProps({ index, value })}>
                  <div data-testid={`${toDashCase(value)}-tag`} {...api.getItemPreviewProps({ index, value })}>
                    <span data-testid={`${toDashCase(value)}-valuetext`} {...api.getItemTextProps({ index, value })}>
                      {value}{" "}
                    </span>
                    <button
                      data-testid={`${toDashCase(value)}-close-button`}
                      {...api.getItemDeleteTriggerProps({ index, value })}
                    >
                      &#x2715;
                    </button>
                  </div>
                  <input data-testid={`${toDashCase(value)}-input`} {...api.getItemInputProps({ index, value })} />
                </span>
              ))}
              <input data-testid="input" placeholder="add tag" {...api.getInputProps()} />
              <button type="button" {...api.getClearTriggerProps()}>
                X
              </button>
            </div>
            <input {...api.getHiddenInputProps()} />
          </div>

          <div style={{ marginTop: 16 }}>
            <button type="submit">Submit</button>
          </div>
        </form>

        <section style={{ marginTop: 16 }}>
          <strong>submit count:</strong> <span data-testid="submit-count">{submitCount}</span>
          <br />
          <strong>last submitted value:</strong> <span data-testid="last-submit">{lastSubmit ?? "—"}</span>
        </section>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
