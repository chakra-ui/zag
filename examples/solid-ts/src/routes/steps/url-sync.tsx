import { useSearchParams } from "@solidjs/router"
import { normalizeProps, useMachine } from "@zag-js/solid"
import * as steps from "@zag-js/steps"
import { createMemo, createSignal, createUniqueId, Index, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/steps.css"

// Keep the URL readable instead of exposing `steps.COMPLETE`
const toSlug = (value: string | null) => (value === steps.COMPLETE ? "confirmation" : (value ?? "contact"))
const fromSlug = (slug: string | null) => (slug === "confirmation" ? steps.COMPLETE : (slug ?? "contact"))

export default function Page() {
  const [searchParams, setSearchParams] = useSearchParams<{ step?: string }>()

  const [email, setEmail] = createSignal("")
  const [address, setAddress] = createSignal("")
  const [digitalOnly, setDigitalOnly] = createSignal(false)

  const items = createMemo<steps.StepItem[]>(() => [
    { value: "contact", title: "Contact", invalid: !email().includes("@") },
    // Digital goods need no shipping
    { value: "shipping", title: "Shipping", invalid: !address().trim(), disabled: digitalOnly() },
    { value: "payment", title: "Payment" },
  ])

  const service = useMachine(steps.machine, {
    id: createUniqueId(),
    get items() {
      return items()
    },
    linear: true,
    // The URL is the source of truth, so browser Back/Forward moves between steps
    get value() {
      return fromSlug(searchParams.step ?? null)
    },
    onValueChange({ value }) {
      setSearchParams({ step: toSlug(value) })
    },
  })

  const api = createMemo(() => steps.connect(service, normalizeProps))

  return (
    <>
      <main class="steps">
        <div {...api().getRootProps()}>
          <div {...api().getListProps()}>
            <Index each={api().items}>
              {(item, index) => (
                <div {...api().getItemProps({ value: item().value })}>
                  <button {...api().getTriggerProps({ value: item().value })}>
                    <div {...api().getIndicatorProps({ value: item().value })}>{index + 1}</div>
                    <span>{item().title}</span>
                  </button>
                  <div {...api().getSeparatorProps({ value: item().value })} />
                </div>
              )}
            </Index>
          </div>

          <div {...api().getContentProps({ value: "contact" })} class="steps-form">
            <label>
              Email
              <input type="email" value={email()} onInput={(e) => setEmail(e.currentTarget.value)} />
            </label>
            <label style={{ "flex-direction": "row" }}>
              <input
                type="checkbox"
                checked={digitalOnly()}
                onChange={(e) => setDigitalOnly(e.currentTarget.checked)}
              />
              My cart only has digital items
            </label>
          </div>

          <div {...api().getContentProps({ value: "shipping" })} class="steps-form">
            <label>
              Address
              <input value={address()} onInput={(e) => setAddress(e.currentTarget.value)} />
            </label>
          </div>

          <div {...api().getContentProps({ value: "payment" })}>
            <p>Card ending in 4242</p>
          </div>

          <div {...api().getContentProps({ value: steps.COMPLETE })}>
            <p>Order placed. A receipt is on its way to {email()}.</p>
          </div>

          <Show when={!api().complete}>
            <div class="steps-actions">
              <button {...api().getPreviousTriggerProps()}>Back</button>
              <button {...api().getNextTriggerProps()}>{api().canComplete ? "Place order" : "Continue"}</button>
            </div>
          </Show>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
