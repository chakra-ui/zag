/* eslint-disable jsx-a11y/no-onchange */
import React, { useState } from "react"
import { ControlRecord, ControlValue } from "@zag-js/types"
import { controlsContainer } from "../../../shared/style"

function getDefaultValues<T extends ControlRecord>(obj: T) {
  return Object.keys(obj).reduce(
    (acc, key) => ({
      ...acc,
      [key]: obj[key].defaultValue,
    }),
    {} as ControlValue<T>,
  )
}

export function useControls<T extends ControlRecord>(config: T) {
  const [state, setState] = useState(getDefaultValues(config))

  return {
    context: state,
    ui: () => (
      <div className={controlsContainer}>
        {Object.keys(config).map((key) => {
          const { type, label = key, options, placeholder, min, max } = (config[key] ?? {}) as any
          switch (type) {
            case "boolean":
              return (
                <div key={key} className="checkbox">
                  <input
                    data-testid={key}
                    id={label}
                    type="checkbox"
                    defaultChecked={state[key] as boolean}
                    onChange={(e) => {
                      setState((s) => ({ ...s, [key]: e.target.checked }))
                    }}
                  />
                  <label htmlFor={label}>{label}</label>
                </div>
              )
            case "string":
              return (
                <div key={key} className="text">
                  <label style={{ marginRight: "10px" }}>{label}</label>
                  <input
                    data-testid={key}
                    type="text"
                    placeholder={placeholder}
                    defaultValue={state[key] as string}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setState((s) => ({ ...s, [key]: (e.target as HTMLInputElement).value }))
                      }
                    }}
                  />
                </div>
              )
            case "select":
              return (
                <div key={key} className="text">
                  <label htmlFor={label} style={{ marginRight: "10px" }}>
                    {label}
                  </label>
                  <select
                    data-testid={key}
                    id={label}
                    defaultValue={state[key] as string}
                    onChange={(e) => {
                      setState((s) => ({ ...s, [key]: e.target.value }))
                    }}
                  >
                    <option>-----</option>
                    {options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              )
            case "number":
              return (
                <div key={key} className="text">
                  <label htmlFor={label} style={{ marginRight: "10px" }}>
                    {label}
                  </label>
                  <input
                    data-testid={key}
                    id={label}
                    type="number"
                    min={min}
                    max={max}
                    defaultValue={state[key] as number}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = parseFloat(e.currentTarget.value)
                        setState((s) => ({ ...s, [key]: isNaN(val) ? 0 : val }))
                      }
                    }}
                  />
                </div>
              )
          }
        })}
      </div>
    ),
  }
}
