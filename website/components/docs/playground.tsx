"use client"

import { CodePanel } from "components/ui/code-panel"
import { defaultOf, getChangedProps } from "lib/changed-props"
import { openInStackblitz } from "lib/open-in-stackblitz"
import { useState } from "react"
import { LuArrowUpRight, LuCheck, LuCopy } from "react-icons/lu"
import { SiStackblitz, SiTypescript } from "react-icons/si"
import { docAction, playground } from "styled-system/recipes"

type OptionSet<V> = { default: V; options: V[]; required?: boolean }

type PlaygroundProps<T> = {
  name: string
  component: React.ComponentType<T>
  defaultProps?: Partial<{ [K in keyof T]: T[K] | OptionSet<T[K]> }>
  hideControls?: boolean
}

type Values = Record<string, unknown>

const isOptionSet = (value: unknown): value is OptionSet<string> =>
  typeof value === "object" && value !== null && "options" in value

const camel = (name: string) =>
  name.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase())

function getCode(name: string, values: Values, defaults: Values) {
  const machine = camel(name)
  const lines = [
    `const service = useMachine(${machine}.machine, {`,
    "  id: useId(),",
  ]
  const highlight: number[] = []
  const notes: Record<number, string> = {}
  for (const key of getChangedProps(defaults, values)) {
    lines.push(`  ${key}: ${JSON.stringify(values[key])},`)
    highlight.push(lines.length)
    notes[lines.length] =
      `changed · default ${JSON.stringify(defaultOf(defaults[key]))}`
  }
  lines.push("})", `const api = ${machine}.connect(service, normalizeProps)`)
  return { code: lines.join("\n"), highlight, notes }
}

function initialValues(defaults: Values): Values {
  return Object.fromEntries(
    Object.entries(defaults).map(([key, value]) => [key, defaultOf(value)]),
  )
}

export function Playground<T extends object>(props: PlaygroundProps<T>) {
  const { name, component: Component, hideControls } = props
  const defaults = (props.defaultProps ?? {}) as Values
  const [values, setValues] = useState(() => initialValues(defaults))
  const [copied, setCopied] = useState(false)
  const styles = playground()

  const keys = Object.keys(defaults)
  const changed = getChangedProps(defaults, values)
  const showPanel = keys.length > 0 && !hideControls
  const { code, highlight, notes } = getCode(name, values, defaults)
  const set = (key: string, value: unknown) =>
    setValues((current) => ({ ...current, [key]: value }))

  return (
    <div className={styles.root}>
      <div className={styles.top}>
        <div className={styles.stage}>
          <Component {...(values as T)} />
        </div>
        {showPanel && (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Props</span>
              <button
                type="button"
                className={styles.reset}
                disabled={changed.length === 0}
                onClick={() => setValues(initialValues(defaults))}
              >
                Reset
              </button>
            </div>
            <div className={styles.controls}>
              {keys.map((key) => {
                const type = defaults[key]
                const value = values[key]
                const id = `playground-${key}`
                const label = (
                  <span
                    id={`${id}-label`}
                    className={styles.name}
                    data-changed={changed.includes(key) || undefined}
                  >
                    {key}
                    {changed.includes(key) && (
                      <span className={styles.changed} aria-label="changed" />
                    )}
                  </span>
                )

                if (typeof type === "boolean") {
                  return (
                    <div key={key} className={styles.control}>
                      {label}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={value === true}
                        aria-labelledby={`${id}-label`}
                        data-state={value ? "checked" : "unchecked"}
                        className={styles.switch}
                        onClick={() => set(key, !value)}
                      >
                        <span className={styles.thumb} />
                      </button>
                    </div>
                  )
                }

                if (isOptionSet(type) && type.options.length <= 3) {
                  return (
                    <div key={key} className={styles.control} data-stack="">
                      {label}
                      <div
                        role="radiogroup"
                        aria-labelledby={`${id}-label`}
                        className={styles.segment}
                      >
                        {type.options.map((option) => (
                          <label
                            key={option}
                            data-state={
                              value === option ? "checked" : "unchecked"
                            }
                            className={styles.option}
                          >
                            <input
                              type="radio"
                              name={id}
                              value={option}
                              checked={value === option}
                              onChange={() => set(key, option)}
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                }

                if (isOptionSet(type)) {
                  return (
                    <div key={key} className={styles.control} data-stack="">
                      {label}
                      <select
                        aria-labelledby={`${id}-label`}
                        className={styles.field}
                        value={(value as string) ?? ""}
                        onChange={(e) => set(key, e.target.value || undefined)}
                      >
                        {!type.required && <option value="">—</option>}
                        {type.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                }

                if (typeof type === "number") {
                  return (
                    <div key={key} className={styles.control}>
                      {label}
                      <input
                        type="number"
                        aria-labelledby={`${id}-label`}
                        className={styles.field}
                        value={value as number}
                        onChange={(e) => {
                          const next = e.currentTarget.valueAsNumber
                          set(key, Number.isNaN(next) ? 0 : next)
                        }}
                      />
                    </div>
                  )
                }

                if (typeof type === "string") {
                  return (
                    <div key={key} className={styles.control} data-stack="">
                      {label}
                      <input
                        type="text"
                        aria-labelledby={`${id}-label`}
                        className={styles.field}
                        value={value as string}
                        onChange={(e) => set(key, e.target.value)}
                      />
                    </div>
                  )
                }

                return null
              })}
            </div>
          </div>
        )}
      </div>
      <div className={styles.bar}>
        <span className={styles.file}>
          <SiTypescript aria-hidden />
          {name}.tsx
        </span>
        <div className={styles.actions}>
          <button
            type="button"
            className={docAction({ size: "sm" })}
            onClick={() => {
              navigator.clipboard?.writeText(code)
              setCopied(true)
              setTimeout(() => setCopied(false), 1200)
            }}
          >
            {copied ? <LuCheck aria-hidden /> : <LuCopy aria-hidden />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            className={docAction({ size: "sm" })}
            onClick={() => openInStackblitz(name, values)}
          >
            <SiStackblitz aria-hidden />
            StackBlitz
            <LuArrowUpRight data-part="arrow" aria-hidden />
          </button>
        </div>
      </div>
      <CodePanel
        language="tsx"
        code={code}
        highlight={highlight}
        notes={notes}
      />
    </div>
  )
}
