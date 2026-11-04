"use client"

import * as dialog from "@zag-js/dialog"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import dynamic from "next/dynamic"
import { useEffect, useId, useState } from "react"
import { HiX } from "react-icons/hi"
import { LuWorkflow } from "react-icons/lu"
import type { MachineGraph } from "./machine-explorer"
import * as styles from "./machine-diagram.css"
import * as pill from "./mdx/resource-link.css"

// the flow library only loads once someone opens a machine
const MachineExplorer = dynamic(
  () => import("./machine-explorer").then((mod) => mod.MachineExplorer),
  {
    ssr: false,
    loading: () => <p className={styles.status}>Loading…</p>,
  },
)

type Status =
  | { type: "loading" }
  | { type: "ready"; graph: MachineGraph }
  | { type: "error" }

export function MachineDiagram(props: { url: string; name: string }) {
  const id = useId()
  const service = useMachine(dialog.machine, { id: `logic-${id}` })
  const api = dialog.connect(service, normalizeProps)
  const [status, setStatus] = useState<Status>({ type: "loading" })

  useEffect(() => {
    if (!api.open || status.type === "ready") return
    let active = true
    fetch(props.url)
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error(res.statusText)),
      )
      .then(
        (graph: MachineGraph) => active && setStatus({ type: "ready", graph }),
        () => active && setStatus({ type: "error" }),
      )
    return () => {
      active = false
    }
  }, [api.open, props.url, status.type])

  return (
    <>
      <button className={pill.action} {...api.getTriggerProps()}>
        <LuWorkflow aria-hidden />
        Visualize logic
      </button>
      {api.open && (
        <Portal>
          <div className={styles.backdrop} {...api.getBackdropProps()} />
          <div className={styles.positioner} {...api.getPositionerProps()}>
            <div className={styles.content} {...api.getContentProps()}>
              <div className={styles.header}>
                <h2 className={styles.title} {...api.getTitleProps()}>
                  {props.name} machine
                </h2>
                <span className={styles.hint}>
                  Click a state to trace its transitions
                </span>
                <button
                  className={styles.iconButton}
                  {...api.getCloseTriggerProps()}
                  aria-label="Close"
                >
                  <HiX aria-hidden />
                </button>
              </div>
              {/* fixed height, so loading and the explorer take the same space */}
              <div className={styles.body}>
                {status.type === "loading" && (
                  <p className={styles.status}>Loading…</p>
                )}
                {status.type === "error" && (
                  <p className={styles.status}>
                    This machine isn’t available yet.
                  </p>
                )}
                {status.type === "ready" && (
                  <MachineExplorer graph={status.graph} />
                )}
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}
