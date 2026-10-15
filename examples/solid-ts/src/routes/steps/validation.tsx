import { normalizeProps, useMachine } from "@zag-js/solid"
import * as steps from "@zag-js/steps"
import { createMemo, createSignal, createUniqueId, For, Index, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
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

export default function Page() {
  const [project, setProject] = createSignal<Project>(initialProject)
  // Errors show once the user tries to leave the step
  const [touched, setTouched] = createSignal<string[]>([])
  const [submitting, setSubmitting] = createSignal(false)

  const errors = createMemo(() => validate(project()))

  const items = createMemo<steps.StepItem[]>(() => [
    { value: "details", title: "Details", invalid: !!errors().details },
    { value: "region", title: "Region", invalid: !!errors().region },
    { value: "access", title: "Access" },
    { value: "review", title: "Review" },
  ])

  const service = useMachine(steps.machine, {
    id: createUniqueId(),
    get items() {
      return items()
    },
    linear: true,
    onNavigationBlocked({ reason, blockedBy }) {
      if (reason === "invalid" && blockedBy) setTouched((prev) => [...prev, blockedBy])
    },
  })

  const api = createMemo(() => steps.connect(service, normalizeProps))

  const update = (patch: Partial<Project>) => setProject((prev) => ({ ...prev, ...patch }))

  const showError = (value: string) => touched().includes(value) && errors()[value]

  const submit = async () => {
    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setSubmitting(false)
    api().goToNextStep()
  }

  const reset = () => {
    setProject(initialProject)
    setTouched([])
    api().resetStep()
  }

  return (
    <>
      <main class="steps">
        <div {...api().getRootProps()}>
          <div {...api().getListProps()}>
            <Index each={api().items}>
              {(item, index) => (
                <div {...api().getItemProps({ value: item().value })}>
                  <button {...api().getTriggerProps({ value: item().value })}>
                    <div {...api().getIndicatorProps({ value: item().value })}>
                      {showError(item().value)
                        ? "!"
                        : api().getItemState({ value: item().value }).completed
                          ? "✓"
                          : index + 1}
                    </div>
                    <span>{item().title}</span>
                  </button>
                  <div {...api().getSeparatorProps({ value: item().value })} />
                </div>
              )}
            </Index>
          </div>

          <div {...api().getContentProps({ value: "details" })} class="steps-form">
            <label>
              Project name
              <input value={project().name} onInput={(e) => update({ name: e.currentTarget.value })} />
            </label>
            <Show when={showError("details")}>
              <p class="steps-error">{errors().details}</p>
            </Show>
          </div>

          <div {...api().getContentProps({ value: "region" })} class="steps-form">
            <label>
              Region
              <select value={project().region} onChange={(e) => update({ region: e.currentTarget.value })}>
                <option value="">Select a region</option>
                <For each={regions}>{(region) => <option value={region}>{region}</option>}</For>
              </select>
            </label>
            <Show when={showError("region")}>
              <p class="steps-error">{errors().region}</p>
            </Show>
          </div>

          <div {...api().getContentProps({ value: "access" })} class="steps-form">
            <For each={["private", "public"] as const}>
              {(visibility) => (
                <label style={{ "flex-direction": "row" }}>
                  <input
                    type="radio"
                    name="visibility"
                    checked={project().visibility === visibility}
                    onChange={() => update({ visibility })}
                  />
                  {visibility}
                </label>
              )}
            </For>
          </div>

          <div {...api().getContentProps({ value: "review" })}>
            <dl>
              <dt>Name</dt>
              <dd>{project().name}</dd>
              <dt>Region</dt>
              <dd>{project().region}</dd>
              <dt>Visibility</dt>
              <dd>{project().visibility}</dd>
            </dl>
          </div>

          <div {...api().getContentProps({ value: steps.COMPLETE })}>
            <p>
              Project <strong>{project().name}</strong> created.
            </p>
            <button onClick={reset}>Create another</button>
          </div>

          <Show when={!api().complete}>
            <div class="steps-actions">
              <button {...api().getPreviousTriggerProps()}>Back</button>
              <Show when={api().value === "review"} fallback={<button {...api().getNextTriggerProps()}>Next</button>}>
                <button onClick={submit} disabled={submitting()}>
                  {submitting() ? "Creating…" : "Create project"}
                </button>
              </Show>
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
