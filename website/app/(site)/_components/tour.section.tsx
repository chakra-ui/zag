import { HMini } from "components/illustrations/minis"
import { hCopy, tour } from "lib/home"
import { Box, Grid, HStack, styled } from "styled-system/jsx"
import { gutter } from "./shared"

export function TourSection() {
  return (
    <Box px={gutter} pt="24">
      <HStack
        justify="space-between"
        alignItems="baseline"
        pb="4"
        gap="4"
        flexWrap="wrap"
      >
        <styled.p textStyle="eyebrow" color="fg.subtle">
          How it works
        </styled.p>
        <styled.p fontSize="14px" color="fg.subtle">
          {hCopy.hero.tour}
        </styled.p>
      </HStack>
      <Grid
        gridTemplateColumns={{
          base: "repeat(2, minmax(0, 1fr))",
          md: "repeat(5, minmax(0, 1fr))",
        }}
        gap="1px"
        bg="border"
        borderWidth="1px"
        borderColor="border"
      >
        {tour.map((item) => (
          <styled.a
            key={item.state}
            href={`#${item.state}`}
            className="group"
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap="5"
            px="5"
            pt="6"
            pb="5"
            bg="bg.page"
            transitionProperty="background"
            transitionDuration="normal"
            _hover={{ bg: "bg.raised" }}
            focusVisibleRing="inside"
          >
            <Box
              w="full"
              maxW="148px"
              color="fg.subtle"
              transitionProperty="color, transform"
              transitionDuration="normal"
              _groupHover={{ color: "fg", transform: "translateY(-2px)" }}
              _motionReduce={{ _groupHover: { transform: "none" } }}
            >
              <HMini kind={item.mini} />
            </Box>
            <Box textAlign="center">
              <styled.p
                fontFamily="mono"
                fontSize="11px"
                color="fg.subtle"
                _groupHover={{ color: "accent" }}
              >
                {item.index} · &quot;{item.state}&quot;
              </styled.p>
              <styled.p mt="1" fontSize="15px" fontWeight="medium" color="fg">
                {item.label}
              </styled.p>
            </Box>
          </styled.a>
        ))}
      </Grid>
    </Box>
  )
}
