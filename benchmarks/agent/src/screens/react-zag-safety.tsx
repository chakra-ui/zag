// Not a benchmark screen: what the app sees of an agent's changes and what it keeps from one.
// Checked by checks/safety.mjs. Open it with ?screen=react-zag-safety&agent.
import * as accordion from "@zag-js/accordion"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as tabs from "@zag-js/tabs"
import * as React from "react"
import { createRoot } from "react-dom/client"

type Log = { reasons: string[]; deleted: number }
const log: Log = { reasons: [], deleted: 0 }
;(window as unknown as { __log: Log }).__log = log

function Screen() {
  const tabsService = useMachine(tabs.machine, {
    id: React.useId(),
    defaultValue: "account",
    onValueChange: (details) => log.reasons.push(`tabs:${details.reason}`),
  })
  const tabsApi = tabs.connect(tabsService, normalizeProps)
  const accordionService = useMachine(accordion.machine, {
    id: React.useId(),
    collapsible: true,
    onValueChange: (details) => log.reasons.push(`accordion:${details.reason}`),
  })
  const accordionApi = accordion.connect(accordionService, normalizeProps)
  const passwordId = React.useId()

  return (
    <main className="screen">
      <h1>Safety</h1>
      <div {...tabsApi.getRootProps()}>
        <div {...tabsApi.getListProps()} aria-label="Sections" className="row">
          <button {...tabsApi.getTriggerProps({ value: "account" })}>Account</button>
          <button {...tabsApi.getTriggerProps({ value: "danger" })}>Danger zone</button>
        </div>
        <div {...tabsApi.getContentProps({ value: "account" })} className="screen">
          <div className="field">
            <label htmlFor={passwordId}>Password</label>
            <input id={passwordId} type="password" defaultValue="hunter2" />
          </div>
          <div {...accordionApi.getRootProps()} aria-label="Help">
            <div {...accordionApi.getItemProps({ value: "faq" })}>
              <button {...accordionApi.getItemTriggerProps({ value: "faq" })}>FAQ</button>
              <div {...accordionApi.getItemContentProps({ value: "faq" })}>Answers.</div>
            </div>
          </div>
        </div>
        <div {...tabsApi.getContentProps({ value: "danger" })}>
          <button
            type="button"
            className="button"
            data-agent-confirm="Deletes the project and all its files"
            onClick={() => log.deleted++}
          >
            Delete project
          </button>
        </div>
      </div>
    </main>
  )
}

function mount(root: HTMLElement) {
  createRoot(root).render(<Screen />)
}

export { mount }
