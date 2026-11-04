"use client"

import { frameworks } from "./frameworks"
import { frameworkTab } from "./home.css"
import {
  install,
  installCmd,
  installCode,
  installName,
  installPkg,
  installPrompt,
  installSlot,
  installTabs,
} from "./install.css"
import { useTabs } from "./use-tabs"

// The hero install command; Zag tabs underneath swap the framework adapter
export function InstallCommand() {
  const api = useTabs("home-install", "react")

  return (
    <div className={install} {...api.getRootProps()}>
      <div className={installCmd}>
        {frameworks.map((f) => (
          <code
            key={f.pkg}
            className={installCode}
            {...api.getContentProps({ value: f.pkg })}
          >
            <span className={installPrompt}>$</span> npm i{" "}
            <span className={installName}>
              @zag-js/<span className={installSlot}>&lt;component&gt;</span>
            </span>{" "}
            <span className={installPkg}>@zag-js/{f.pkg}</span>
          </code>
        ))}
      </div>
      <div
        className={installTabs}
        {...api.getListProps()}
        aria-label="Framework"
      >
        {frameworks.map((f) => (
          <button
            key={f.name}
            className={frameworkTab}
            aria-label={f.name}
            {...api.getTriggerProps({ value: f.pkg })}
          >
            <f.Icon width={15} height={15} aria-hidden />
            <span aria-hidden="true">{f.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
