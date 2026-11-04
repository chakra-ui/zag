"use client"

import { cx } from "styled-system/css"
import { Arrow } from "./arrow"
import {
  chip,
  codeKey,
  codeLine,
  codeValue,
  evt,
  focusLine,
  partsPlate,
  stage,
  stageWrap,
  tier,
  uiItem,
  uiMenu,
  uiTrigger,
} from "./hero.css"
import { plate, tierName } from "./home.css"
import { useStep } from "./use-step"

const steps = [
  { state: 0, event: "", highlight: -1, focus: "trigger" },
  { state: 1, event: "TRIGGER_CLICK", highlight: -1, focus: "trigger" },
  { state: 2, event: "ANIMATION.END", highlight: 0, focus: "content" },
  { state: 2, event: "ARROW_DOWN", highlight: 1, focus: "content" },
  { state: 2, event: "ARROW_DOWN", highlight: 2, focus: "content" },
  { state: 3, event: "ESCAPE", highlight: -1, focus: "trigger" },
]

const states = ["closed", "opening", "open", "closing"]
const items = ["Rename", "Duplicate", "Archive"]

// Re-keys a value so it flashes once each time it changes
function Value({ children }: { children: string }) {
  return (
    <span key={children} className={codeValue}>
      {children}
    </span>
  )
}

export function HeroMachine() {
  const [ref, index] = useStep<HTMLElement>(steps.length, 1800)
  const step = steps[index]
  const open = step.state === 1 || step.state === 2
  const menuState =
    step.state === 2 ? "open" : step.state === 0 ? "closed" : "half"

  return (
    <div className={stageWrap}>
      <figure
        className={stage}
        ref={ref}
        aria-label="A menu machine stepping through its states while its parts and styled menu update"
      >
        <div className={tier}>
          <p className={tierName}>
            <b>Machine</b> · decides what happens
          </p>
          <div className={plate}>
            {states.map((name, i) => (
              <div
                key={name}
                className={chip}
                data-current={i === step.state || undefined}
              >
                <i />
                {name}
              </div>
            ))}
            <p className={evt}>event: {step.event || "none"}</p>
          </div>
        </div>
        <Arrow />
        <div className={tier}>
          <p className={tierName}>
            <b>Parts</b> · wire up your elements
          </p>
          <div className={partsPlate}>
            <div className={codeLine}>
              <span className={codeKey}>trigger</span> aria-expanded=
              <Value>{`"${open}"`}</Value>
            </div>
            <div className={codeLine}>
              <span className={codeKey}>content</span> data-state=
              <Value>{`"${states[step.state]}"`}</Value>
            </div>
            {items.map((item, i) => (
              <div key={item} className={codeLine}>
                <span className={codeKey}>item</span> {item}{" "}
                <Value>{i === step.highlight ? "data-highlighted" : ""}</Value>
              </div>
            ))}
            <div className={cx(codeLine, focusLine)}>
              <span className={codeKey}>focus</span> <Value>{step.focus}</Value>
            </div>
          </div>
        </div>
        <Arrow />
        <div className={tier}>
          <p className={tierName}>
            <b>Your UI</b> · looks how you want
          </p>
          <div className={plate}>
            <span className={uiTrigger}>Edit</span>
            <div className={uiMenu} data-state={menuState}>
              {items.map((item, i) => (
                <span
                  key={item}
                  className={uiItem}
                  data-highlighted={i === step.highlight || undefined}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </figure>
    </div>
  )
}
