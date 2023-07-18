import { AccordionAnatomy } from "@zag-js/anatomy-icons"

export default function Page() {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, overflow: "scroll", maxHeight: "100%" }}>
      <div
        style={{
          padding: "12px",
          background: "linear-gradient(112deg, #41B883 0%, #299464 100%)",
        }}
      >
        <AccordionAnatomy accentColor="#2CFF80" />
      </div>
      <div
        style={{
          padding: "12px",
          background: "linear-gradient(112deg, #BB4141 0%, #942929 100%)",
        }}
      >
        <AccordionAnatomy accentColor="red" />
      </div>
    </div>
  )
}
