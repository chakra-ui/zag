import { Frame } from "components/ui/layout"
import { chapters } from "lib/home"
import { ChapterSection } from "../../_components/chapter.section"
import { ClosingSection } from "../../_components/closing.section"
import { HeroConcept3 } from "../../_components/hero-concept-3"
import { TourSection } from "../../_components/tour.section"

export default function Page() {
  return (
    <Frame>
      <HeroConcept3 />
      <TourSection />
      {chapters.map((c) => (
        <ChapterSection key={c.slug} chapter={c} />
      ))}
      <ClosingSection />
    </Frame>
  )
}
