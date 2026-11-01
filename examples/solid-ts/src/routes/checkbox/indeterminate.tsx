import * as checkbox from "@zag-js/checkbox"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { CheckIcon, MinusIcon } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, For, Show } from "solid-js"
import { Checkbox } from "~/components/checkbox"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/checkbox.css"

const toppings = ["Cheese", "Mushrooms", "Olives"]

export default function Page() {
  const [selected, setSelected] = createSignal<string[]>(["Cheese"])

  // Derived from the children: none, some (indeterminate) or all
  const allState = (): checkbox.CheckedState =>
    selected().length === 0 ? false : selected().length === toppings.length ? true : "indeterminate"

  const id = createUniqueId()
  const service = useMachine(checkbox.machine, () => ({
    id,
    name: "all",
    checked: allState(),
    onCheckedChange({ checked }: checkbox.CheckedChangeDetails) {
      setSelected(checked === true ? toppings : [])
    },
  }))

  const api = createMemo(() => checkbox.connect(service, normalizeProps))

  return (
    <>
      <main class="checkbox">
        <div class="vstack gap-3">
          <label {...api().getRootProps()}>
            <div {...api().getControlProps()}>
              <span {...api().getIndicatorProps()}>
                <Show when={api().indeterminate} fallback={<CheckIcon />}>
                  <MinusIcon />
                </Show>
              </span>
            </div>
            <span {...api().getLabelProps()}>All toppings</span>
            <input {...api().getHiddenInputProps()} data-testid="hidden-input" />
          </label>

          <div class="checkbox-children">
            <For each={toppings}>
              {(topping) => (
                <Checkbox
                  label={topping}
                  checked={selected().includes(topping)}
                  onCheckedChange={({ checked }) =>
                    setSelected((prev) => (checked ? [...prev, topping] : prev.filter((item) => item !== topping)))
                  }
                />
              )}
            </For>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
