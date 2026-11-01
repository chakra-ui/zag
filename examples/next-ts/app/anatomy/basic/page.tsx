"use client"

import { allComponents, createGradient } from "@zag-js/anatomy-icons"
import { useState } from "react"
import "@styles/anatomy.css"

const accents = [
  { label: "Green", value: "#2CFF80" },
  { label: "Red", value: "red" },
  { label: "Blue", value: "blue" },
]

const anatomies = Object.entries(allComponents)
  .map(([name, Anatomy]) => ({
    // "angle-slider" -> "Angle Slider"
    label: name.replace(/(^|-)(\w)/g, (_, dash, char) => (dash ? " " : "") + char.toUpperCase()),
    Anatomy,
  }))
  .sort((a, b) => a.label.localeCompare(b.label))

export default function Page() {
  const [accent, setAccent] = useState(accents[0].value)
  const gradient = createGradient(accent).value

  return (
    <main>
      <div className="anatomy">
        <div className="anatomy-toolbar">
          {accents.map((item) => (
            <button key={item.value} aria-pressed={accent === item.value} onClick={() => setAccent(item.value)}>
              {/* The gradient, not the raw accent, is what the cards show */}
              <span className="anatomy-swatch" style={{ background: createGradient(item.value).value }} />
              {item.label}
            </button>
          ))}
          <span className="anatomy-count">{anatomies.length} components</span>
        </div>

        <ul className="anatomy-grid">
          {anatomies.map(({ label, Anatomy }) => (
            <li key={label} className="anatomy-card">
              <div className="anatomy-preview" style={{ background: gradient }}>
                <Anatomy accentColor={accent} />
              </div>
              {label}
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
