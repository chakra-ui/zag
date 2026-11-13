import { preventBodyScroll } from "@zag-js/remove-scroll"
import { useEffect, useState } from "preact/hooks"
import "@styles/scroll-lock.css"

export default function Page() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    if (!sheetOpen) return
    return preventBodyScroll()
  }, [sheetOpen])

  useEffect(() => {
    if (!confirmOpen) return
    return preventBodyScroll()
  }, [confirmOpen])

  const closeSheet = () => {
    setConfirmOpen(false)
    setSheetOpen(false)
  }

  return (
    <main>
      <div className="nested">
        <p className="hint">
          Open the settings, then the confirmation, and close the confirmation to see the page stay locked.
        </p>
        <button data-testid="open-sheet" onClick={() => setSheetOpen(true)}>
          Open settings
        </button>

        {sheetOpen && (
          <>
            <div className="backdrop" />
            <div
              className="panel sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Workspace settings"
              data-testid="sheet"
            >
              <span className="panel-title">Workspace settings</span>
              <p>Rename the workspace, invite teammates or remove it for good.</p>
              <div className="row">
                <button data-testid="open-confirm" onClick={() => setConfirmOpen(true)}>
                  Delete workspace
                </button>
                <button data-testid="close-sheet" onClick={closeSheet}>
                  Close
                </button>
              </div>
            </div>
          </>
        )}

        {confirmOpen && (
          <>
            <div className="backdrop" data-layer="confirm" />
            <div
              className="panel confirm"
              role="alertdialog"
              aria-modal="true"
              aria-label="Delete workspace?"
              data-testid="confirm"
            >
              <span className="panel-title">Delete workspace?</span>
              <p>All projects in Northwind Design will be removed.</p>
              <div className="row">
                <button data-testid="close-confirm" onClick={() => setConfirmOpen(false)}>
                  Keep workspace
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
