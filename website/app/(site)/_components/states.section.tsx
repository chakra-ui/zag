import { HeroStatefloor } from "components/illustrations/statefloor"
import { TwoToneHeading } from "components/ui/heading"
import { chapterCopy } from "lib/home"
import { Fragment } from "react"
import { Box, Grid } from "styled-system/jsx"
import { stateStepper, termList } from "styled-system/recipes"
import { gutter, StateLabel } from "./shared"

export function StatesSection() {
  const copy = chapterCopy.states
  const list = termList()
  const stepper = stateStepper()
  return (
    <Grid
      id="states"
      scrollMarginTop="80px"
      gridTemplateColumns={{ base: "1fr", lg: "440px minmax(0, 1fr)" }}
      gap={{ base: "10", lg: "20" }}
      alignItems="center"
      mx={gutter}
      py="20"
      borderBottomWidth="1px"
      borderColor="border.subtle"
    >
      <Box>
        <TwoToneHeading
          eyebrow={<StateLabel index="01" name="states" />}
          title={copy.title}
          accent={copy.accent}
          lead={copy.lead}
          size="section"
        />
        <dl className={list.root}>
          {copy.terms.map((t) => (
            <div key={t.term} className={list.item}>
              <dt className={list.term}>{t.term}</dt>
              <dd className={list.body}>{t.body}</dd>
            </div>
          ))}
        </dl>
      </Box>
      <Box
        borderWidth="1px"
        borderColor="border"
        rounded="2xl"
        overflow="hidden"
        bg="bg.page"
      >
        <Box px="10" pt="5" pb="2">
          <HeroStatefloor />
        </Box>
        <div className={stepper.root}>
          {copy.steps.map((s) => (
            <Fragment key={s.state}>
              <span
                className={stepper.step}
                data-active={s.active || undefined}
              >
                {s.state}
              </span>
              {s.event && <span className={stepper.event}>{s.event} →</span>}
            </Fragment>
          ))}
        </div>
      </Box>
    </Grid>
  )
}
