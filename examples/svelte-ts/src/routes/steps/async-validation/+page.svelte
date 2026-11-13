<script lang="ts">
  import * as steps from "@zag-js/steps"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import "@styles/steps.css"

  const takenUsernames = ["admin", "zag", "chakra"]

  // Stands in for a server call
  const checkUsername = (username: string) =>
    new Promise<string | undefined>((resolve) => {
      setTimeout(() => resolve(takenUsernames.includes(username.toLowerCase()) ? "Username is taken" : undefined), 800)
    })

  let username = $state("")
  let displayName = $state("")
  let serverError = $state<string>()
  let checking = $state(false)
  // Bumped on every edit or step change, so a check that resolves late is ignored
  let checkId = 0

  const items = $derived<steps.StepItem[]>([
    { value: "account", title: "Account", invalid: !!serverError },
    { value: "profile", title: "Profile", invalid: !displayName.trim() },
    { value: "review", title: "Review" },
  ])

  const id = $props.id()
  const service = useMachine(steps.machine, () => ({
    id,
    items,
    linear: true,
    onValueChange() {
      checkId++
      checking = false
    },
  }))

  const api = $derived(steps.connect(service, normalizeProps))

  const filled = $derived(
    api.value === "account" ? !!username.trim() : api.value === "profile" ? !!displayName.trim() : true,
  )

  const editUsername = (value: string) => {
    checkId++
    username = value
    serverError = undefined
    checking = false
  }

  const next = async () => {
    if (api.value !== "account") return api.goToNextStep()

    const currentId = ++checkId
    checking = true
    const error = await checkUsername(username.trim())
    if (currentId !== checkId) return

    checking = false
    serverError = error
    if (!error) api.goToNextStep()
  }

  const reset = () => {
    editUsername("")
    displayName = ""
    api.resetStep()
  }
</script>

<main class="steps">
  <div {...api.getRootProps()}>
    <div {...api.getListProps()}>
      {#each api.items as item, index (item.value)}
        {@const itemState = api.getItemState({ value: item.value })}
        <div {...api.getItemProps({ value: item.value })}>
          <button {...api.getTriggerProps({ value: item.value })}>
            <div {...api.getIndicatorProps({ value: item.value })}>
              {item.value === "account" && serverError ? "!" : itemState.completed ? "✓" : index + 1}
            </div>
            <span>{item.title}</span>
          </button>
          <div {...api.getSeparatorProps({ value: item.value })}></div>
        </div>
      {/each}
    </div>

    <div {...api.getContentProps({ value: "account" })} class="steps-form">
      <label>
        Username
        <input value={username} aria-invalid={!!serverError} oninput={(e) => editUsername(e.currentTarget.value)} />
      </label>
      <p>Try "admin" to see the server reject it.</p>
      {#if serverError}
        <p class="steps-error">{serverError}</p>
      {/if}
    </div>

    <div {...api.getContentProps({ value: "profile" })} class="steps-form">
      <label>
        Display name
        <input bind:value={displayName} />
      </label>
    </div>

    <div {...api.getContentProps({ value: "review" })}>
      <dl>
        <dt>Username</dt>
        <dd>{username}</dd>
        <dt>Display name</dt>
        <dd>{displayName}</dd>
      </dl>
    </div>

    <div {...api.getCompletedContentProps()}>
      <p>
        Welcome, <strong>{displayName}</strong>.
      </p>
      <button onclick={reset}>Start over</button>
    </div>

    {#if !api.complete}
      <div class="steps-actions">
        <button {...api.getPreviousTriggerProps()}>Back</button>
        <button onclick={next} disabled={checking || !filled} aria-busy={checking}>
          {checking ? "Checking…" : api.value === "review" ? "Create account" : "Next"}
        </button>
      </div>
    {/if}
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
