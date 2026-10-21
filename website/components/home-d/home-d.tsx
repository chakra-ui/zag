import { Footer } from "components/footer"
import { cells } from "components/lab/cells"
import {
  Band,
  Btn,
  Display,
  Frame,
  FrameworkRow,
  Lead,
  Pad,
  Stats,
  Title,
} from "components/lab/kit"
import { TopNav } from "components/nav/top-nav"
import Link from "next/link"
import type { ReactNode } from "react"
import { Box, Grid, HStack, Stack, styled } from "styled-system/jsx"
import {
  adapters,
  heroCode,
  looks,
  machineImport,
  stepCode,
  withoutZag,
  withZag,
  type HeroFramework,
} from "./code"
import { CodeHtml } from "./code-html"
import { HeroCode } from "./hero-code"
import { highlight } from "./highlight"
import { InstallPill } from "./install-pill"
import { InspectMenu, LiveMenu, LookMenu } from "./live-menu"
import {
  MiniCheckbox,
  MiniDatePicker,
  MiniRating,
  MiniSlider,
  MiniSwitch,
  MiniTabs,
} from "./live-mini"
import { ToggleCode } from "./toggle-code"

const C = styled("code", {
  base: { fontFamily: "mono", fontSize: "0.86em", color: "text.bold" },
})

function lines(code: string) {
  return code.trim().split("\n").length
}

function Head(props: { title: string; children: ReactNode }) {
  return (
    <Box mb={{ base: "8", md: "10" }}>
      <Title>{props.title}</Title>
      <Lead mt="3">{props.children}</Lead>
    </Box>
  )
}

function Window(props: { file: string; meta?: string; children: ReactNode }) {
  return (
    <Box
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
      bg="bg.code.block"
      overflow="hidden"
      minW="0"
    >
      <HStack
        justify="space-between"
        h="10"
        px="4"
        borderBottomWidth="1px"
        borderColor="border"
        fontFamily="mono"
        fontSize="11px"
        color="text.muted"
      >
        <span>{props.file}</span>
        {props.meta && <span>{props.meta}</span>}
      </HStack>
      {props.children}
    </Box>
  )
}

function Stage(props: { children: ReactNode; label?: string }) {
  return (
    <Box
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
      p={{ base: "5", md: "6" }}
      minW="0"
      display="flex"
      flexDirection="column"
      gap="6"
    >
      {props.label && (
        <styled.p fontFamily="mono" fontSize="11px" color="text.muted">
          {props.label}
        </styled.p>
      )}
      {props.children}
    </Box>
  )
}

function Hero() {
  const panels = (Object.keys(heroCode) as HeroFramework[]).map((id) => ({
    id,
    file: heroCode[id].file,
    code: heroCode[id].code,
    html: highlight(heroCode[id].code, heroCode[id].lang),
  }))
  return (
    <Box
      px={{ base: "4", sm: "6", md: "10" }}
      pt={{ base: "12", md: "20" }}
      pb={{ base: "12", md: "20" }}
    >
      <Stack gap="6" mb={{ base: "12", md: "16" }}>
        <Display maxW="16ch">Write the component logic once</Display>
        <Lead fontSize={{ base: "17px", md: "19px" }} maxW="58ch">
          Headless state machines for menus, dialogs, comboboxes and 50+ other
          components, with adapters for React, Vue, Solid, Svelte and Preact.
        </Lead>
        <Stack
          direction={{ base: "column", sm: "row" }}
          gap={{ base: "4", sm: "6" }}
          align={{ base: "flex-start", sm: "flex-end" }}
          mt="2"
        >
          <InstallPill />
          <styled.span
            fontSize="14px"
            fontWeight="medium"
            color="text.muted"
            pb={{ sm: "3.5" }}
            _hover={{ color: "text.bold" }}
          >
            <Link href="/components/react/accordion">Browse components →</Link>
          </styled.span>
        </Stack>
      </Stack>
      <HeroCode panels={panels} />
    </Box>
  )
}

function WithoutBand() {
  return (
    <Band>
      <Pad>
        <Head title="Less code to own">
          <C>connect</C> returns the ARIA attributes, keyboard handlers and
          focus logic for every part.
        </Head>
        <Grid
          gridTemplateColumns={{
            base: "minmax(0, 1fr)",
            lg: "minmax(0, 7fr) minmax(0, 5fr)",
          }}
          gap={{ base: "4", lg: "6" }}
          alignItems="start"
        >
          <ToggleCode
            maxH="560px"
            panels={[
              {
                id: "with",
                label: "With Zag",
                meta: `${lines(withZag)} lines`,
                html: highlight(withZag, "tsx"),
              },
              {
                id: "without",
                label: "Without Zag",
                meta: `${lines(withoutZag)} lines · no typeahead or positioning`,
                html: highlight(withoutZag, "tsx"),
              },
            ]}
          />
          <Stage label="live · the With Zag version">
            <Box minH="200px" display="flex" justifyContent="center" pt="6">
              <LiveMenu />
            </Box>
          </Stage>
        </Grid>
      </Pad>
    </Band>
  )
}

function StepsBand() {
  return (
    <Band>
      <Pad>
        <Head title="Start, connect, spread">
          <C>useMachine</C> starts the menu, and <C>connect</C> turns its state
          into props for each element.
        </Head>
        <Grid
          gridTemplateColumns={{
            base: "minmax(0, 1fr)",
            lg: "minmax(0, 1fr) minmax(0, 1fr)",
          }}
          gap={{ base: "4", lg: "6" }}
        >
          <Window file="1 · create the machine" meta="@zag-js/menu">
            <CodeHtml html={highlight(stepCode.machine, "tsx")} />
          </Window>
          <Window file="2 · render the parts" meta="@zag-js/react">
            <CodeHtml html={highlight(stepCode.parts, "tsx")} />
          </Window>
        </Grid>
        <Box mt={{ base: "4", lg: "6" }}>
          <Stage label="live · the props on the trigger update as you use it">
            <InspectMenu />
          </Stage>
        </Box>
      </Pad>
    </Band>
  )
}

function StyleBand() {
  return (
    <Band>
      <Pad>
        <Head title="Your styles, no overrides">
          Zag ships zero CSS, so you style <C>[data-menu-trigger]</C> and the
          other parts with any tool.
        </Head>
        <Grid
          gridTemplateColumns={{
            base: "minmax(0, 1fr)",
            md: "minmax(0, 1fr) minmax(0, 1fr)",
          }}
          gap={{ base: "4", lg: "6" }}
          alignItems="start"
        >
          {(Object.keys(looks) as (keyof typeof looks)[]).map((name) => (
            <Box
              key={name}
              borderWidth="1px"
              borderColor="border"
              borderRadius="lg"
              minW="0"
            >
              <HStack
                h="10"
                px="4"
                borderBottomWidth="1px"
                borderColor="border"
                fontFamily="mono"
                fontSize="11px"
                color="text.muted"
              >
                <span>{name}.css</span>
              </HStack>
              <Box px="5" pt="6" pb="44" bg="bg">
                <LookMenu name={name} source={looks[name]} />
              </Box>
              <CodeHtml
                html={highlight(looks[name], "css")}
                bg="bg.code.block"
                borderTopWidth="1px"
                borderColor="border"
                borderBottomRadius="lg"
              />
            </Box>
          ))}
        </Grid>
      </Pad>
    </Band>
  )
}

function AnyBand() {
  return (
    <Band>
      <Pad>
        <Head title="Any framework, no rewrite">
          Every adapter runs the same machine, so moving frameworks changes one
          import line.
        </Head>
        <Window file="menu" meta="same machine, five adapters">
          <CodeHtml html={highlight(machineImport, "tsx")} />
          <Box borderTopWidth="1px" borderColor="border">
            {adapters.map((a, i) => (
              <Grid
                key={a.id}
                gridTemplateColumns={{
                  base: "minmax(0, 1fr)",
                  md: "80px minmax(0, 1fr)",
                }}
                alignItems="center"
                borderTopWidth={i ? "1px" : "0"}
                borderColor="border"
              >
                <styled.span
                  display={{ base: "none", md: "block" }}
                  pl="5"
                  fontFamily="mono"
                  fontSize="11px"
                  color="text.muted"
                >
                  {a.id}
                </styled.span>
                <CodeHtml html={highlight(a.code, "tsx")} />
              </Grid>
            ))}
          </Box>
        </Window>
        <Box mt="6">
          <FrameworkRow />
        </Box>
      </Pad>
    </Band>
  )
}

const features = [
  ["Keyboard support", "Arrow keys, Home, End and typeahead already work."],
  ["Focus management", "Focus moves into the menu and returns to the trigger."],
  ["ARIA attributes", "Roles and aria values follow the WAI-ARIA practices."],
  [
    "Tested per framework",
    "Playwright runs the same tests against every adapter.",
  ],
]

function FeatureBand() {
  return (
    <Band>
      <Grid
        className={cells}
        gap="1px"
        borderTopWidth="0"
        gridTemplateColumns={{
          base: "minmax(0, 1fr)",
          sm: "repeat(2, minmax(0, 1fr))",
          xl: "repeat(4, minmax(0, 1fr))",
        }}
      >
        {features.map(([title, body]) => (
          <Box key={title} px={{ base: "5", md: "8" }} py="8">
            <styled.h3 fontSize="16px" fontWeight="semibold" color="text.bold">
              {title}
            </styled.h3>
            <styled.p
              mt="2"
              fontSize="14px"
              lineHeight="1.6"
              color="text.muted"
            >
              {body}
            </styled.p>
          </Box>
        ))}
      </Grid>
    </Band>
  )
}

const minis = [
  { pkg: "switch", el: <MiniSwitch /> },
  { pkg: "slider", el: <MiniSlider /> },
  { pkg: "tabs", el: <MiniTabs /> },
  { pkg: "checkbox", el: <MiniCheckbox /> },
  { pkg: "rating-group", el: <MiniRating /> },
  { pkg: "date-picker", el: <MiniDatePicker /> },
]

function MoreBand() {
  return (
    <Band>
      <Pad pb="0">
        <Head title="50+ components">
          Each component is its own package, so you install only what you use.
        </Head>
      </Pad>
      <Grid
        className={cells}
        gap="1px"
        gridTemplateColumns={{
          base: "minmax(0, 1fr)",
          md: "repeat(2, minmax(0, 1fr))",
          xl: "repeat(3, minmax(0, 1fr))",
        }}
      >
        {minis.map((m) => (
          <Box key={m.pkg} display="flex" flexDirection="column" minW="0">
            <HStack
              justify="space-between"
              px="5"
              h="10"
              fontFamily="mono"
              fontSize="12px"
            >
              <styled.code color="text.bold">@zag-js/{m.pkg}</styled.code>
              <styled.span color="text.muted" _hover={{ color: "text.bold" }}>
                <Link href={`/components/react/${m.pkg}`}>docs →</Link>
              </styled.span>
            </HStack>
            <Box
              flex="1"
              minH="220px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              px="5"
              py="8"
            >
              {m.el}
            </Box>
          </Box>
        ))}
      </Grid>
    </Band>
  )
}

function Closing() {
  return (
    <Band>
      <Pad py={{ base: "16", md: "24" }}>
        <Title>Build your first component today</Title>
        <Stack
          direction={{ base: "column", sm: "row" }}
          gap="4"
          align={{ base: "flex-start", sm: "flex-end" }}
          mt="8"
        >
          <InstallPill />
          <Box pb={{ sm: "1" }}>
            <Btn href="/overview/introduction">Get started →</Btn>
          </Box>
        </Stack>
      </Pad>
    </Band>
  )
}

export function HomeD() {
  return (
    <Box>
      <TopNav />
      <Frame>
        <Hero />
        <WithoutBand />
        <StepsBand />
        <StyleBand />
        <AnyBand />
        <FeatureBand />
        <MoreBand />
        <Band>
          <Stats />
        </Band>
        <Closing />
      </Frame>
      <Footer />
    </Box>
  )
}
