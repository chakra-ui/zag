import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tagsInput from "@zag-js/tags-input"
import { createMemo, createUniqueId, For } from "solid-js"
import { tagsInputControls } from "@zag-js/shared"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

function toDashCase(str: string) {
  return str.replace(/\s+/g, "-").toLowerCase()
}

export default function Page() {
  const controls = useControls(tagsInputControls)

  const service = useMachine(tagsInput.machine, {
    id: createUniqueId(),
    defaultValue: ["React", "Vue"],
  })

  const api = createMemo(() => tagsInput.connect(service, normalizeProps))

  return (
    <>
      <main class="tags-input">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Enter frameworks:</label>
          <div {...api().getControlProps()}>
            <For each={api().value}>
              {(value, index) => (
                <span {...api().getItemProps({ index: index(), value })}>
                  <div
                    data-testid={`${toDashCase(value)}-tag`}
                    {...api().getItemPreviewProps({ index: index(), value })}
                  >
                    <span
                      data-testid={`${toDashCase(value)}-valuetext`}
                      {...api().getItemTextProps({ index: index(), value })}
                    >
                      {value}{" "}
                    </span>
                    <button
                      data-testid={`${toDashCase(value)}-close-button`}
                      {...api().getItemDeleteTriggerProps({ index: index(), value })}
                    >
                      &#x2715;
                    </button>
                  </div>
                  <input
                    data-testid={`${toDashCase(value)}-input`}
                    {...api().getItemInputProps({ index: index(), value })}
                  />
                </span>
              )}
            </For>
            <input data-testid="input" placeholder="add tag" {...api().getInputProps()} />
          </div>
          <input {...api().getHiddenInputProps()} />
        </div>
      </main>

      {/* <Toolbar viz controls={controls}>
        <StateVisualizer state={service} context={["value"]} />
      </Toolbar> */}
    </>
  )
}
