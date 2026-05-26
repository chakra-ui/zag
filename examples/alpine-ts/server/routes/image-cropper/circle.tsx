import { handlePositions, imageCropperControls } from "@zag-js/shared"
import { defineHandler } from "nitro/h3"
import { Controls } from "../../components/controls"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/image-cropper.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data="{...imageCropper(), zoom: 1, rotation: 0}"
          x-image-cropper="{
            id: $id('image-cropper'),
            zoom,
            onZoomChange(details) {
              zoom = details.zoom;
            },
            rotation,
            onRotationChange(details) {
              rotation  = details.rotation;
            },
            cropShape: 'circle',
            ...context,
          }"
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="image-cropper">
            <div x-image-cropper:root>
              <div x-image-cropper:viewport>
                <img src="https://picsum.photos/seed/a/500/300" x-image-cropper:image />
                <div x-image-cropper:selection>
                  {handlePositions.map((position) => (
                    <div x-image-cropper:handle={`{position: '${position}'}`}>
                      <div />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <label>
              Zoom:
              <input
                type="range"
                x-bind:min="_x_image_cropper_service.prop('minZoom')"
                x-bind:max="_x_image_cropper_service.prop('maxZoom')"
                x-bind:step="_x_image_cropper_service.prop('zoomStep')"
                {...{ "x-model.number": "zoom" }}
                data-testid="zoom-slider"
              />
            </label>
            <label>
              Rotation:
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                {...{ "x-model.number": "rotation" }}
                data-testid="rotation-slider"
              />
            </label>
          </main>

          <Toolbar>
            <Controls config={imageCropperControls} slot="controls" />
            <StateVisualizer label="image-cropper" context={["naturalSize", "crop", "zoom", "rotation", "offset"]} />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
