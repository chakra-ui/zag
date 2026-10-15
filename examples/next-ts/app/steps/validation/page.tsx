"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as steps from "@zag-js/steps"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
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
  const [project, setProject] = useState<Project>(initialProject)
  // Errors show once the user tries to leave the step
  const [touched, setTouched] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const errors = validate(project)

  const items: steps.StepItem[] = [
    { value: "details", title: "Details", invalid: !!errors.details },
    { value: "region", title: "Region", invalid: !!errors.region },
    { value: "access", title: "Access" },
    { value: "review", title: "Review" },
  ]

  const service = useMachine(steps.machine, {
    id: useId(),
    items,
    linear: true,
    onNavigationBlocked({ reason, blockedBy }) {
      if (reason === "invalid" && blockedBy) setTouched((prev) => [...prev, blockedBy])
    },
  })

  const api = steps.connect(service, normalizeProps)

  const update = (patch: Partial<Project>) => setProject((prev) => ({ ...prev, ...patch }))

  const showError = (value: string) => touched.includes(value) && errors[value]

  const submit = async () => {
    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setSubmitting(false)
    api.goToNextStep()
  }

  const reset = () => {
    setProject(initialProject)
    setTouched([])
    api.resetStep()
  }

  return (
    <>
      <main className="steps">
        <div {...api.getRootProps()}>
          <div {...api.getListProps()}>
            {api.items.map((item, index) => {
              const itemState = api.getItemState({ value: item.value })
              return (
                <div key={item.value} {...api.getItemProps({ value: item.value })}>
                  <button {...api.getTriggerProps({ value: item.value })}>
                    <div {...api.getIndicatorProps({ value: item.value })}>
                      {showError(item.value) ? "!" : itemState.completed ? "✓" : index + 1}
                    </div>
                    <span>{item.title}</span>
                  </button>
                  <div {...api.getSeparatorProps({ value: item.value })} />
                </div>
              )
            })}
          </div>

          <div {...api.getContentProps({ value: "details" })} className="steps-form">
            <label>
              Project name
              <input value={project.name} onChange={(e) => update({ name: e.target.value })} />
            </label>
            {showError("details") && <p className="steps-error">{errors.details}</p>}
          </div>

          <div {...api.getContentProps({ value: "region" })} className="steps-form">
            <label>
              Region
              <select value={project.region} onChange={(e) => update({ region: e.target.value })}>
                <option value="">Select a region</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </label>
            {showError("region") && <p className="steps-error">{errors.region}</p>}
          </div>

          <div {...api.getContentProps({ value: "access" })} className="steps-form">
            {(["private", "public"] as const).map((visibility) => (
              <label key={visibility} style={{ flexDirection: "row" }}>
                <input
                  type="radio"
                  name="visibility"
                  checked={project.visibility === visibility}
                  onChange={() => update({ visibility })}
                />
                {visibility}
              </label>
            ))}
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
            <button onClick={reset}>Create another</button>
          </div>

          {!api.complete && (
            <div className="steps-actions">
              <button {...api.getPreviousTriggerProps()}>Back</button>
              {api.value === "review" ? (
                <button onClick={submit} disabled={submitting}>
                  {submitting ? "Creating…" : "Create project"}
                </button>
              ) : (
                <button {...api.getNextTriggerProps()}>Next</button>
              )}
            </div>
          )}
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
