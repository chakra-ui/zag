import { Frame } from "components/ui/layout"
import { chapters } from "lib/home"
import { ChapterSection } from "../../_components/chapter.section"
import { ClosingSection } from "../../_components/closing.section"
import { HeroConcept2 } from "../../_components/hero-concept-2"
import { TourSection } from "../../_components/tour.section"

export default function Page() {
  return (
    <Frame>
      <HeroConcept2 />
      <TourSection />
      {chapters.map((c) => (
        <ChapterSection key={c.slug} chapter={c} />
      ))}
      <ClosingSection />
    </Frame>
  )
}
