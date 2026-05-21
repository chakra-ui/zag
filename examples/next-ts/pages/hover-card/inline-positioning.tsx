import * as hoverCard from "@zag-js/hover-card"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId } from "react"

export default function Page() {
  const service = useMachine(hoverCard.machine, {
    id: useId(),
    openDelay: 100,
    positioning: {
      placement: "top",
      inline: true,
      gutter: 8,
    },
  })

  const api = hoverCard.connect(service, normalizeProps)

  return (
    <main
      style={{
        display: "grid",
        minHeight: "100vh",
        padding: "80px",
        placeItems: "center",
      }}
    >
      <article
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
          maxWidth: "360px",
          padding: "24px",
        }}
      >
        <h1 style={{ fontSize: "20px", marginBottom: "16px" }}>Inline positioning</h1>
        <p style={{ lineHeight: 1.7, marginBottom: "16px" }}>
          Hover the wrapped inline trigger in this sentence:{" "}
          <a
            href="https://zagjs.com"
            rel="noreferrer"
            target="_blank"
            {...api.getTriggerProps()}
            style={{
              color: "#2563eb",
              fontWeight: 600,
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            Zag.js hover card inline positioning follows the exact wrapped line you enter
          </a>
          , which keeps the preview anchored to the visible text fragment.
        </p>
        <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.6 }}>
          The trigger is intentionally long enough to wrap across multiple lines inside this narrow container.
        </p>
      </article>

      {api.open && (
        <Portal>
          <div {...api.getPositionerProps()}>
            <div
              {...api.getContentProps()}
              style={{
                background: "white",
                border: "1px solid #cbd5e1",
                borderRadius: "12px",
                boxShadow: "0 16px 40px rgba(15, 23, 42, 0.16)",
                padding: "14px",
                width: "260px",
              }}
            >
              <div {...api.getArrowProps()}>
                <div {...api.getArrowTipProps()} />
              </div>
              <strong>Anchored to inline text</strong>
              <p style={{ color: "#475569", fontSize: "14px", lineHeight: 1.5, marginTop: "8px" }}>
                The inline middleware picks the text rect closest to the pointer, instead of the whole wrapped link box.
              </p>
            </div>
          </div>
        </Portal>
      )}
    </main>
  )
}
