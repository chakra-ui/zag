"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as tagsInput from "@zag-js/tags-input"
import { CodePanel } from "components/ui/code-panel"
import { Inspector } from "components/ui/inspector"
import { useId } from "react"
import { HStack, styled } from "styled-system/jsx"
import { codeTag, demoTags, stylingBand } from "styled-system/recipes"
import { attrRows } from "./attrs"

const code = `<div {...api.getControlProps()} className="flex flex-wrap gap-1.5 rounded-xl border p-2 data-focus:ring-2">
  {api.value.map((value, index) => (
    <span {...api.getItemProps({ index, value })}>
      <div {...api.getItemPreviewProps({ index, value })}
        className="rounded-full bg-zinc-800 px-2.5 py-1 data-highlighted:bg-sky-500 data-highlighted:text-white">
        {value} <button {...api.getItemDeleteTriggerProps({ index, value })}>×</button>
      </div>
    </span>
  ))}
  <input {...api.getInputProps()} />
</div>`

const hints = [
  { keys: ["←", "→"], label: "move between tags" },
  { keys: ["⌫"], label: "delete" },
]

export function TailwindTags() {
  const api = tagsInput.connect(
    useMachine(tagsInput.machine, {
      id: useId(),
      defaultValue: ["react", "vue", "svelte", "solid"],
      editable: false,
    }),
    normalizeProps,
  )
  const band = stylingBand()
  const styles = demoTags()
  const index = Math.max(
    0,
    api.value.findIndex((value) => value === api.highlightedValue),
  )
  const inspected = api.value[index]
  const preview = inspected
    ? api.getItemPreviewProps({ index, value: inspected })
    : {}
  return (
    <>
      <div className={band.top}>
        <div className={band.stage}>
          <div {...api.getRootProps()} className={styles.root}>
            <label {...api.getLabelProps()} className={styles.label}>
              Frameworks
            </label>
            <div {...api.getControlProps()} className={styles.control}>
              {api.value.map((value, i) => (
                <span key={value} {...api.getItemProps({ index: i, value })}>
                  <div
                    {...api.getItemPreviewProps({ index: i, value })}
                    className={styles.itemPreview}
                  >
                    <span {...api.getItemTextProps({ index: i, value })}>
                      {value}
                    </span>
                    <button
                      {...api.getItemDeleteTriggerProps({ index: i, value })}
                      className={styles.itemDeleteTrigger}
                    >
                      ×
                    </button>
                  </div>
                  <input {...api.getItemInputProps({ index: i, value })} />
                </span>
              ))}
              <input
                {...api.getInputProps()}
                className={styles.input}
                placeholder="Add a framework"
              />
            </div>
            <input {...api.getHiddenInputProps()} />
            <HStack gap="1.5" flexWrap="wrap" mt="0.5">
              {hints.map((hint) => (
                <HStack key={hint.label} gap="1.5" me="2">
                  {hint.keys.map((key) => (
                    <kbd key={key} className={codeTag({ variant: "outline" })}>
                      {key}
                    </kbd>
                  ))}
                  <styled.span fontSize="12px" color="fg.subtle">
                    {hint.label}
                  </styled.span>
                </HStack>
              ))}
            </HStack>
          </div>
        </div>
        <div className={band.side}>
          <Inspector
            tone="tailwind"
            part="data-tags-input-item-preview"
            rows={[
              ...attrRows(
                preview,
                ["data-highlighted", "data-value", "data-disabled"],
                "data-highlighted",
              ),
              ...attrRows(api.getControlProps(), ["data-focus"]),
            ]}
          />
        </div>
      </div>
      <div className={band.code}>
        <CodePanel
          tone="tailwind"
          file="TagsInput.tsx"
          language="tsx"
          code={code}
          highlight={[5]}
        />
      </div>
    </>
  )
}
