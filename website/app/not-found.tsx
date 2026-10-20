import { Footer } from "components/footer"
import { Btn, Eyebrow, Frame, Lead, Pad, Title } from "components/lab/kit"
import { TopNav } from "components/nav/top-nav"
import { css } from "styled-system/css"
import { Box, HStack, styled } from "styled-system/jsx"

const accent = { base: "#2f855a", _dark: "#48bb78" }

const nodes = [
  { id: "idle", x: 0, w: 72 },
  { id: "loading", x: 128, w: 96 },
  { id: "not_found", x: 280, w: 128, active: true },
]

const edges = [
  { label: "NAVIGATE", from: 72, to: 128 },
  { label: "MISS", from: 224, to: 280 },
]

const line = css({ color: "border.bold" })
const edge_ = css({ color: "text.subtle" })
const label = css({ color: "text.muted" })
const live = css({ color: accent })

function Chart() {
  return (
    <svg
      viewBox="-1 -1 410 74"
      width="100%"
      aria-hidden="true"
      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      style={{ maxWidth: 520, display: "block" }}
    >
      {edges.map((edge) => (
        <g key={edge.label}>
          <text
            x={(edge.from + edge.to) / 2}
            y="22"
            textAnchor="middle"
            fontSize="8"
            letterSpacing="0.08em"
            fill="currentColor"
            className={label}
          >
            {edge.label}
          </text>
          <g className={edge_}>
            <line
              x1={edge.from}
              y1="48"
              x2={edge.to - 6}
              y2="48"
              stroke="currentColor"
            />
            <path
              d={`M${edge.to - 6} 44 L${edge.to} 48 L${edge.to - 6} 52 Z`}
              fill="currentColor"
            />
          </g>
        </g>
      ))}
      {nodes.map((node) => (
        <g key={node.id} className={node.active ? live : line}>
          <rect
            x={node.x}
            y="32"
            width={node.w}
            height="32"
            rx="16"
            fill={node.active ? "currentColor" : "none"}
            fillOpacity={node.active ? 0.1 : 0}
            stroke="currentColor"
          />
          <text
            x={node.x + node.w / 2}
            y="52"
            textAnchor="middle"
            fontSize="11"
            fill="currentColor"
            className={node.active ? undefined : label}
          >
            {node.id}
          </text>
        </g>
      ))}
    </svg>
  )
}

export default function NotFound() {
  return (
    <Box>
      <TopNav />
      <Frame>
        <Pad as="main" py={{ base: "16", md: "28" }}>
          <Eyebrow mb="3">
            404 · state <styled.span color={accent}>not_found</styled.span>
          </Eyebrow>
          <Title as="h1">This page isn&apos;t in any state we know</Title>
          <Lead mt="4">
            The link may be old, or the page may have moved. Here are a few
            places that definitely exist.
          </Lead>

          <Box
            mt={{ base: "10", md: "14" }}
            p={{ base: "5", md: "8" }}
            borderWidth="1px"
            borderColor="border"
            borderRadius="lg"
            bg="bg.muted"
            maxW="2xl"
          >
            <Chart />
            <styled.p
              mt="5"
              fontFamily="mono"
              fontSize="12px"
              color="text.muted"
            >
              route.state ={" "}
              <styled.span color={accent}>&quot;not_found&quot;</styled.span>
            </styled.p>
          </Box>

          <HStack gap="3" flexWrap="wrap" mt={{ base: "10", md: "12" }}>
            <Btn href="/">Go home</Btn>
            <Btn href="/overview/introduction" tone="ghost">
              Read the docs
            </Btn>
            <Btn href="/components/react/accordion" tone="ghost">
              Browse components
            </Btn>
          </HStack>
          <styled.p mt="5" fontSize="14px" color="text.muted">
            Looking for something specific? Press{" "}
            <styled.kbd
              fontFamily="mono"
              fontSize="12px"
              px="1.5"
              py="0.5"
              borderWidth="1px"
              borderColor="border"
              borderRadius="sm"
              color="text.bold"
            >
              ⌘K
            </styled.kbd>{" "}
            or{" "}
            <styled.kbd
              fontFamily="mono"
              fontSize="12px"
              px="1.5"
              py="0.5"
              borderWidth="1px"
              borderColor="border"
              borderRadius="sm"
              color="text.bold"
            >
              Ctrl K
            </styled.kbd>{" "}
            to search.
          </styled.p>
        </Pad>
        <Box borderTopWidth="1px" borderColor="border" />
      </Frame>
      <Footer />
    </Box>
  )
}
