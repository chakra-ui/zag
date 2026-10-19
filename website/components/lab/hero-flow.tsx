"use client"

import { useEffect, useState } from "react"
import { Box, Grid, HStack, Stack, styled } from "styled-system/jsx"
import { ArtZig } from "./art"
import { Eyebrow } from "./kit"

type Frame = {
  event: string
  state: "idle" | "open"
  highlighted: string | null
}

const script: Frame[] = [
  { event: "TRIGGER_CLICK", state: "open", highlighted: null },
  { event: "ARROW_DOWN", state: "open", highlighted: "edit" },
  { event: "ARROW_DOWN", state: "open", highlighted: "duplicate" },
  { event: "TYPEAHEAD · a", state: "open", highlighted: "archive" },
  { event: "ESCAPE", state: "idle", highlighted: null },
]

const items = ["edit", "duplicate", "archive"]

const Panel = styled("div", {
  base: {
    borderWidth: "1px",
    borderColor: "border.bold",
    borderRadius: "lg",
    bg: "bg",
    overflow: "hidden",
  },
})

const PanelHead = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: "3",
    py: "2",
    borderBottomWidth: "1px",
    borderColor: "border",
    bg: "bg.muted",
    fontFamily: "mono",
    fontSize: "11px",
    color: "text.muted",
  },
})

const Line = styled("div", {
  base: {
    fontFamily: "mono",
    fontSize: "12px",
    lineHeight: "1.9",
    px: "3",
    whiteSpace: "nowrap",
    transition: "background 600ms, color 600ms",
  },
  variants: {
    fresh: {
      true: { bg: "var(--zf-as)", color: "var(--zf-a)" },
      false: { color: "text.subtle" },
    },
  },
})

const css = `
.zf { --zf-a: #48bb78; --zf-as: rgba(72,187,120,.12) }
html:not(.dark) .zf { --zf-a: #2f855a; --zf-as: rgba(47,133,90,.1) }
@keyframes zf-in { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: none } }
.zf-in { animation: zf-in 360ms cubic-bezier(.2,.7,.2,1) }
@media (prefers-reduced-motion: reduce) { .zf-in { animation: none } }
`

function useScript() {
  const [tick, setTick] = useState(2)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = setInterval(() => setTick((t) => t + 1), 1500)
    return () => clearInterval(id)
  }, [])
  return tick
}

export function HeroFlow() {
  const tick = useScript()
  const at = (n: number) =>
    script[((n % script.length) + script.length) % script.length]
  const now = at(tick)
  const prev = at(tick - 1)
  const log = [0, 1, 2, 3, 4, 5].map((i) => ({
    frame: at(tick - i),
    key: tick - i,
  }))

  const props = [
    ["aria-expanded", String(now.state === "open")],
    ["data-state", now.state === "open" ? '"open"' : '"closed"'],
    [
      "aria-activedescendant",
      now.highlighted ? `"menu:${now.highlighted}"` : "undefined",
    ],
    ["data-highlighted", now.highlighted ? `"${now.highlighted}"` : "—"],
  ]
  const before = [
    String(prev.state === "open"),
    prev.state === "open" ? '"open"' : '"closed"',
    prev.highlighted ? `"menu:${prev.highlighted}"` : "undefined",
    prev.highlighted ? `"${prev.highlighted}"` : "—",
  ]

  return (
    <Box
      as="figure"
      className="zf"
      w="full"
      aria-label="Events flow into the menu machine, which returns updated ARIA and data props"
    >
      <style>{css}</style>
      <Grid columns={{ base: 1, md: 2 }} gap="4" alignItems="stretch">
        <Panel>
          <PanelHead>
            <span>events</span>
            <span>send()</span>
          </PanelHead>
          <Stack gap="0" py="2">
            {log.map(({ frame, key }, i) => (
              <Line
                key={key}
                className={i === 0 ? "zf-in" : undefined}
                fresh={i === 0}
                opacity={1 - i * 0.14}
              >
                → {frame.event}
              </Line>
            ))}
          </Stack>
        </Panel>

        <Panel>
          <PanelHead>
            <span>menu.machine</span>
            <HStack gap="1.5">
              <Box w="1.5" h="1.5" rounded="full" bg="var(--zf-a)" />
              <span>live</span>
            </HStack>
          </PanelHead>
          <Box p="4">
            <HStack gap="2">
              {(["idle", "open"] as const).map((s) => (
                <styled.span
                  key={s}
                  fontFamily="mono"
                  fontSize="12px"
                  px="2.5"
                  py="1"
                  rounded="full"
                  borderWidth="1px"
                  transition="all 300ms"
                  borderColor={now.state === s ? "var(--zf-a)" : "border"}
                  color={now.state === s ? "var(--zf-a)" : "text.muted"}
                  bg={now.state === s ? "var(--zf-as)" : "transparent"}
                >
                  {s}
                </styled.span>
              ))}
            </HStack>
            <Stack gap="1" mt="4">
              {items.map((item) => (
                <Box
                  key={item}
                  fontSize="13px"
                  px="2.5"
                  py="1.5"
                  rounded="md"
                  transition="all 250ms"
                  opacity={now.state === "open" ? 1 : 0.35}
                  bg={now.highlighted === item ? "bg.muted" : "transparent"}
                  color={now.highlighted === item ? "text.bold" : "text.muted"}
                  borderLeftWidth="2px"
                  borderColor={
                    now.highlighted === item ? "var(--zf-a)" : "transparent"
                  }
                >
                  {item}
                </Box>
              ))}
            </Stack>
          </Box>
        </Panel>

        <Panel gridColumn={{ md: "1 / -1" }}>
          <PanelHead>
            <span>connect()</span>
            <span>props</span>
          </PanelHead>
          <Stack gap="0" py="2">
            {props.map(([name, value], i) => {
              const changed = before[i] !== value
              return (
                <Line
                  key={name + tick}
                  fresh={changed}
                  className={changed ? "zf-in" : undefined}
                >
                  {name}=
                  <styled.span color={changed ? "inherit" : "text.bold"}>
                    {value}
                  </styled.span>
                </Line>
              )
            })}
          </Stack>
        </Panel>
      </Grid>

      <Box mt="8" px="1">
        <ArtZig />
        <HStack justify="space-between" mt="3" flexWrap="wrap" gap="2">
          {[
            "@zag-js/react",
            "@zag-js/vue",
            "@zag-js/solid",
            "@zag-js/svelte",
            "@zag-js/preact",
          ].map((pkg) => (
            <styled.span
              key={pkg}
              fontFamily="mono"
              fontSize="11px"
              color="text.muted"
              borderWidth="1px"
              borderColor="border"
              rounded="full"
              px="2.5"
              py="1"
            >
              {pkg}
            </styled.span>
          ))}
        </HStack>
        <Eyebrow mt="4">same props, every adapter</Eyebrow>
      </Box>
    </Box>
  )
}
