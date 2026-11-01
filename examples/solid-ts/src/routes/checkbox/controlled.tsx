import { createSignal } from "solid-js"
import { Checkbox } from "~/components/checkbox"
import "@styles/checkbox.css"

export default function Page() {
  const [checked, setChecked] = createSignal(false)

  return (
    <main class="checkbox">
      <div class="vstack gap-4">
        <Checkbox
          label="Email me product updates"
          description="State lives in the parent; the checkbox reports changes."
          checked={checked()}
          onCheckedChange={(details) => setChecked(details.checked === true)}
          data-testid="hidden-input"
        />

        <div class="hstack">
          <button type="button" onClick={() => setChecked((value) => !value)}>
            Toggle from outside
          </button>
          <span class="checkbox-description">checked: {String(checked())}</span>
        </div>
      </div>
    </main>
  )
}
