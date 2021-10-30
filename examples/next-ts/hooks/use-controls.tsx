/* eslint-disable jsx-a11y/no-onchange */
import React, { useState } from "react"

type Prop =
  | { type: "boolean"; label?: string; defaultValue: boolean }
  | { type: "string"; label?: string; defaultValue: string; placeholder?: string }
  | { type: "select"; options: readonly string[]; defaultValue: string; label?: string }
  | { type: "multiselect"; options: readonly string[]; defaultValue: string[]; label?: string }
  | { type: "number"; label?: string; defaultValue: number; min?: number; max?: number }

type ControlRecord = Record<string, Prop>

type Value<T extends ControlRecord> = {
  [K in keyof T]: T[K] extends { type: "boolean" }
    ? boolean
    : T[K] extends { type: "string" }
    ? string
    : T[K] extends { type: "select" }
    ? T[K]["options"][number]
    : T[K] extends { type: "multiselect" }
    ? T[K]["options"][number][]
    : T[K] extends { type: "number" }
    ? number
    : never
}

function getDefaultValues<T extends ControlRecord>(obj: T) {
  return Object.keys(obj).reduce(
    (acc, key) => ({
      ...acc,
      [key]: obj[key].defaultValue,
    }),
    {} as Value<T>,
  )
}

export function useControls<T extends ControlRecord>(config: T) {
  const [state, setState] = useState(getDefaultValues(config))

  return {
    context: state,
    ui: () => (
      <div
        style={{
          display: "inline-block",
          background: "lightgray",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid lightgray",
          margin: "24px 0",
        }}
      >
        <p style={{ fontSize: "small", all: "unset", display: "block", marginBottom: "12px" }}>Property controls</p>
        <div style={{ display: "inline-flex", gap: "24px" }}>
          {Object.keys(config).map((key) => {
            const { type, label = key, options, placeholder, min, max } = (config[key] ?? {}) as any
            switch (type) {
              case "boolean":
                return (
                  <div key={key}>
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
                  <div key={key}>
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
                  <div key={key}>
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
                  <div key={key}>
                    <label htmlFor={label} style={{ marginRight: "10px" }}>
                      {label}
                    </label>
                    <input
                      data-testid={key}
                      id={label}
                      type="number"
                      style={{ maxWidth: "5ch" }}
                      min={min}
                      max={max}
                      defaultValue={state[key] as number}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setState((s) => ({ ...s, [key]: e.currentTarget?.valueAsNumber }))
                        }
                      }}
                    />
                  </div>
                )
            }
          })}
        </div>
      </div>
    ),
  }
}
