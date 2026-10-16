import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { Output } from "~/components/output"
import "@styles/slider.css"

const minBudget = 50

export default function Page() {
  const [invalid, setInvalid] = createSignal(false)
  const [submitted, setSubmitted] = createSignal<Record<string, FormDataEntryValue> | null>(null)

  const id = createUniqueId()
  const service = useMachine(slider.machine, () => ({
    id,
    name: "budget",
    defaultValue: [20],
    thumbSize: 20,
    invalid: invalid(),
    onValueChange() {
      setInvalid(false)
    },
  }))

  const api = createMemo(() => slider.connect(service, normalizeProps))

  return (
    <main>
      <form
        class="vstack gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          const data = Object.fromEntries(new FormData(event.currentTarget))
          if (Number(data.budget) < minBudget) return setInvalid(true)
          setSubmitted(data)
        }}
        onReset={() => {
          setInvalid(false)
          setSubmitted(null)
        }}
      >
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Budget</label>
          <output {...api().getValueTextProps()}>${api().value[0]}</output>
          <div {...api().getControlProps()}>
            <div {...api().getTrackProps()}>
              <div {...api().getRangeProps()} />
            </div>
            <Index each={api().value}>
              {(_, index) => (
                <div {...api().getThumbProps({ index })}>
                  <input {...api().getHiddenInputProps({ index })} />
                </div>
              )}
            </Index>
          </div>
        </div>
        <Show when={invalid()}>
          <p class="slider-error">Budget must be at least ${minBudget}</p>
        </Show>
        <div class="hstack">
          <button type="submit">Submit</button>
          <button type="reset">Reset</button>
        </div>
      </form>
      <Output label="Submitted" value={submitted() ?? "—"} />
    </main>
  )
}
