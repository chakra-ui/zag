import * as dialog from "@zag-js/dialog"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"

export default function Page() {
  const service = useMachine(dialog.machine, { id: createUniqueId() })
  const api = createMemo(() => dialog.connect(service, normalizeProps))

  return (
    <main>
      <button {...api().getTriggerProps()}>Open Dialog</button>
      <Portal>
        <div
          {...mergeProps(api().getBackdropProps(), {
            style: {
              "background-color": "rgba(10, 10, 10, 0.5)",
              position: "fixed",
              inset: "0",
              "backdrop-filter": "blur(5px)",
            },
          })}
        />
        <div
          {...mergeProps(api().getPositionerProps(), {
            style: {
              display: "grid",
              "place-items": "center",
              inset: "0",
              overflow: "auto",
              position: "fixed",
              "z-index": "1000",
              "padding-block": "80px",
              "padding-inline": "40px",
              height: "100%",
            },
          })}
        >
          <div
            {...mergeProps(api().getContentProps(), {
              style: {
                display: "flex",
                "flex-direction": "column",
                gap: "6px",
                background: "#fff",
                "border-radius": "8px",
                "padding-block": "8px",
                "padding-inline": "6px",
                "max-width": "200px",
                "max-height": "unset",
              },
            })}
          >
            <h2 {...api().getTitleProps()}>Dialog Title</h2>
            <p {...api().getDescriptionProps()}>
              Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore
              et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
              Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit
              amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna
              aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd
              gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
              sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
              voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
              takimata sanctus est Lorem ipsum dolor sit amet. Duis autem vel eum iriure dolor in hendrerit in vulputate
              velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et
              iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla
              facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod
              tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci
              tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure
              dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis
              at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis
              dolore te feugait nulla facilisi. Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet
              doming id quod mazim placerat facer possim assum. Lorem ipsum dolor sit amet, consectetuer adipiscing
              elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim
              ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo
              consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel
              illum dolore eu feugiat nulla facilisis. At vero eos et accusam et justo duo dolores et ea rebum. Stet
              clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
              consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
              erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd
              gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
              sadipscing elitr, At accusam aliquyam diam diam dolore dolores duo eirmod eos erat, et nonumy sed tempor
              et et invidunt justo labore Stet clita ea et gubergren, kasd magna no rebum. sanctus sea sed takimata ut
              vero voluptua. est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
              sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat. Consetetur sadipscing
              elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
              At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
              sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
              nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
              accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem
              ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
              tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et
              justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus. Lorem ipsum dolor sit
              amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna
              aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd
              gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
              sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
              voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
              takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
              sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero
              eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est
              Lorem ipsum dolor sit amet. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie
              consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim
              qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor
              sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna
              aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit
              lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in
              vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et
              accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait
              nulla facilisi. Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod
              mazim placerat facer possim assum. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
              nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim
              veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo
            </p>
            <button {...api().getCloseTriggerProps()}>Close</button>
          </div>
        </div>
      </Portal>
    </main>
  )
}
