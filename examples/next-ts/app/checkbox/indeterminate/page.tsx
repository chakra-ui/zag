"use client"

import * as checkbox from "@zag-js/checkbox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { CheckIcon, MinusIcon } from "lucide-react"
import { useId, useState } from "react"
import { Checkbox } from "@/components/checkbox"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/checkbox.css"

const toppings = ["Cheese", "Mushrooms", "Olives"]

export default function Page() {
  const [selected, setSelected] = useState<string[]>(["Cheese"])

  // Derived from the children: none, some (indeterminate) or all
  const allState: checkbox.CheckedState =
    selected.length === 0 ? false : selected.length === toppings.length ? true : "indeterminate"

  const service = useMachine(checkbox.machine, {
    id: useId(),
    name: "all",
    checked: allState,
    onCheckedChange({ checked }) {
      setSelected(checked === true ? toppings : [])
    },
  })

  const api = checkbox.connect(service, normalizeProps)

  return (
    <>
      <main className="checkbox">
        <div className="vstack gap-3">
          <label {...api.getRootProps()}>
            <div {...api.getControlProps()}>
              <span {...api.getIndicatorProps()}>{api.indeterminate ? <MinusIcon /> : <CheckIcon />}</span>
            </div>
            <span {...api.getLabelProps()}>All toppings</span>
            <input {...api.getHiddenInputProps()} data-testid="hidden-input" />
          </label>

          <div className="checkbox-children">
            {toppings.map((topping) => (
              <Checkbox
                key={topping}
                label={topping}
                checked={selected.includes(topping)}
                onCheckedChange={({ checked }) =>
                  setSelected((prev) => (checked ? [...prev, topping] : prev.filter((item) => item !== topping)))
                }
              />
            ))}
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
