import { MetaProvider, Title } from "@solidjs/meta"
import { A, Router, useLocation } from "@solidjs/router"
import { FileRoutes } from "@solidjs/start/router"
import { dataAttr } from "@zag-js/dom-query"
import { componentRoutesData, getComponentByPath, isKnownComponent } from "@zag-js/shared"
import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/accordion.module.css"
import "../../../shared/src/css/cascade-select.module.css"
import "../../../shared/src/css/angle-slider.module.css"
import "../../../shared/src/css/anatomy.module.css"
import "../../../shared/src/css/avatar.module.css"
import "../../../shared/src/css/carousel.module.css"
import "../../../shared/src/css/checkbox.module.css"
import "../../../shared/src/css/clipboard.module.css"
import "../../../shared/src/css/collapsible.module.css"
import "../../../shared/src/css/color-picker.module.css"
import "../../../shared/src/css/combobox.module.css"
import "../../../shared/src/css/date-input.module.css"
import "../../../shared/src/css/date-picker.module.css"
import "../../../shared/src/css/dialog.module.css"
import "../../../shared/src/css/editable.module.css"
import "../../../shared/src/css/file-upload.module.css"
import "../../../shared/src/css/floating-panel.module.css"
import "../../../shared/src/css/hover-card.module.css"
import "../../../shared/src/css/image-cropper.module.css"
import "../../../shared/src/css/listbox.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/marquee.module.css"
import "../../../shared/src/css/menu.module.css"
import "../../../shared/src/css/navigation-menu.module.css"
import "../../../shared/src/css/navigation-menu-viewport.module.css"
import "../../../shared/src/css/number-input.module.css"
import "../../../shared/src/css/scroll-area.module.css"
import "../../../shared/src/css/steps.module.css"
import "../../../shared/src/css/swap.module.css"
import "../../../shared/src/css/pagination.module.css"
import "../../../shared/src/css/password-input.module.css"
import "../../../shared/src/css/pin-input.module.css"
import "../../../shared/src/css/popover.module.css"
import "../../../shared/src/css/presence.module.css"
import "../../../shared/src/css/progress.module.css"
import "../../../shared/src/css/qr-code.module.css"
import "../../../shared/src/css/radio-group.module.css"
import "../../../shared/src/css/rating-group.module.css"
import "../../../shared/src/css/segmented-control.module.css"
import "../../../shared/src/css/select.module.css"
import "../../../shared/src/css/signature-pad.module.css"
import "../../../shared/src/css/slider.module.css"
import "../../../shared/src/css/splitter.module.css"
import "../../../shared/src/css/switch.module.css"
import "../../../shared/src/css/tabs.module.css"
import "../../../shared/src/css/tags-input.module.css"
import "../../../shared/src/css/timer.module.css"
import "../../../shared/src/css/toc.module.css"
import "../../../shared/src/css/toast.module.css"
import "../../../shared/src/css/toggle-group.module.css"
import "../../../shared/src/css/toggle.module.css"
import "../../../shared/src/css/tooltip.module.css"
import "../../../shared/src/css/tour.module.css"
import "../../../shared/src/css/tree-view.module.css"
import "./app.module.css"
import { For, Suspense } from "solid-js"

export default function App() {
  return (
    <div class="page">
      <Router
        preload
        root={(props) => {
          const location = useLocation()
          const currentComponent = () => {
            const pathname = location.pathname.split("?")[0] || "/"
            const pathnameComponent = pathname.split("/").filter(Boolean)[0] ?? ""
            return getComponentByPath(pathname) ?? (isKnownComponent(pathnameComponent) ? pathnameComponent : "")
          }

          return (
            <MetaProvider>
              <Title>Zag.js + Solid</Title>
              <aside class="nav">
                <header>Zagjs</header>
                <For each={componentRoutesData} fallback={<div>Loading...</div>}>
                  {(component) => (
                    <A data-active={dataAttr(currentComponent() === component.slug)} href={`/${component.slug}`}>
                      {component.label}
                    </A>
                  )}
                </For>
              </aside>
              <Suspense>{props.children}</Suspense>
            </MetaProvider>
          )
        }}
      >
        <FileRoutes />
      </Router>
    </div>
  )
}
