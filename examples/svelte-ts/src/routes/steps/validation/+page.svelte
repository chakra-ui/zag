<script lang="ts">
  import * as steps from "@zag-js/steps"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import "@styles/steps.css"

  interface Project {
    name: string
    region: string
    visibility: "private" | "public"
  }

  const initialProject: Project = { name: "", region: "", visibility: "private" }

  const regions = ["us-east", "eu-west", "ap-south"]

  const validate = (project: Project): Record<string, string | undefined> => ({
    details: project.name.trim().length < 3 ? "Name must be at least 3 characters" : undefined,
    region: project.region ? undefined : "Pick a region",
  })

  let project = $state<Project>({ ...initialProject })
  // Errors show once the user tries to leave the step
  let touched = $state<string[]>([])
  let submitting = $state(false)

  const errors = $derived(validate(project))

  const items = $derived<steps.StepItem[]>([
    { value: "details", title: "Details", invalid: !!errors.details },
    { value: "region", title: "Region", invalid: !!errors.region },
    { value: "access", title: "Access" },
    { value: "review", title: "Review" },
  ])

  const id = $props.id()
  const service = useMachine(steps.machine, () => ({
    id,
    items,
    linear: true,
    onNavigationBlocked({ reason, blockedBy }) {
      if (reason === "invalid" && blockedBy) touched = [...touched, blockedBy]
    },
  }))

  const api = $derived(steps.connect(service, normalizeProps))

  const showError = (value: string) => touched.includes(value) && errors[value]

  const submit = async () => {
    submitting = true
    await new Promise((resolve) => setTimeout(resolve, 600))
    submitting = false
    api.goToNextStep()
  }

  const reset = () => {
    project = { ...initialProject }
    touched = []
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
              {showError(item.value) ? "!" : itemState.completed ? "✓" : index + 1}
            </div>
            <span>{item.title}</span>
          </button>
          <div {...api.getSeparatorProps({ value: item.value })}></div>
        </div>
      {/each}
    </div>

    <div {...api.getContentProps({ value: "details" })} class="steps-form">
      <label>
        Project name
        <input bind:value={project.name} />
      </label>
      {#if showError("details")}
        <p class="steps-error">{errors.details}</p>
      {/if}
    </div>

    <div {...api.getContentProps({ value: "region" })} class="steps-form">
      <label>
        Region
        <select bind:value={project.region}>
          <option value="">Select a region</option>
          {#each regions as region (region)}
            <option value={region}>{region}</option>
          {/each}
        </select>
      </label>
      {#if showError("region")}
        <p class="steps-error">{errors.region}</p>
      {/if}
    </div>

    <div {...api.getContentProps({ value: "access" })} class="steps-form">
      {#each ["private", "public"] as const as visibility (visibility)}
        <label style="flex-direction: row">
          <input
            type="radio"
            name="visibility"
            checked={project.visibility === visibility}
            onchange={() => (project.visibility = visibility)}
          />
          {visibility}
        </label>
      {/each}
    </div>

    <div {...api.getContentProps({ value: "review" })}>
      <dl>
        <dt>Name</dt>
        <dd>{project.name}</dd>
        <dt>Region</dt>
        <dd>{project.region}</dd>
        <dt>Visibility</dt>
        <dd>{project.visibility}</dd>
      </dl>
    </div>

    <div {...api.getContentProps({ value: steps.COMPLETE })}>
      <p>
        Project <strong>{project.name}</strong> created.
      </p>
      <button onclick={reset}>Create another</button>
    </div>

    {#if !api.complete}
      <div class="steps-actions">
        <button {...api.getPreviousTriggerProps()}>Back</button>
        {#if api.value === "review"}
          <button onclick={submit} disabled={submitting}>
            {submitting ? "Creating…" : "Create project"}
          </button>
        {:else}
          <button {...api.getNextTriggerProps()}>Next</button>
        {/if}
      </div>
    {/if}
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
