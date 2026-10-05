"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import { tabsData } from "@zag-js/shared"
import * as tabs from "@zag-js/tabs"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/tabs.css"

function PageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = {
    controlled: searchParams.has("controlled"),
    automatic: searchParams.has("automatic"),
    native: searchParams.has("native"),
    cancel: searchParams.has("cancel"),
  }
  const [value, setValue] = useState("nils")

  const service = useMachine(tabs.machine, {
    id: useId(),
    defaultValue: "nils",
    value: query.controlled ? value : undefined,
    onValueChange(details) {
      setValue(details.value)
    },
    activationMode: query.automatic ? "automatic" : "manual",
    ...(!query.native && {
      navigate(details: tabs.NavigateDetails) {
        router.push(`#${details.value}`)
      },
    }),
  })

  const api = tabs.connect(service, normalizeProps)

  return (
    <>
      <main className="tabs" data-ready={!service.context.get("ssr")}>
        <div>
          <button onClick={() => api.setValue("agnes")}>Select Agnes with API</button>
          <button onClick={() => setValue("joke")}>Select Joke with prop</button>
        </div>
        <p>
          Selected: <output data-testid="value">{api.value ?? "none"}</output>
        </p>
        <div
          {...api.getRootProps()}
          onClick={(event) => {
            if (query.cancel) event.preventDefault()
          }}
        >
          <div {...api.getIndicatorProps()} />
          <div {...api.getListProps()}>
            {tabsData.map((data) => (
              <a href={`#${data.id}`} {...(api.getTriggerProps({ value: data.id }) as any)} key={data.id}>
                {data.label}
              </a>
            ))}
          </div>
          {tabsData.map((data) => (
            <div {...api.getContentProps({ value: data.id })} key={data.id}>
              <p>{data.content}</p>
              {data.id === "agnes" ? <input placeholder="Agnes" /> : null}
            </div>
          ))}
        </div>
      </main>
      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

export default function Page() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  )
}
