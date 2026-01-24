import { normalizeProps, useMachine } from "@zag-js/react"
import * as steps from "@zag-js/steps"
import { useId, useState } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

interface FormData {
  name: string
  email: string
  accountType: "personal" | "business"
  companyName: string
}

interface FormStep {
  title: string
  description: string
  isValid?: (data: FormData) => boolean
  isSkippable?: (data: FormData) => boolean
}

const stepsData: FormStep[] = [
  {
    title: "Personal Info",
    description: "Enter your name and email",
    isValid(data) {
      return data.name.trim().length > 0 && data.email.includes("@")
    },
  },
  {
    title: "Account Type",
    description: "Choose account type",
    isValid() {
      return true // Always valid since there's a default selection
    },
  },
  {
    title: "Company Details",
    description: "Business information (optional for personal)",
    isValid(data) {
      // Only isValid if business account (personal accounts skip this step)
      if (data.accountType === "personal") return true
      return data.companyName.trim().length > 0
    },
    isSkippable(data) {
      return data.accountType === "personal"
    },
  },
  {
    title: "Review",
    description: "Review your information",
    isValid() {
      return true // Review step is always valid
    },
  },
]

export default function Page() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    accountType: "personal",
    companyName: "",
  })

  const service = useMachine(steps.machine, {
    id: useId(),
    count: stepsData.length,
    linear: true,
    isStepValid(index) {
      return stepsData[index]?.isValid?.(formData) ?? true
    },
    isStepSkippable(index) {
      return stepsData[index]?.isSkippable?.(formData) ?? false
    },
    onStepInvalid({ step }) {
      console.log(`Step ${step + 1} is invalid`)
    },
  })

  const api = steps.connect(service, normalizeProps)

  return (
    <>
      <main className="steps">
        <div {...api.getRootProps()}>
          {/* Step indicators */}
          <div {...api.getListProps()}>
            {stepsData.map((step, index) => {
              const state = api.getItemState({ index })
              return (
                <div key={index} {...api.getItemProps({ index })}>
                  <button {...api.getTriggerProps({ index })}>
                    <div {...api.getIndicatorProps({ index })}>{state.completed ? "✓" : index + 1}</div>
                    <span>
                      {step.title}
                      {state.skippable && " (optional)"}
                    </span>
                  </button>
                  {!state.last && <div {...api.getSeparatorProps({ index })} />}
                </div>
              )
            })}
          </div>

          {/* Step 1: Personal Info */}
          <div {...api.getContentProps({ index: 0 })}>
            <h2>{stepsData[0].title}</h2>
            <p>{stepsData[0].description}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 300 }}>
              <label>
                Name *
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your name"
                />
              </label>
              <label>
                Email *
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                />
              </label>
            </div>
            {!api.isStepValid(api.value) && (
              <p style={{ color: "red", marginTop: "0.5rem" }}>Please fill in all required fields</p>
            )}
          </div>

          {/* Step 2: Account Type */}
          <div {...api.getContentProps({ index: 1 })}>
            <h2>{stepsData[1].title}</h2>
            <p>{stepsData[1].description}</p>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="radio"
                  name="accountType"
                  value="personal"
                  checked={formData.accountType === "personal"}
                  onChange={() => setFormData((prev) => ({ ...prev, accountType: "personal" }))}
                />
                Personal
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="radio"
                  name="accountType"
                  value="business"
                  checked={formData.accountType === "business"}
                  onChange={() => setFormData((prev) => ({ ...prev, accountType: "business" }))}
                />
                Business
              </label>
            </div>
            {formData.accountType === "personal" && (
              <p style={{ color: "gray", marginTop: "1rem" }}>
                Company details step will be skipped for personal accounts.
              </p>
            )}
          </div>

          {/* Step 3: Company Details (skippable for personal) */}
          <div {...api.getContentProps({ index: 2 })}>
            <h2>{stepsData[2].title}</h2>
            <p>{stepsData[2].description}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 300 }}>
              <label>
                Company Name {formData.accountType === "business" ? "*" : "(optional)"}
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Enter company name"
                />
              </label>
            </div>
            {formData.accountType === "business" && !api.isStepValid(api.value) && (
              <p style={{ color: "red", marginTop: "0.5rem" }}>Company name is required for business accounts</p>
            )}
          </div>

          {/* Step 4: Review */}
          <div {...api.getContentProps({ index: 3 })}>
            <h2>{stepsData[3].title}</h2>
            <p>{stepsData[3].description}</p>
            <div
              style={{ background: "#f5f5f5", padding: "1rem", borderRadius: "8px", marginTop: "1rem", maxWidth: 400 }}
            >
              <p>
                <strong>Name:</strong> {formData.name || "-"}
              </p>
              <p>
                <strong>Email:</strong> {formData.email || "-"}
              </p>
              <p>
                <strong>Account Type:</strong> {formData.accountType}
              </p>
              {formData.accountType === "business" && (
                <p>
                  <strong>Company:</strong> {formData.companyName || "-"}
                </p>
              )}
            </div>
          </div>

          {/* Completion state */}
          <div {...api.getContentProps({ index: stepsData.length })}>
            <h2>Thank you!</h2>
            <p>Your registration is complete.</p>
            <button onClick={() => api.resetStep()}>Start Over</button>
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
            <button {...api.getPrevTriggerProps()}>Back</button>
            <button {...api.getNextTriggerProps()}>{api.value === stepsData.length - 1 ? "Complete" : "Next"}</button>
          </div>

          {/* Debug info */}
          <div style={{ marginTop: "2rem", padding: "1rem", background: "#f0f0f0", borderRadius: "8px" }}>
            <p>
              <strong>Current Step:</strong> {api.value + 1} / {api.count}
            </p>
            <p>
              <strong>Current Step Valid:</strong> {api.isStepValid(api.value) ? "Yes" : "No"}
            </p>
            <p>
              <strong>Progress:</strong> {api.percent.toFixed(0)}%
            </p>
            <p>
              <strong>Completed:</strong> {api.isCompleted ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
