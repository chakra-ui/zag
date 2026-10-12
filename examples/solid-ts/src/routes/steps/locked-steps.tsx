import { normalizeProps, useMachine } from "@zag-js/solid"
import * as steps from "@zag-js/steps"
import { createMemo, createSignal, createUniqueId, For, Index, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/steps.css"

const backupCodes = ["7F3K-92QD", "M4XP-6TBR", "Q8WN-1JZC", "H2VL-5RYE"]

export default function Page() {
  const [password, setPassword] = createSignal("")
  const [code, setCode] = createSignal("")
  const [verifying, setVerifying] = createSignal(false)
  const [verified, setVerified] = createSignal(false)

  // Once verified, 2FA is on: the earlier steps can no longer be revisited
  const items = createMemo<steps.StepItem[]>(() => [
    { value: "password", title: "Confirm password", invalid: !password(), editable: !verified() },
    { value: "scan", title: "Scan QR code", editable: !verified() },
    { value: "verify", title: "Enter code", invalid: !/^\d{6}$/.test(code()), editable: !verified() },
  ])

  const service = useMachine(steps.machine, {
    id: createUniqueId(),
    get items() {
      return items()
    },
    linear: true,
  })

  const api = createMemo(() => steps.connect(service, normalizeProps))

  const verify = async () => {
    setVerifying(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setVerifying(false)
    setVerified(true)
    api().goToNextStep()
  }

  const cancel = () => {
    setPassword("")
    setCode("")
    setVerified(false)
    api().resetStep()
  }

  return (
    <>
      <main class="steps">
        <div {...api().getRootProps()}>
          <h2>Enable two-factor authentication</h2>

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

          <div {...api().getContentProps({ value: "password" })} class="steps-form">
            <label>
              Password
              <input type="password" value={password()} onInput={(e) => setPassword(e.currentTarget.value)} />
            </label>
          </div>

          <div {...api().getContentProps({ value: "scan" })}>
            <p>Scan this code with your authenticator app, or enter the key manually.</p>
            <code>JBSW Y3DP EHPK 3PXP</code>
          </div>

          <div {...api().getContentProps({ value: "verify" })} class="steps-form">
            <label>
              6-digit code
              <input inputMode="numeric" maxLength={6} value={code()} onInput={(e) => setCode(e.currentTarget.value)} />
            </label>
          </div>

          <div {...api().getContentProps({ value: steps.COMPLETE })}>
            <p>Two-factor authentication is on. Save these backup codes:</p>
            <ul>
              <For each={backupCodes}>
                {(backupCode) => (
                  <li>
                    <code>{backupCode}</code>
                  </li>
                )}
              </For>
            </ul>
          </div>

          <div class="steps-actions">
            <Show when={!api().complete} fallback={<button {...api().getPrevTriggerProps()}>Back</button>}>
              <button onClick={cancel}>Cancel</button>
              <button {...api().getPrevTriggerProps()}>Back</button>
              <Show
                when={api().value === "verify"}
                fallback={<button {...api().getNextTriggerProps()}>Continue</button>}
              >
                <button onClick={verify} disabled={verifying() || api().item?.invalid}>
                  {verifying() ? "Verifying…" : "Verify"}
                </button>
              </Show>
            </Show>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
