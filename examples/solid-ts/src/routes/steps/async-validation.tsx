import { normalizeProps, useMachine } from "@zag-js/solid"
import * as steps from "@zag-js/steps"
import { createMemo, createSignal, createUniqueId, For, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/steps.css"

const takenUsernames = ["admin", "zag", "chakra"]

// Stands in for a server call
const checkUsername = (username: string) =>
  new Promise<string | undefined>((resolve) => {
    setTimeout(() => resolve(takenUsernames.includes(username.toLowerCase()) ? "Username is taken" : undefined), 800)
  })

export default function Page() {
  const [username, setUsername] = createSignal("")
  const [displayName, setDisplayName] = createSignal("")
  const [serverError, setServerError] = createSignal<string>()
  const [checking, setChecking] = createSignal(false)
  // Bumped on every edit or step change, so a check that resolves late is ignored
  let checkId = 0

  const items = createMemo<steps.StepItem[]>(() => [
    { value: "account", title: "Account", invalid: !!serverError() },
    { value: "profile", title: "Profile", invalid: !displayName().trim() },
    { value: "review", title: "Review" },
  ])

  const service = useMachine(steps.machine, {
    id: createUniqueId(),
    get items() {
      return items()
    },
    linear: true,
    onValueChange() {
      checkId++
      setChecking(false)
    },
  })

  const api = createMemo(() => steps.connect(service, normalizeProps))

  const editUsername = (value: string) => {
    checkId++
    setUsername(value)
    setServerError(undefined)
    setChecking(false)
  }

  const filled = () =>
    api().value === "account" ? !!username().trim() : api().value === "profile" ? !!displayName().trim() : true

  const next = async () => {
    if (api().value !== "account") return api().goToNextStep()

    const id = ++checkId
    setChecking(true)
    const error = await checkUsername(username().trim())
    if (id !== checkId) return

    setChecking(false)
    setServerError(error)
    if (!error) api().goToNextStep()
  }

  const reset = () => {
    editUsername("")
    setDisplayName("")
    api().resetStep()
  }

  return (
    <>
      <main class="steps">
        <div {...api().getRootProps()}>
          <div {...api().getListProps()}>
            <For each={api().items}>
              {(item, index) => (
                <div {...api().getItemProps({ value: item.value })}>
                  <button {...api().getTriggerProps({ value: item.value })}>
                    <div {...api().getIndicatorProps({ value: item.value })}>
                      {item.value === "account" && serverError()
                        ? "!"
                        : api().getItemState({ value: item.value }).completed
                          ? "✓"
                          : index() + 1}
                    </div>
                    <span>{item.title}</span>
                  </button>
                  <div {...api().getSeparatorProps({ value: item.value })} />
                </div>
              )}
            </For>
          </div>

          <div {...api().getContentProps({ value: "account" })} class="steps-form">
            <label>
              Username
              <input
                value={username()}
                aria-invalid={serverError() ? "true" : undefined}
                onInput={(e) => editUsername(e.currentTarget.value)}
              />
            </label>
            <p>Try "admin" to see the server reject it.</p>
            <Show when={serverError()}>
              <p class="steps-error">{serverError()}</p>
            </Show>
          </div>

          <div {...api().getContentProps({ value: "profile" })} class="steps-form">
            <label>
              Display name
              <input value={displayName()} onInput={(e) => setDisplayName(e.currentTarget.value)} />
            </label>
          </div>

          <div {...api().getContentProps({ value: "review" })}>
            <dl>
              <dt>Username</dt>
              <dd>{username()}</dd>
              <dt>Display name</dt>
              <dd>{displayName()}</dd>
            </dl>
          </div>

          <div {...api().getCompletedContentProps()}>
            <p>
              Welcome, <strong>{displayName()}</strong>.
            </p>
            <button onClick={reset}>Start over</button>
          </div>

          <Show when={!api().complete}>
            <div class="steps-actions">
              <button {...api().getPreviousTriggerProps()}>Back</button>
              <button onClick={next} disabled={checking() || !filled()} aria-busy={checking() ? "true" : undefined}>
                {checking() ? "Checking…" : api().value === "review" ? "Create account" : "Next"}
              </button>
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
