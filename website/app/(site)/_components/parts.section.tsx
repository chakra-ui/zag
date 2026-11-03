import { CodePanel } from "components/ui/code-panel"
import { TwoToneHeading } from "components/ui/heading"
import { chapterCopy } from "lib/home"
import { Box, Grid, styled } from "styled-system/jsx"
import { PartsDemo } from "./parts-demo"
import { gutter, StateLabel } from "./shared"

export function PartsSection() {
  const copy = chapterCopy.parts
  return (
    <Grid
      id="parts"
      scrollMarginTop="80px"
      gridTemplateColumns={{ base: "1fr", lg: "minmax(0, 1fr) 440px" }}
      gap={{ base: "10", lg: "20" }}
      alignItems="center"
      mx={gutter}
      py="20"
      borderBottomWidth="1px"
      borderColor="border.subtle"
    >
      <Grid
        gridTemplateColumns={{ base: "1fr", md: "260px minmax(0, 1fr)" }}
        bg="bg.raised"
        borderWidth="1px"
        borderColor="border"
        rounded="2xl"
        overflow="hidden"
      >
        <Box px="12" py="12">
          <PartsDemo />
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          pe="10"
          py="10"
        >
          {copy.getters.map((g, i) => (
            <Box
              key={g.call}
              py="4"
              borderBottomWidth={i < copy.getters.length - 1 ? "1px" : "0"}
              borderColor="border"
            >
              <styled.p fontFamily="mono" fontSize="12px" color="accent">
                {g.call}
              </styled.p>
              <styled.p
                mt="1"
                fontSize="13px"
                lineHeight="1.55"
                color="fg.muted"
              >
                {g.returns}
              </styled.p>
            </Box>
          ))}
        </Box>
      </Grid>
      <Box>
        <TwoToneHeading
          eyebrow={<StateLabel index="03" name="parts" />}
          title={copy.title}
          accent={copy.accent}
          lead={copy.lead}
          size="section"
        />
        <Box
          mt="6"
          bg="bg.raised"
          borderWidth="1px"
          borderColor="border"
          rounded="lg"
        >
          <CodePanel language="tsx" code={copy.code} />
        </Box>
      </Box>
    </Grid>
  )
}
