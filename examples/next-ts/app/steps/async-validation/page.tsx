"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as steps from "@zag-js/steps"
import { useId, useRef, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/steps.css"

const takenUsernames = ["admin", "zag", "chakra"]

// Stands in for a server call
const checkUsername = (username: string) =>
  new Promise<string | undefined>((resolve) => {
    setTimeout(() => resolve(takenUsernames.includes(username.toLowerCase()) ? "Username is taken" : undefined), 800)
  })

export default function Page() {
  const [username, setUsername] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [serverError, setServerError] = useState<string>()
  const [checking, setChecking] = useState(false)
  // Bumped on every edit or step change, so a check that resolves late is ignored
  const checkId = useRef(0)

  const items: steps.StepItem[] = [
    { value: "account", title: "Account", invalid: !!serverError },
    { value: "profile", title: "Profile", invalid: !displayName.trim() },
    { value: "review", title: "Review" },
  ]

  const service = useMachine(steps.machine, {
    id: useId(),
    items,
    linear: true,
    onValueChange() {
      checkId.current++
      setChecking(false)
    },
  })

  const api = steps.connect(service, normalizeProps)

  const editUsername = (value: string) => {
    checkId.current++
    setUsername(value)
    setServerError(undefined)
    setChecking(false)
  }

  const filled = api.value === "account" ? !!username.trim() : api.value === "profile" ? !!displayName.trim() : true

  const next = async () => {
    if (api.value !== "account") return api.goToNextStep()

    const id = ++checkId.current
    setChecking(true)
    const error = await checkUsername(username.trim())
    if (id !== checkId.current) return

    setChecking(false)
    setServerError(error)
    if (!error) api.goToNextStep()
  }

  const reset = () => {
    editUsername("")
    setDisplayName("")
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
                      {item.value === "account" && serverError ? "!" : itemState.completed ? "✓" : index + 1}
                    </div>
                    <span>{item.title}</span>
                  </button>
                  <div {...api.getSeparatorProps({ value: item.value })} />
                </div>
              )
            })}
          </div>

          <div {...api.getContentProps({ value: "account" })} className="steps-form">
            <label>
              Username
              <input
                value={username}
                aria-invalid={!!serverError}
                onChange={(e) => editUsername(e.currentTarget.value)}
              />
            </label>
            <p>Try "admin" to see the server reject it.</p>
            {serverError && <p className="steps-error">{serverError}</p>}
          </div>

          <div {...api.getContentProps({ value: "profile" })} className="steps-form">
            <label>
              Display name
              <input value={displayName} onChange={(e) => setDisplayName(e.currentTarget.value)} />
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
            <button onClick={reset}>Start over</button>
          </div>

          {!api.complete && (
            <div className="steps-actions">
              <button {...api.getPreviousTriggerProps()}>Back</button>
              <button onClick={next} disabled={checking || !filled} aria-busy={checking}>
                {checking ? "Checking…" : api.value === "review" ? "Create account" : "Next"}
              </button>
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
