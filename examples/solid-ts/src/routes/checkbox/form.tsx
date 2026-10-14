import { createSignal, Show } from "solid-js"
import { Checkbox } from "~/components/checkbox"
import "@styles/checkbox.css"

export default function Page() {
  const [accepted, setAccepted] = createSignal(false)
  const [submitted, setSubmitted] = createSignal(false)
  const [result, setResult] = createSignal<string | null>(null)

  const invalid = () => submitted() && !accepted()

  return (
    <main class="checkbox">
      <form
        class="vstack gap-4"
        novalidate
        onSubmit={(event) => {
          event.preventDefault()
          setSubmitted(true)
          if (!accepted()) return setResult(null)
          // The hidden input posts `name=value` like a native checkbox
          setResult(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))))
        }}
      >
        <Checkbox name="newsletter" value="weekly" label="Subscribe to the weekly newsletter" defaultChecked />
        <Checkbox
          name="terms"
          label="I agree to the terms"
          required
          invalid={invalid()}
          checked={accepted()}
          onCheckedChange={({ checked }) => setAccepted(checked === true)}
        />
        <Show when={invalid()}>
          <p class="checkbox-error">You need to accept the terms to continue.</p>
        </Show>

        <div class="hstack">
          <button type="submit" data-variant="solid">
            Submit
          </button>
          <Show when={result()}>
            <code class="checkbox-description">{result()}</code>
          </Show>
        </div>
      </form>
    </main>
  )
}
