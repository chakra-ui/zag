"use client"

import * as autocomplete from "@zag-js/autocomplete"
import { createFilter } from "@zag-js/i18n-utils"
import { normalizeProps, useMachine } from "@zag-js/react"
import { groupedData } from "@zag-js/shared"
import { Fragment, useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/autocomplete.css"

type Item = (typeof groupedData)[number]

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [value, setValue] = useState("")
  const items = groupedData.filter((item) => contains(item.label, value))

  const collection = autocomplete.collection({ items, groupBy: (item) => item.type })

  const service = useMachine(autocomplete.machine as autocomplete.Machine<Item>, {
    id: useId(),
    collection,
    placeholder: "e.g. apple",
    value,
    onValueChange: (details) => setValue(details.value),
  })

  const api = autocomplete.connect(service, normalizeProps)

  return (
    <>
      <main className="autocomplete">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Produce</label>
          <div {...api.getControlProps()}>
            <input {...api.getInputProps()} />
          </div>
        </div>

        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div {...api.getEmptyProps()}>Nothing found</div>
            <div {...api.getListProps()}>
              {collection.group().map(([type, groupItems], index) => (
                <Fragment key={type}>
                  {index > 0 && <hr {...api.getSeparatorProps()} />}
                  <div {...api.getItemGroupProps({ id: type })}>
                    <div {...api.getItemGroupLabelProps({ htmlFor: type })}>{type}</div>
                    {groupItems.map((item) => (
                      <div key={item.value} {...api.getItemProps({ item })}>
                        <span {...api.getItemTextProps({ item })}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
