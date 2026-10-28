"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as slider from "@zag-js/slider"
import { CodePanel } from "components/ui/code-panel"
import { Inspector } from "components/ui/inspector"
import { useId } from "react"
import { HStack, Stack, styled } from "styled-system/jsx"
import {
  codeTag,
  demoSlider,
  type DemoSliderVariantProps,
  stylingBand,
} from "styled-system/recipes"
import { attrRows } from "./attrs"

const recipeCode = `import { anatomy } from "@zag-js/slider"

export const slider = sva({
  slots: anatomy.keys(),
  base: {
    track: { h: "2", bg: "gray.700" },
    range: { bg: "green.400" },
    thumb: {
      bg: "white",
      rounded: "full",
      _dragging: { scale: "1.15" },
    },
  },
  variants: { size: { sm: {…}, lg: { thumb: { boxSize: "7" } } } },
})`

const componentCode = `const styles = slider({ size: "lg" })

<div {...api.getTrackProps()} className={styles.track}>
  <div {...api.getRangeProps()} className={styles.range} />
</div>
<div {...api.getThumbProps({ index: 0 })}
  className={styles.thumb} />

// one recipe styles every part, and
// _dragging reads Zag's data-dragging`

interface SliderViewProps {
  size: NonNullable<DemoSliderVariantProps["size"]> & string
  api: slider.Api
  label: string
  inspected?: boolean
}

function SliderView(props: SliderViewProps) {
  const { api, label, size, inspected } = props
  const styles = demoSlider({ size })
  return (
    <div {...api.getRootProps()} className={styles.root}>
      <HStack justify="space-between">
        <label {...api.getLabelProps()} className={styles.label}>
          {label}
        </label>
        <HStack gap="2">
          <span className={codeTag({ variant: "outline" })}>
            size: &quot;{size}&quot;
          </span>
          <output {...api.getValueTextProps()} className={styles.valueText}>
            {api.value[0]}
          </output>
        </HStack>
      </HStack>
      <div {...api.getControlProps()} className={styles.control}>
        <div {...api.getTrackProps()} className={styles.track}>
          <div {...api.getRangeProps()} className={styles.range} />
        </div>
        <div
          {...api.getThumbProps({ index: 0 })}
          className={styles.thumb}
          data-inspected={inspected || undefined}
        >
          <input {...api.getHiddenInputProps({ index: 0 })} />
        </div>
      </div>
    </div>
  )
}

export function PandaSlider() {
  const volume = slider.connect(
    useMachine(slider.machine, {
      id: useId(),
      name: "volume",
      defaultValue: [64],
      thumbSize: { width: 28, height: 28 },
    }),
    normalizeProps,
  )
  const balance = slider.connect(
    useMachine(slider.machine, {
      id: useId(),
      name: "balance",
      defaultValue: [30],
      thumbSize: { width: 16, height: 16 },
    }),
    normalizeProps,
  )
  const band = stylingBand()
  const thumb = volume.getThumbProps({ index: 0 })
  return (
    <>
      <div className={band.top}>
        <Stack className={band.stage} gap="11">
          <SliderView api={volume} label="Volume" size="lg" inspected />
          <SliderView api={balance} label="Balance" size="sm" />
        </Stack>
        <div className={band.side}>
          <Inspector
            tone="panda"
            part="data-slider-thumb"
            rows={attrRows(
              thumb,
              ["data-dragging", "data-focus", "data-orientation"],
              "data-dragging",
            )}
            footer={
              <Stack gap="2.5">
                <styled.p fontFamily="mono" fontSize="11px" color="fg.subtle">
                  anatomy.keys() → slots
                </styled.p>
                <HStack gap="1" flexWrap="wrap">
                  {slider.anatomy.keys().map((key) => (
                    <span
                      key={key}
                      className={codeTag()}
                      data-active={key === "thumb" || undefined}
                    >
                      {key}
                    </span>
                  ))}
                </HStack>
              </Stack>
            }
          />
        </div>
      </div>
      <div className={band.code} data-split="">
        <CodePanel
          tone="panda"
          file="slider.recipe.ts"
          language="tsx"
          code={recipeCode}
          highlight={[4, 11]}
        />
        <CodePanel
          tone="panda"
          file="Slider.tsx"
          language="tsx"
          code={componentCode}
          highlight={[6]}
        />
      </div>
    </>
  )
}
