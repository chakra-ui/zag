/* eslint-disable jsx-a11y/no-onchange */
import React, { useState } from "react"

type ControlProp =
  | { type: "boolean"; label: string; defaultValue: boolean }
  | { type: "string"; label: string; defaultValue: string; placeholder?: string }
  | { type: "select"; options: string[]; defaultValue: string; label: string }
  | { type: "number"; label: string; defaultValue: number; min?: number; max?: number }

type ControlPropRecord = Record<string, ControlProp>

type ControlValue<T extends ControlPropRecord> = {
  [K in keyof T]: T[K] extends { type: "boolean" }
    ? boolean
    : T[K] extends { type: "string" }
    ? string
    : T[K] extends { type: "select" }
    ? Array<T[K]["defaultValue"]>
    : T[K] extends { type: "number" }
    ? number
    : never
}

function getDefaultValues<T extends ControlPropRecord>(obj: T) {
  return Object.keys(obj).reduce(
    (acc, key) => ({
      ...acc,
      [key]: obj[key].defaultValue,
    }),
    {} as ControlValue<T>,
  )
}

export function useControls<T extends ControlPropRecord>(config: T) {
  const [state, setState] = useState(getDefaultValues(config))

  return {
    context: state,
    ui: (props: React.ComponentProps<"div">) => (
      <div
        {...props}
        style={{
          display: "inline-flex",
          gap: "24px",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid lightgray",
          background: "lightgray",
          ...props.style,
        }}
      >
        {Object.keys(config).map((key) => {
          const { type, label, options, placeholder, min, max } = (config[key] ?? {}) as any
          switch (type) {
            case "boolean":
              return (
                <div key={key}>
                  <input
                    data-testid={key}
                    id={label}
                    type="checkbox"
                    checked={state[key] as boolean}
                    onChange={(e) => {
                      setState((s) => ({ ...s, [key]: e.target.checked }))
                    }}
                  />
                  <label htmlFor={label}>{label}</label>
                </div>
              )
            case "string":
              return (
                <div key={key}>
                  <label>{label}</label>
                  <input
                    data-testid={key}
                    type="text"
                    placeholder={placeholder}
                    value={state[key] as string}
                    onChange={(e) => {
                      setState((s) => ({ ...s, [key]: e.target.value }))
                    }}
                  />
                </div>
              )
            case "select":
              return (
                <div key={key}>
                  <label htmlFor={label} style={{ marginRight: "10px" }}>
                    {label}
                  </label>
                  <select
                    data-testid={key}
                    id={label}
                    value={state[key] as string}
                    onChange={(e) => {
                      setState((s) => ({ ...s, [key]: e.currentTarget.value }))
                    }}
                  >
                    <option value="">Select</option>
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
                <div key={key}>
                  <label htmlFor={label}>{label}</label>
                  <input
                    data-testid={key}
                    id={label}
                    type="number"
                    min={min}
                    max={max}
                    value={state[key] as number}
                    onChange={(e) => {
                      setState((s) => ({ ...s, [key]: parseFloat(e.target.value) }))
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
