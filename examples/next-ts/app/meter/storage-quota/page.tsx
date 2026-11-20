"use client"

import * as meter from "@zag-js/meter"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/meter.css"

const CAPACITY = 512
const BACKUPS = 128
const PHOTOS = 128

export default function Page() {
  const [used, setUsed] = useState(384)
  const [backupsDeleted, setBackupsDeleted] = useState(false)

  const service = useMachine(meter.machine, {
    id: useId(),
    value: used,
    max: CAPACITY,
    low: 300,
    high: 450,
    optimum: 0,
    formatOptions: { style: "unit", unit: "gigabyte", maximumFractionDigits: 0 },
    translations: {
      value: ({ value, max, formatter }) => `${formatter.format(value)} of ${formatter.format(max)}`,
    },
  })
  const api = meter.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="meter-storage-quota">
          <div {...api.getRootProps()}>
            <div className="header">
              <span {...api.getLabelProps()}>Storage used</span>
              <span {...api.getValueTextProps()}>{api.valueAsString}</span>
            </div>
            <div {...api.getTrackProps()}>
              <div {...api.getIndicatorProps()} />
            </div>
          </div>
          {api.valueState === "least-optimal" && (
            <p className="alert" role="alert">
              Storage is full. New files won't sync.
            </p>
          )}
          <div className="meter-actions">
            <button
              type="button"
              disabled={backupsDeleted}
              onClick={() => {
                setBackupsDeleted(true)
                setUsed((value) => value - BACKUPS)
              }}
            >
              Delete old backups ({BACKUPS} GB)
            </button>
            <button
              type="button"
              disabled={used + PHOTOS > CAPACITY}
              onClick={() => setUsed((value) => value + PHOTOS)}
            >
              Upload photo library ({PHOTOS} GB)
            </button>
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
