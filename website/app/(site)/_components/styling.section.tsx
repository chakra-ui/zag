"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as tabs from "@zag-js/tabs"
import { TwoToneHeading } from "components/ui/heading"
import { stylingCopy } from "lib/home"
import { useId } from "react"
import { Box, styled } from "styled-system/jsx"
import { stylingBand } from "styled-system/recipes"
import { gutter, StateLabel } from "./shared"
import { CssModulesDatePicker } from "./styling/css-modules-date-picker"
import { PandaSlider } from "./styling/panda-slider"
import { TailwindTags } from "./styling/tailwind-tags"

const tools = [
  {
    value: "panda",
    name: "Panda",
    part: "Slider",
    logo: "/logos/panda.svg",
    Demo: PandaSlider,
  },
  {
    value: "tailwind",
    name: "Tailwind",
    part: "Tags input",
    logo: "/logos/tailwind.svg",
    Demo: TailwindTags,
  },
  {
    value: "css-modules",
    name: "CSS Modules",
    part: "Date picker",
    logo: "/logos/css-modules.svg",
    Demo: CssModulesDatePicker,
  },
]

export function StylingSection() {
  const service = useMachine(tabs.machine, {
    id: useId(),
    defaultValue: "panda",
  })
  const api = tabs.connect(service, normalizeProps)
  const band = stylingBand()
  return (
    <section id="styling" className={`dark ${band.root}`}>
      <Box
        maxW="1440px"
        mx="auto"
        w="full"
        px={gutter}
        display="flex"
        flexDirection="column"
        gap="inherit"
      >
        <div className={band.header}>
          <TwoToneHeading
            eyebrow={<StateLabel index="05" name="styling" />}
            title={stylingCopy.title}
            accent={stylingCopy.accent}
            size="section"
          />
          <styled.p
            maxW="430px"
            fontSize="16px"
            lineHeight="1.7"
            color="fg.muted"
            textWrap="pretty"
          >
            {stylingCopy.lead}
          </styled.p>
        </div>
        <div {...api.getRootProps()}>
          <div {...api.getListProps()} className={band.list}>
            {tools.map((tool) => (
              <button
                key={tool.value}
                {...api.getTriggerProps({ value: tool.value })}
                className={band.trigger}
                data-tool={tool.value}
              >
                <span className={band.logo} data-tool={tool.value}>
                  <img src={tool.logo} alt="" />
                </span>
                <span className={band.name}>{tool.name}</span>
                <span className={band.part}>{tool.part}</span>
              </button>
            ))}
            <div
              {...api.getIndicatorProps()}
              className={band.indicator}
              data-tool={api.value}
            />
          </div>
          {tools.map((tool) => (
            <div
              key={tool.value}
              {...api.getContentProps({ value: tool.value })}
              className={band.frame}
            >
              {api.value === tool.value && <tool.Demo />}
            </div>
          ))}
        </div>
      </Box>
    </section>
  )
}
